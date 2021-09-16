import { CommandInteraction, MessageEmbed } from "discord.js";
import { SubCommand } from "../Def";
import { QueuedMusic } from "../music/QueuedMusic";

class PlayerQueue implements SubCommand {
    run = (inter:CommandInteraction,opts:any)=>{
        let pn = 1
        if (inter.options.getInteger("page")) {
            pn = inter.options.getInteger("page")!!
        }
        const page: Array<QueuedMusic> = opts.player.paginate()[pn-1]
        if (page) {
            const embed = new MessageEmbed()
                .setAuthor("Timber | page " + pn)
            page.forEach(p => {
                embed.addField(p.song.video_details.title, "Queued by: "+p.queuedBy.user.username, false)
            })
            inter.reply({embeds:[embed]})
        } else {
            inter.reply({content:"Invalid page!", ephemeral: true})
        }
    }
}

export const cmd = new PlayerQueue()
export const name = "PlayerQueue"