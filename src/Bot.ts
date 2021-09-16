import {Client, Intents} from 'discord.js'
import * as fs from 'fs'
import {Command} from './Def'
const config = require("../config.json")


const intents = new Intents()
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
export const client = new Client({intents: intents})

const commands: Map<String, Command> = new Map()

fs.readdirSync((__dirname + "/commands/")).filter(cmd => cmd.endsWith(".js")).forEach(cmd => {
    const command = require((__dirname + "/commands/") + cmd)
    commands.set(command.name, command.cmd)
})

client.once('ready', () => {
    console.log("Bot logged in!")

})

client.on('interactionCreate', inter => {
    if (!inter.isCommand()) return
    const cmdf = [...commands].filter(([k, v]) => k.toLowerCase() == inter.commandName.toLowerCase())
    if (cmdf.length > 0) {
        try {
            cmdf[0][1].run(inter)
        } catch (err) {
            console.error(err)
        }
    }
})

client.login(config.token)

export const randomColor = (): string => { 
    return Math.floor(Math.random()*16777215).toString(16); 
}