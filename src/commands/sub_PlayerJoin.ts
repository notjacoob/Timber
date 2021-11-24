import { joinVoiceChannel } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { SessionChangeWrapper, SubCommand } from "../Def";

class PlayerJoin implements SubCommand {
    run = (inter: CommandInteraction, opts: any) => {
        if (opts.gm.voice.channel) {
            if (inter.guild?.me?.voice.channel) {
                inter.guild.me.voice.disconnect()
                SessionChangeWrapper.wrap(opts.gm.guild!!.id, opts.gm.voice.channel.id, opts.gm.voice.channel.name, opts.gm.guild!!.name, opts.gm.user)
                const con = joinVoiceChannel({
                    channelId: opts.gm.voice.channel.id,
                    guildId: inter.guild!!.id,
                    adapterCreator: inter.guild!!.voiceAdapterCreator
                })
            } else {
                SessionChangeWrapper.wrap(opts.gm.guild!!.id, opts.gm.voice.channel.id, opts.gm.voice.channel.name, opts.gm.guild!!.name, opts.gm.user)
                const con = joinVoiceChannel({
                    channelId: opts.gm.voice.channel.id,
                    guildId: inter.guild!!.id,
                    adapterCreator: inter.guild!!.voiceAdapterCreator
                })
            }
            inter.reply({content: `Joined ${inter.guild?.me?.voice.channel}`})
        } else {
            inter.reply("You are not in a voice channel!")
        }
    }
}

export const cmd = new PlayerJoin()
export const name = "PlayerJoin"