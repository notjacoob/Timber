import { VoiceConnection } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { SubCommand } from "../Def";
import { Player } from "../music/Player";

class PlayerSkip implements SubCommand {
    run = (inter:CommandInteraction,opts:any)=>{
        if (inter.guild?.me?.voice.channel) {
            if (inter.guild.me.voice.channel === opts.gm.voice.channel) {
                (opts.player as Player).skip((opts.lg.getVoiceConnection!! as VoiceConnection)).then(next => {
                    if (next.response != "ok") {
                        inter.reply('Encountered an error processing that!');
                    } else {
                       inter.reply('Skipped!');
                    }
                })
            } else {
                inter.reply({content: 'You aren\'t in a voice channel with me!', ephemeral: true});
            }
        } else {
            inter.reply('I am not in a voice channel!');
        }
    }
}

export const cmd = new PlayerSkip()
export const name = "PlayerSkip"