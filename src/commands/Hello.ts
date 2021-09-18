import { CommandInteraction } from 'discord.js'
import { client } from '../Bot'
import { Command } from '../Def'

class HelloCmd implements Command {
    run = async (inter: CommandInteraction) => {
        inter.reply({content: `Hey guys its me pitbull (websocket heartbeat: ${client.ws.ping}ms)`})
    }
}

exports.cmd = new HelloCmd()
export const name: string = "hello"