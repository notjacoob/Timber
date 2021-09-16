import { CommandInteraction, MessageEmbed } from "discord.js";
import { SubCommand } from "../Def";
import { parseLength, randomColor } from "../Bot"

class PlayerCurrent implements SubCommand {
    run = (inter:CommandInteraction,opts:any)=>{
        if (opts.player._playing) {
            const embed = new MessageEmbed()
                .setTitle('Current song')
                .addFields(
                    { name: `Title`, value: `${opts.player._current?.track.video_details.title}`, inline: false },
                    { name: 'Queued by', value: `${opts.player._current?.by.user.username}`, inline: true },
                    { name: 'Channel', value: parseLength(opts.player._current?.track.video_details.channel.name), inline: true },
                    { name: 'Length', value: new Date(Number(opts.player._current?.track.video_details.durationInSec) * 1000).toISOString().substr(11, 8), inline: true },
                    { name: `Link`, value: `${opts.player._current?.track.video_details.url}`, inline: false }
                )
                .setColor(`#${randomColor()}`)
                .setFooter('Timber');
            inter.reply({embeds:[embed]})
        } else {
            inter.reply('Nothing is playing!');
        }
    }
}

export const cmd = new PlayerCurrent()
export const name = "PlayerCurrent"