import {Client, CommandInteraction, Intents} from 'discord.js'
import * as fs from 'fs'
import {Command, SubCommand} from './Def'
const config = require("../config.json")


const intents = new Intents()
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
export const client = new Client({intents: intents})

const commands: Map<String, Command> = new Map()
const subCommands: Map<String, SubCommand> = new Map()

fs.readdirSync((__dirname + "/commands/")).filter(cmd => cmd.endsWith(".js")).forEach(cmd => {
    const command = require((__dirname + "/commands/") + cmd)
    if (cmd.startsWith("sub_")) {
        subCommands.set(command.name, command.cmd)
    } else {
        commands.set(command.name, command.cmd)
    }
})


client.once('ready', () => {
    console.log("Bot logged in!")
    client.user?.setStatus("dnd")
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
export const useSubCommand = (name: string, inter: CommandInteraction, opts: any) => {
    const scmdf = [...subCommands].filter(([k,v]) => k.toLowerCase() == name.toLowerCase())
    if (scmdf.length > 0) {
        scmdf[0][1].run(inter, opts)
    }
}
export const parseLength = (title:string|undefined):string=>{
    if (title) {
        if (title.split(' ').length > 2) {
            return title.split(' ').filter((s, i) => i < 3).join(' ')+'...'
        } else {
            return title
        }
    } else {
        return '???'
    }
}