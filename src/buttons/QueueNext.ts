import { ButtonInteraction, GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { Button } from "../Def";
import { LinkedGuild } from "../guilds/LinkedGuild";

class ButtonQueueNext implements Button {
    run = (inter: ButtonInteraction) => {
        if (inter.message instanceof Message) {
            const m = inter.message as Message
            LinkedGuild.getBy(inter.guild).then(lg => {
                if (lg.getPlayer) {
                    const player = lg.getPlayer
                    const pages = player.paginate()
                    const page = pages[(player.q_page+1)-1]
                    if (page) {
                        player.q_page++
                        const pn = player.q_page
                        const embed = new MessageEmbed()
                            .setAuthor("Timber | page " + pn)
                        let songs = ""
                        let index = (8 * (pn - 1)) + 1
                        page.forEach(p => {
                            songs += `\`${index}\`  [${p.song.title}](${p.song.url})  |  \`${new Date(Number(p.song.durationInSec) * 1000).toISOString().substr(11, 8)} Queued by: ${(inter.member as GuildMember).user.username}\`\n\n`
                            index++
                        })
                        embed.setDescription(songs)
                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId("q_back")
                                    .setLabel("Back")
                                    .setStyle("PRIMARY"),
                                new MessageButton()
                                    .setCustomId("q_next")
                                    .setLabel("Next")
                                    .setStyle("PRIMARY")
                                    .setDisabled(pn == pages.length)
                            )
                        m.edit({ embeds: [embed], components: [row] })
                        inter.reply({content: `Showing page ${pn}`, ephemeral:true})
                    } else {
                        inter.reply({content: "That page doesn't exist!", ephemeral: true})
                    }
                }
            })
        }
    }
}

export const button = new ButtonQueueNext()
export const id = "q_next"