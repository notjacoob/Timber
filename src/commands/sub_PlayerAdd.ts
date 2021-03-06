import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { parseLength, randomColor, wrapVideo, wrapVideoInfo } from "../helpers/FuncHelper";
import { SessionChangeWrapper, SubCommand } from "../Def";
import { QueuedMusic } from "../music/QueuedMusic";
import * as play from 'play-dl'
import { YT_COLOR, YT_IMAGE, YT_LOGO } from "../helpers/EmojiHelper";

class PlayerAdd implements SubCommand {
    run = async (inter: CommandInteraction, opts: any) => {
        if (opts.gm.voice.channel) {
            let con: VoiceConnection
            const url = inter.options.getString("url") ? inter.options.getString("url") : opts.url
            if (inter.guild?.me?.voice.channel !== opts.gm.voice.channel) {
                opts.lg.getVoiceConnection?.disconnect()
                //console.log(`Joined ${opts.gm.voice.channel.name} (${opts.gm.voice.channel.id}) [${inter.guild!!.name} ${inter.guild!!.id}]`)
                SessionChangeWrapper.wrap(opts.gm.guild!!.id, opts.gm.voice.channel.id, opts.gm.voice.channel.name, opts.gm.guild!!.name, opts.gm.user)
                con = joinVoiceChannel({
                    channelId: opts.gm.voice.channel.id,
                    guildId: inter.guild!!.id,
                    adapterCreator: inter.guild!!.voiceAdapterCreator
                })
                opts.lg.setVoiceConnection(con)
            } else {
                con = opts.lg.getVoiceConnection!!
            }
            const check = play.yt_validate(url)
            if (check == "video") {
                const vid = play.video_info(url, opts.config.cookie)
                if (vid) {
                    const name = (await vid).video_details.title
                    const chan = (await vid).video_details.channel.name
                    const len = new Date(Number((await vid).video_details.durationInSec) * 1000).toISOString().substr(11, 8)
                    const done = opts.player.addQueue(new QueuedMusic(wrapVideoInfo(await vid), opts.gm, inter))
                    if (!done) {
                        inter.followUp("That song is already in queue!")
                        return
                    }
                    const embed = new MessageEmbed()
                        .setAuthor(`Song queued!`, YT_IMAGE)
                        .setTitle(`${name}`)
                        .setURL(((await vid).video_details.url))
                        .addFields(
                            { name: "Channel", value: parseLength(chan), inline: true },
                            { name: "Queued by", value: opts.gm.user.username, inline: true },
                            { name: "Length", value: len, inline: true }
                        )
                        .setThumbnail((await vid).video_details.thumbnail.url)
                        .setColor(`#${YT_COLOR}`)
                        .setFooter("Timber")
                    inter.reply({ embeds: [embed] })
                    if (!opts.player._playing) {
                        opts.player.start(con)
                    }
                } else {
                    inter.followUp("No results!")
                }
            } else if (check == "playlist") {
                const pl = (await play.playlist_info(url, true))!!.fetch()
                if (pl) {
                    const subQueue: Array<QueuedMusic> = new Array()
                    for (let i = 0; i < (await pl).total_pages; i++) {
                        const page = (await pl).page(i+1)!!
                        for (let j = 0; j < page.length; j++) {
                            subQueue.push(new QueuedMusic(wrapVideo(page[j]), opts.gm, inter))
                        }
                    }
                    opts.player._queue = opts.player._queue.concat(subQueue)
                    const embed = new MessageEmbed()
                        .setTitle(`${YT_LOGO}  Playlist queued!`)
                        .addFields(
                            { name: "Name", value: parseLength((await pl).title!!), inline: true },
                            { name: "Channel", value: parseLength((await pl).channel!!.name), inline: true },
                            { name: "Queued by", value: opts.gm.user.username, inline: true },
                            { name: "Length", value: `${(await pl).videoCount} songs` }
                        )
                        .addField("Link", `[Playlist](${(await pl).url!!})`, false)
                        .setThumbnail((await pl).thumbnail?.url!!)
                        .setColor(`#${randomColor()}`)
                        .setFooter("Timber")
                    inter.reply({ embeds: [embed] })
                    if (!opts.player._playing) {
                        opts.player.start(con)
                    }
                } else {
                    inter.followUp("No results!")
                }
            }
        }
    }
}

export const cmd = new PlayerAdd()
export const name = "PlayerAdd"
//lg, gm, player, config