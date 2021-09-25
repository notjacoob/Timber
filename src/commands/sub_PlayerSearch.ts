import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import { SubCommand } from "../Def";
import * as play from 'play-dl'
import { Video } from "play-dl/dist/YouTube/classes/Video";
import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { QueuedMusic } from "../music/QueuedMusic";
import { parseLength, randomColor, wrapVideoInfo } from "../helpers/FuncHelper";
import { YT_COLOR, YT_IMAGE, YT_LOGO } from "../helpers/EmojiHelper";

class CmdSearch implements SubCommand {
    run = async (inter: CommandInteraction, opts:any) => {
        const res = await play.search(inter.options.getString("searchterm")!!, { limit: 8, type: "video" })
        if (res.length > 0) {
            const embed = new MessageEmbed()
            embed.setTitle("Results")
            embed.setDescription(`Search: ${inter.options.getString("searchterm")}`)
            res.forEach(d => {
                const vid = (d as Video)
                embed.addField(vid.channel!!.name!!, `[${vid.title}](${vid.url})`, false)
            })
            embed.setFooter(`Timber | search by ${opts.gm.user.username}`)
            const filter = (m: Message) => (m.author.id == inter.user.id) && !isNaN(Number(m.content)) && Number(m.content) < 9 && Number(m.content) > 0
            inter.reply({ embeds: [embed], fetchReply: true }).then(() => {
                inter.channel!!.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] }).then(async col => {
                    if (opts.gm.voice.channel) {
                        let con: VoiceConnection
                        const url = res[Number(col.first()!!.content) - 1]!!.url!!
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
                            inter.editReply({ embeds: [embed] })
                            if (!opts.player._playing) {
                                opts.player.start(con)
                            }
                        } else {
                            inter.followUp("No results!")
                        }
                    }
                    col.first()!!.delete()
                }).catch(col => {
                    inter.editReply({ content: "Answer took too long!", embeds: [] })
                })
            })
        }
    }
}

export const cmd = new CmdSearch()
export const name = "PlayerSearch"