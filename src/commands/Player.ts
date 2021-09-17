import { AudioPlayerStatus, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageSelectMenu } from "discord.js";
import { Command } from "../Def";
import { LinkedGuild } from "../guilds/LinkedGuild";
import { QueuedMusic } from "../music/QueuedMusic";
import { parseLength, randomColor, useSubCommand } from "../Bot"
import * as play from 'play-dl'
import { Video } from "play-dl/dist/YouTube/classes/Video";
const config = require('../../config.json')

const args = [
    "add",
    "remove",
    "clear",
    "join",
    "leave",
    "pause",
    "resume",
    "skip",
    "queue",
    "current",
    "loop",
    "search"
];

export class CmdPlayer implements Command {
    run = async (inter: CommandInteraction): Promise<void> => {
        LinkedGuild.getBy(inter.guild).then(async lg => {
            const player = lg.getPlayer
            const gm = (inter.member as GuildMember)
            const arg1 = inter.options.getSubcommand().toLowerCase()
            if (args.includes(arg1)) {
                if (arg1 == "add" && this.optionsNotNull(inter, ["url"])) {
                    //lg, gm, player, config
                    useSubCommand("PlayerAdd", inter, { lg: lg, gm: gm, player: player, config: config })
                } else if (arg1 == "remove" && this.optionsNotNull(inter, ["index"])) {
                    const done = player.removeQueue(inter.options.getString("index")!!)
                    if (done) {
                        inter.reply("Removed song from queue!")
                    } else {
                        inter.reply("That song is not in queue!")
                    }
                } else if (arg1 == "clear") {
                    player._queue = new Array()
                    inter.reply("Cleared queue!")
                } else if (arg1 == "join") {
                    useSubCommand("PlayerJoin", inter, { gm: gm })
                } else if (arg1 == "leave") {
                    useSubCommand("PlayerLeave", inter, { gm: gm, player: player })
                } else if (arg1 == "pause") {
                    useSubCommand("PlayerPause", inter, { gm: gm, player: player })
                } else if (arg1 == "resume") {
                    useSubCommand("PlayerResume", inter, { gm: gm, player: player })
                } else if (arg1 == "skip") {
                    useSubCommand("PlayerSkip", inter, { gm: gm, player: player, lg: lg })
                } else if (arg1 == "queue") {
                    useSubCommand("PlayerQueue", inter, { player: player })
                } else if (arg1 == "current") {
                    useSubCommand("PlayerCurrent", inter, { player: player })
                } else if (arg1 == "loop") {
                    player._looping = true
                    inter.reply("Looping!")
                } else if (arg1 == "search" && this.optionsNotNull(inter, ["searchterm"])) {
                    useSubCommand("PlayerSearch", inter, {gm:gm,lg:lg,config:config,player:player})
                }
            }
        })
    }

    optionsNotNull = (inter: CommandInteraction, options: Array<string>): boolean => {
        let opt = true
        options.forEach(s => {
            if (inter.options.get(s) == undefined) opt = false
        })
        return opt
    }
}
exports.cmd = new CmdPlayer()
export const name: string = "player"