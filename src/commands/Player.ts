import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageSelectMenu } from "discord.js";
import { Command } from "../Def";
import { LinkedGuild } from "../guilds/LinkedGuild";
import { useSubCommand, optionsNotNull, parseLength, randomColor, wrapVideo, wrapSpotifySong, wrapVideoInfo, getSpotifyId } from "../helpers/FuncHelper";
import * as play from 'play-dl'
import { SpotifyAlbum, SpotifyPlaylist, SpotifyVideo } from "play-dl/dist/Spotify/classes";
import { QueuedMusic } from "../music/QueuedMusic";
import { spotifyApi } from "../Bot";
import { Video } from "play-dl/dist/YouTube/classes/Video";
const config = require('../../config.json')

const args = [
    "add",
    "remove",
    "clear",
    "join",
    "leave",
    "pause",
    "resume",
    "skip",
    "queue",
    "current",
    "loop",
    "search",
    "addspotify"
];

export class CmdPlayer implements Command {
    run = async (inter: CommandInteraction): Promise<void> => {
        LinkedGuild.getBy(inter.guild).then(async lg => {
            const player = lg.getPlayer
            const gm = (inter.member as GuildMember)
            const arg1 = inter.options.getSubcommand().toLowerCase()
            if (args.includes(arg1)) {
                if (arg1 == "add" && optionsNotNull(inter, ["url"])) {
                    //lg, gm, player, config
                    useSubCommand("PlayerAdd", inter, { lg: lg, gm: gm, player: player, config: config })
                } else if (arg1 == "remove" && optionsNotNull(inter, ["index"])) {
                    const done = player.removeQueue(inter.options.getString("index")!!)
                    if (done) {
                        inter.reply("Removed song from queue!")
                    } else {
                        inter.reply("That song is not in queue!")
                    }
                } else if (arg1 == "clear") {
                    player._queue = new Array()
                    inter.reply("Cleared queue!")
                } else if (arg1 == "join") {
                    useSubCommand("PlayerJoin", inter, { gm: gm })
                } else if (arg1 == "leave") {
                    useSubCommand("PlayerLeave", inter, { gm: gm, player: player })
                } else if (arg1 == "pause") {
                    useSubCommand("PlayerPause", inter, { gm: gm, player: player })
                } else if (arg1 == "resume") {
                    useSubCommand("PlayerResume", inter, { gm: gm, player: player })
                } else if (arg1 == "skip") {
                    useSubCommand("PlayerSkip", inter, { gm: gm, player: player, lg: lg })
                } else if (arg1 == "queue") {
                    useSubCommand("PlayerQueue", inter, { player: player, gm: gm })
                } else if (arg1 == "current") {
                    useSubCommand("PlayerCurrent", inter, { player: player })
                } else if (arg1 == "loop") {
                    player._looping = true
                    inter.reply("Looping!")
                } else if (arg1 == "search" && optionsNotNull(inter, ["searchterm"])) {
                    useSubCommand("PlayerSearch", inter, { gm: gm, lg: lg, config: config, player: player })
                } else if (arg1 == "addspotify" && optionsNotNull(inter, ["url"])) {
                    if (gm.voice.channel) {
                        let con: VoiceConnection
                        const url = inter.options.getString("url")!!
                        if (inter.guild?.me?.voice.channel !== gm.voice.channel) {
                            lg.getVoiceConnection?.disconnect()
                            con = joinVoiceChannel({
                                channelId: gm.voice.channel.id,
                                guildId: inter.guild!!.id,
                                adapterCreator: inter.guild!!.voiceAdapterCreator
                            })
                            lg.setVoiceConnection(con)
                        } else {
                            con = lg.getVoiceConnection!!
                        }
                        const check = await play.sp_validate(url)
                        if (check == "track") {
                            const track = (await spotifyApi.getTrack(getSpotifyId(url))).body
                            if (track) {
                                const name = track.name
                                const chan = track.artists.map(a => a.name).join(", ")
                                const len = new Date(Number(track.duration_ms)).toISOString().substr(11, 8)
                                const yt = await play.search(`${chan} - ${name}`, {limit:1,type:"video"})
                                const done = player.addQueue(new QueuedMusic(wrapVideo(yt[0] as Video), gm)) // TODO
                                if (!done) {
                                    inter.followUp("That song is already in queue!")
                                    return
                                }
                                const embed = new MessageEmbed()
                                    .setTitle("Song queued!")
                                    .addFields(
                                        { name: "Name", value: name, inline: false },
                                        { name: "Channel", value: parseLength(chan), inline: true },
                                        { name: "Queued by", value: gm.user.username, inline: true },
                                        { name: "Length", value: len, inline: true }
                                    )
                                    .addField("Link", `https://open.spotify.com/track/${track.id}`, false)
                                    .setColor(`#${randomColor()}`)
                                    .setFooter("Timber | mirrored from youtube")
                                inter.reply({ embeds: [embed] })
                                if (!player._playing) {
                                    player.start(con)
                                }
                            } else {
                                inter.followUp("No results!")
                            }
                        } else if (check == "playlist" || check == "album") {
                            const pl = (check == "playlist" ? (await spotifyApi.getPlaylist(getSpotifyId(url))) : (await spotifyApi.getAlbum(getSpotifyId(url)))).body
                            if (pl) {
                                (async () => {
                                    for (let i = 0; i < pl.tracks.items.length; i++) {
                                        if (check == "playlist") {
                                            const track = pl.tracks.items[i] as SpotifyApi.PlaylistTrackObject
                                            const vid = await play.search(`${track.track.artists[0].name} - ${track.track.name}`, {limit: 1, type:"video"})
                                            player._queue.push(new QueuedMusic(wrapVideo(vid[0] as Video), gm))
                                        } else {
                                            const track = pl.tracks.items[i] as SpotifyApi.TrackObjectSimplified
                                            const vid = await play.search(`${track.artists[0].name} - ${track.name}`, {limit: 1, type:"video"})
                                            player._queue.push(new QueuedMusic(wrapVideo(vid[0] as Video), gm))
                                        }
                                    }
                                })() // TODO learn to stream directly from spotify instead of mirroring from youtube

                                const embed = new MessageEmbed()
                                    .setTitle(`${check.charAt(0).toUpperCase() + check.slice(1)} queued!`)
                                    .addFields(
                                        { name: "Name", value: parseLength(pl.name), inline: true },
                                        { name: "Queued by", value: gm.user.username, inline: true },
                                        { name: "Length", value: `${pl.tracks.items.length} songs` }
                                    )
                                    .addField("Link", `[${check}](https://open.spotify.com/playlist/${pl.id})`, false)
                                    .setColor(`#${randomColor()}`)
                                    .setFooter("Timber | mirrored from youtube")
                                inter.reply({ embeds: [embed] })
                                if (!player._playing) {
                                    setTimeout(() => {
                                        player.start(con)
                                    }, 1000)
                                }
                            } else {
                                inter.followUp("No results!")
                            }
                        }
                    }
                }
            }
        })
    }
}
exports.cmd = new CmdPlayer()
export const name: string = "player"