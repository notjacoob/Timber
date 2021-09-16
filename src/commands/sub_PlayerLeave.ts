import { CommandInteraction } from "discord.js";
import { SubCommand } from "../Def";

class PlayerLeave implements SubCommand {
    run = (inter: CommandInteraction, opts: any) => {
        if (inter.guild?.me?.voice.channel) {
            if (inter.guild.me.voice.channel == opts.gm.voice.channel) {
                opts.player._queue = new Array()
                inter.guild.me.voice.disconnect()
                inter.reply("Left!")
            } else {
                inter.reply({content: 'You aren\'t in a voice channel with me!', ephemeral: true});
            }
        } else {
            inter.reply('I am not in a voice channel!'); 
        }
    }
}

export const cmd = new PlayerLeave()
export const name = "PlayerLeave"