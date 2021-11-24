import { CommandInteraction } from "discord.js";
import { env } from "../Bot";
import { Command } from "../Def";
const config = require("../../config.json")

class InviteCmd implements Command {
    run = async (inter: CommandInteraction) => {
        const envCid = env == "prod" ? config.prod.clientId : config.dev.clientId
        inter.reply({content: `Invite me: https://discord.com/api/oauth2/authorize?client_id=${envCid}&permissions=8&scope=applications.commands%20bot`, ephemeral: true})
    }
}
exports.cmd = new InviteCmd()
export const name: string = "invite"