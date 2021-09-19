import { CommandInteraction, MessageEmbed } from "discord.js";
import { SubCommand } from "../Def";
import { parseLength, randomColor, renderCurrent } from "../helpers/FuncHelper";

class PlayerCurrent implements SubCommand {
    run = (inter:CommandInteraction,opts:any)=>{
        if (opts.player._playing) {
            const embed = renderCurrent(opts.player)
            inter.reply({embeds:[embed]})
        } else {
            inter.reply('Nothing is playing!');
        }
    }
}

export const cmd = new PlayerCurrent()
export const name = "PlayerCurrent"