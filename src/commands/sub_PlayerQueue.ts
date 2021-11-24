import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SubCommand } from "../Def";
import { QueuedMusic } from "../music/QueuedMusic";

class PlayerQueue implements SubCommand {
    run = (inter:CommandInteraction,opts:any)=>{
        if (opts.player._queue.length > 0) {
            let pn = 1
            if (inter.options.getInteger("page")) {
                pn = inter.options.getInteger("page")!!
            }
            const pages = opts.player.paginate()
            const page: Array<QueuedMusic> = pages[pn-1]
            if (page) {
                opts.player.q_page = pn
                const embed = new MessageEmbed()
                    .setAuthor("Timber | page " + pn)
                let songs = ""
                let index = (8*(pn-1))+1
                page.forEach(p => {
                    songs += `\`${index}\`  [${p._song.title}](${p._song.url})  |  \`${new Date(Number(p._song.durationInSec) * 1000).toISOString().substr(11, 8)} Queued by: ${opts.gm.user.username}\`\n\n`
                    index++
                })
                embed.setDescription(songs)
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("q_back")
                        .setLabel("Back")
                        .setStyle("PRIMARY")
                        .setDisabled(pn == 1),
                    new MessageButton()
                        .setCustomId("q_next")
                        .setLabel("Next")
                        .setStyle("PRIMARY")
                        .setDisabled(pn == pages.length)
                )
                inter.reply({embeds:[embed], components: [row]})
            } else {
                inter.reply({content:"Invalid page!", ephemeral: true})
            }
        } else {
            inter.reply("No content!")
        }
    }
}

export const cmd = new PlayerQueue()
export const name = "PlayerQueue"