import { embedFieldPredicate } from "@discordjs/builders/dist/messages/embed/Assertions";
import { ButtonInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { client, session } from "../Bot";
import { Button, CommandDiagnostic, avg } from "../Def";
const config = require("../../config.json")

class ButtonHello implements Button {
    run = async (inter: ButtonInteraction): Promise<void> => {
        if (inter.message instanceof Message) {
            const m = inter.message as Message
            const cc = await CommandDiagnostic.query()
            const ccs = await CommandDiagnostic.query()
                .where("session", session)
            this.avgExecTimeSession().then(async aex => {
                const embed = new MessageEmbed()
                    .addField("websocket heartbeat", `${client.ws.ping}ms`)
                    .addField("Avg exec time (session)", `${aex}ms`)
                    .addField("Command count", `${cc.length}`)
                    .addField("Command count (session)", `${ccs.length}`)

                if (inter.guild!!.id == "689669354698440713" || inter.guild?.id == "693290026292740116") {
                    embed.addField(config.phrase_s, config.phrase_e)
                }
                const s = await m.edit({
                    content: "Hey guys its me pitbull",
                    embeds: [embed]
                })
                inter.reply({ content: "Hey guys", ephemeral: true })
            })
        }

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

export const id = "h_diag"
export const button = new ButtonHello()