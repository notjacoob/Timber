import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { Command } from "../Def";
import { LinkedGuild } from "../guilds/LinkedGuild";
import { useSubCommand, optionsNotNull, shuffleArray } from "../helpers/FuncHelper";
import { getLyrics } from "../helpers/FuncHelper";
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
    "search",
    "addspotify",
    "shuffle",
    "lyrics",
    "loopqueue"
];

export class CmdPlayer implements Command {
    run = async (inter: CommandInteraction): Promise<void> => {
        LinkedGuild.getBy(inter.guild).then(async lg => {
            const player = lg.getPlayer
            const gm = (inter.member as GuildMember)
            const arg1 = inter.options.getSubcommand().toLowerCase()
            if (args.includes(arg1)) {
                if (arg1 == "add" && optionsNotNull(inter, ["url"])) {
                    //lg, gm, player, config
                    useSubCommand("PlayerAdd", inter, { lg: lg, gm: gm, player: player, config: config })
                } else if (arg1 == "remove" && optionsNotNull(inter, ["index"])) {
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
                    useSubCommand("PlayerQueue", inter, { player: player, gm: gm })
                } else if (arg1 == "current") {
                    useSubCommand("PlayerCurrent", inter, { player: player })
                } else if (arg1 == "loop") {
                    player._looping = !player._looping
                    inter.reply((!player._looping ? "No longer looping!" : "Looping!"))
                } else if (arg1 == "search" && optionsNotNull(inter, ["searchterm"])) {
                    useSubCommand("PlayerSearch", inter, { gm: gm, lg: lg, config: config, player: player })
                } else if (arg1 == "addspotify" && optionsNotNull(inter, ["url"])) {
                    useSubCommand("PlayerAddspotify", inter, {gm:gm,lg:lg,player:player,config:config})
                } else if (arg1 == "shuffle") {
                    if (gm.voice.channel && inter.guild?.me?.voice.channel == gm.voice.channel) {
                        shuffleArray(player._queue)
                        inter.reply("Shuffled queue!")
                    } else {
                        inter.reply({content: "Please join a voice channel!", ephemeral: true})
                    }
                } else if (arg1 == "lyrics") {
                    if (player._current) {
                        getLyrics(player).then(l => {
                            const embed = new MessageEmbed()
                            embed.setAuthor("Lyrics")
                                .setDescription(`${l}\n\n\n\`Song:\` [${player._current!!.track.channel.name} - ${player._current!!.track.title}](${player._current!!.track.url})`)
                                .setFooter("Timber")
                            inter.reply({embeds:[embed]})
                        }).catch(err => {
                            inter.reply({content: "Cannot find lyrics for that song!", ephemeral: true})
                        })
                    }
                } else if (arg1 == "loopqueue") {
                    player._q_looping = !player._q_looping
                    if (player._q_looping) {
                        player.__lq()
                    } else {
                        player._q_looping = false
                    }
                    inter.reply((player._q_looping ? "Looping " : "No longer looping ") + "queue!")
                }
            }
        })
    }
}
exports.cmd = new CmdPlayer()
export const name: string = "player"