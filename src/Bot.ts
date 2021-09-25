import {Client, CommandInteraction, Intents} from 'discord.js'
import * as fs from 'fs'
import { web } from './AuthServer'
import spotify from 'spotify-web-api-node'
import {Button, Command, SubCommand} from './Def'
import { Server } from 'http'
import open from 'open'
import { LinkedGuild } from './guilds/LinkedGuild'
const config = require("../config.json")


const intents = new Intents()
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES)
export const client = new Client({intents: intents})

export const commands: Map<String, Command> = new Map()
export const buttons: Map<String, Button> = new Map()
export const subCommands: Map<String, SubCommand> = new Map()

fs.readdirSync((__dirname + "/commands/")).filter(cmd => cmd.endsWith(".js")).forEach(cmd => {
    const command = require((__dirname + "/commands/") + cmd)
    if (cmd.startsWith("sub_")) {
        subCommands.set(command.name, command.cmd)
    } else {
        commands.set(command.name, command.cmd)
    }
})
fs.readdirSync((__dirname + "/buttons/")).filter(b => b.endsWith(".js")).forEach(b => {
    const button = require((__dirname + "/buttons/") + b)
    buttons.set(button.id, button.button)
})

let server: Server

client.once('ready', () => {
    console.log(`Bot logged in as ${client.user!!.username}#${client.user?.discriminator}`)
    client.user?.setStatus("dnd");
    server = web.listen(3000)
})

export const stopWebServer = async () => {
    server.close()
    setInterval(() => {
        spotifyApi.refreshAccessToken().then(tk => {
            spotifyApi.setAccessToken(tk.body.access_token)
        })
    }, (3480000));
}

export const spotifyApi = new spotify({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: "http://localhost:3000/"
})

open(spotifyApi.createAuthorizeURL([], config.spotify.state))

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
client.on("interactionCreate", inter => {
    if (!inter.isButton()) return
    const btnf = [...buttons].filter(([k,v]) => k.toLowerCase() == inter.customId.toLowerCase())
    if (btnf.length > 0) {
        try {
            btnf[0][1].run(inter)
        } catch (err) {
            console.error(err)
        }
    }
})
client.on("voiceStateUpdate", (olds, news) => {
    if (olds.channel) {
        if (olds.channel.members.filter((m)=>m.id != client.user!!.id).size == 0) {
            LinkedGuild.getBy(news.guild).then(g => {
                setTimeout(() => {
                    if (olds.channel!!.members.filter((m)=>m.id != client.user!!.id).size == 0) {
                        if (g.player) g.player._queue = []
                        g._voiceConnection?.disconnect()
                    }
                },300000)
            })
        } 
    }
})
if (process.platform == "win32") {
    const rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.on("SIGINT", () => {
        console.log("Shutting down!")
        __sd()
        process.exit(0)
    })
}
if (process.argv[2]) {
    client.login(process.argv[2] == "prod" ? config.prod.token : config.dev.token)
} else {
    client.login(config.env=="prod" ? config.prod.token : config.dev.token)
}
process.on("exit", () => {
    __sd()
})
process.on("SIGINT", () => {
    __sd()
})

const __sd = () => {
    LinkedGuild._cache.forEach(lg => {
        lg._voiceConnection?.disconnect()
    })
}
