import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SubCommand } from "../Def";
import * as play from 'play-dl'
import { spotifyApi } from "../Bot";
import { getSpotifyId, parseLength, randomColor, wrapVideo } from "../helpers/FuncHelper";
import { QueuedMusic } from "../music/QueuedMusic";
import { Video } from "play-dl/dist/YouTube/classes/Video";

export class CmdAddspotify implements SubCommand {
    run = async (inter: CommandInteraction, opts:any) => {
        if (opts.gm.voice.channel) {
            let con: VoiceConnection
            const url = inter.options.getString("url")!!
            if (inter.guild?.me?.voice.channel !== opts.gm.voice.channel) {
                opts.lg.getVoiceConnection?.disconnect()
                con = joinVoiceChannel({
                    channelId: opts.gm.voice.channel.id,
                    guildId: inter.guild!!.id,
                    adapterCreator: inter.guild!!.voiceAdapterCreator
                })
                opts.lg.setVoiceConnection(con)
            } else {
                con = opts.lg.getVoiceConnection!!
            }
            const check = await play.sp_validate(url)
            if (check == "track") {
                const track = (await spotifyApi.getTrack(getSpotifyId(url))).body
                if (track) {
                    const name = track.name
                    const chan = track.artists.map(a => a.name).join(", ")
                    const len = new Date(Number(track.duration_ms)).toISOString().substr(11, 8)
                    const yt = await play.search(`${chan} - ${name}`, {limit:1,type:"video"})
                    const done = opts.player.addQueue(new QueuedMusic(wrapVideo(yt[0] as Video), opts.gm)) // TODO
                    if (!done) {
                        inter.followUp("That song is already in queue!")
                        return
                    }
                    const embed = new MessageEmbed()
                        .setTitle("Song queued!")
                        .addFields(
                            { name: "Name", value: name, inline: false },
                            { name: "Channel", value: parseLength(chan), inline: true },
                            { name: "Queued by", value: opts.gm.user.username, inline: true },
                            { name: "Length", value: len, inline: true }
                        )
                        .addField("Link", `https://open.spotify.com/track/${track.id}`, false)
                        .setColor(`#${randomColor()}`)
                        .setFooter("Timber | mirrored from youtube")
                    inter.reply({ embeds: [embed] })
                    if (!opts.player._playing) {
                        opts.player.start(con)
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
                                opts.player._queue.push(new QueuedMusic(wrapVideo(vid[0] as Video), opts.gm))
                            } else {
                                const track = pl.tracks.items[i] as SpotifyApi.TrackObjectSimplified
                                const vid = await play.search(`${track.artists[0].name} - ${track.name}`, {limit: 1, type:"video"})
                                opts.player._queue.push(new QueuedMusic(wrapVideo(vid[0] as Video), opts.gm))
                            }
                        }
                    })() // TODO learn to stream directly from spotify instead of mirroring from youtube

                    const embed = new MessageEmbed()
                        .setTitle(`${check.charAt(0).toUpperCase() + check.slice(1)} queued!`)
                        .addFields(
                            { name: "Name", value: parseLength(pl.name), inline: true },
                            { name: "Queued by", value: opts.gm.user.username, inline: true },
                            { name: "Length", value: `${pl.tracks.items.length} songs` }
                        )
                        .addField("Link", `[${check}](https://open.spotify.com/playlist/${pl.id})`, false)
                        .setColor(`#${randomColor()}`)
                        .setFooter("Timber | mirrored from youtube")
                    inter.reply({ embeds: [embed] })
                    if (!opts.player._playing) {
                        setTimeout(() => {
                            opts.player.start(con)
                        }, 1000)
                    }
                } else {
                    inter.followUp("No results!")
                }
            }
        }
    }
}

export const cmd = new CmdAddspotify()
export const name = "PlayerAddspotify"