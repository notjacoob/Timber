import { CommandInteraction, Message } from 'discord.js'
const config = require("../../config.json")
import { client } from '../Bot'
import { Command } from '../Def'

class HelloCmd implements Command {
    run = async (inter: CommandInteraction) => {
        const s = await inter.reply({content: `Hey guys its me pitbull (websocket heartbeat: ${client.ws.ping}ms)`, fetchReply: true})
        inter.editReply(s.content + ` (roundtrip: ${(s as Message).createdTimestamp - inter.createdTimestamp}ms)${inter.guild!!.id == "689669354698440713" || inter.guild?.id == "693290026292740116" ? " " + config.phrase : ""}`)
    }
}

exports.cmd = new HelloCmd()
export const name: string = "hello"