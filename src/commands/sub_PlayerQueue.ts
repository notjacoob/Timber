import { CommandInteraction, MessageEmbed } from "discord.js";
import { SubCommand } from "../Def";
import { QueuedMusic } from "../music/QueuedMusic";

class PlayerQueue implements SubCommand {
    run = (inter:CommandInteraction,opts:any)=>{
        if (opts.player._queue.length > 0) {
            let pn = 1
            if (inter.options.getInteger("page")) {
                pn = inter.options.getInteger("page")!!
            }
            const page: Array<QueuedMusic> = opts.player.paginate()[pn-1]
            if (page) {
                const embed = new MessageEmbed()
                    .setAuthor("Timber | page " + pn)
                let songs = ""
                let index = (8*(pn-1))+1
                page.forEach(p => {
                    songs += `\`${index}\`  [${p.song.title}](${p.song.url})  |  \`${new Date(Number(p.song.durationInSec) * 1000).toISOString().substr(11, 8)} Queued by: ${opts.gm.user.username}\`\n\n`
                    index++
                })
                embed.setDescription(songs)
                inter.reply({embeds:[embed]})
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