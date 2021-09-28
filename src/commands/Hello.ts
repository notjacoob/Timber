import { CommandInteraction, Message, MessageActionRow, MessageButton } from 'discord.js'
const config = require("../../config.json")
import { client, session } from '../Bot'
import { avg, Command, CommandDiagnostic, knexc } from '../Def'

class HelloCmd implements Command {
    run = async (inter: CommandInteraction) => {
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("h_diag")
                .setLabel("Hi pitbull")
                .setStyle("PRIMARY")
        )
        inter.reply({content: `Hey guys its me pitbull`, components: [row]})
    }
    avgExecTimeSession = async (): Promise<Number> => {
        return new Promise(async (res, rej) => {
            const cds = await CommandDiagnostic.query()
            .where('session', session)
            .orderBy('id').catch(err => rej())
            //@ts-ignore
            res(avg(cds.map(cd => cd.endTimeMs - cd.startTimeMs)).toFixed(2))
        })
    }
}

exports.cmd = new HelloCmd()
export const name: string = "hello"