import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { parseLength, randomColor } from "../Bot";
import { SubCommand } from "../Def";
import { QueuedMusic } from "../music/QueuedMusic";
import * as play from 'play-dl'

class PlayerAdd implements SubCommand {
    run = async (inter: CommandInteraction, opts: any) => {
        if (opts.gm.voice.channel) {
            let con: VoiceConnection
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
                const vid = play.video_info(inter.options.getString("url")!!, opts.config.cookie)
                if (vid) {
                    const name = (await vid).video_details.title
                    const chan = (await vid).video_details.channel.name
                    const len = new Date(Number((await vid).video_details.durationInSec) * 1000).toISOString().substr(11,8)
                    const done = opts.player.addQueue(new QueuedMusic(await vid, opts.gm))
                    if (!done) {
                        inter.followUp("That song is already in queue!")
                        return
                    }
                    const embed = new MessageEmbed()
                        .setTitle("Song queued!")
                        .addFields(
                            {name:"Name", value:name, inline: false},
                            {name: "Channel", value:parseLength(chan), inline: true},
                            {name: "Queued by",value:opts.gm.user.username,inline:true},
                            {name:"Length",value:len,inline:true}
                        )
                        .addField("Link", (await vid).video_details.url, false)
                        .setThumbnail((await vid).video_details.thumbnail.url)
                        .setColor(`#${randomColor()}`)
                        .setFooter("Timber")
                    inter.reply({embeds: [embed]})
                    if (!opts.player._playing) {
                        opts.player.start(con)
                    }
                } else {
                    inter.followUp("No results!")
                }
        }
    }
}

export const cmd = new PlayerAdd()
export const name = "PlayerAdd"
//lg, gm, player, config