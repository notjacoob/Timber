import { AudioPlayerStatus } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { SubCommand } from "../Def";

class PlayerPause implements SubCommand {
    run = (inter:CommandInteraction,opts:any)=>{
        if (inter.guild?.me?.voice.channel) {
            if (inter.guild.me.voice.channel == opts.gm.voice.channel) {
                if (!(opts.player._subscription!!.state.status == AudioPlayerStatus.Paused)) {
                    opts.player._subscription!!.pause()
                    inter.reply("Paused!")
                } else {
                    inter.reply("Already playing!")
                }
            } else {
                inter.reply({content: 'You aren\'t in a voice channel with me!', ephemeral: true});
            }
        } else {
            inter.reply('I am not in a voice channel!');
        }
    }
}

export const cmd = new PlayerPause()
export const name = "PlayerPause"