import { CommandInteraction } from 'discord.js'
import { Command } from '../Def'

class HelloCmd implements Command {
    run = async (inter: CommandInteraction) => {
        inter.reply({content: "Hey guys its me pitbull"})
    }
}

exports.cmd = new HelloCmd()
export const name: string = "hello"