import { AudioPlayerStatus, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, GuildMember, MessageEmbed, MessageSelectMenu } from "discord.js";
import { Command } from "../Def";
import { LinkedGuild } from "../guilds/LinkedGuild";
import { QueuedMusic } from "../music/QueuedMusic";
import { randomColor } from "../Bot"
import * as play from 'play-dl'
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
    "loop"
];

export class CmdPlayer implements Command {
    run = async (inter: CommandInteraction): Promise<void> => {
        LinkedGuild.getBy(inter.guild).then(async lg => {
            const player = lg.getPlayer
            const gm = (inter.member as GuildMember)
                const arg1 = inter.options.getSubcommand().toLowerCase()
                if (args.includes(arg1)) {
                    if (arg1 == "add" && this.optionsNotNull(inter, ["url"])) {
                        if (gm.voice.channel) {
                            let con: VoiceConnection
                            if (inter.guild?.me?.voice.channel !== gm.voice.channel) {
                                lg.getVoiceConnection?.disconnect()
                                con = joinVoiceChannel({
                                    channelId: gm.voice.channel.id,
                                    guildId: inter.guild!!.id,
                                    adapterCreator: inter.guild!!.voiceAdapterCreator
                                })
                                lg.setVoiceConnection(con)
                            } else {
                                con = lg.getVoiceConnection!!
                            }
                                const vid = play.video_info(inter.options.getString("url")!!, config.cookie)
                                if (vid) {
                                    const name = (await vid).video_details.title
                                    const chan = (await vid).video_details.channel.name
                                    const len = new Date(Number((await vid).video_details.durationInSec) * 1000).toISOString().substr(11,8)
                                    const done = player.addQueue(new QueuedMusic(await vid, gm))
                                    if (!done) {
                                        inter.followUp("That song is already in queue!")
                                        return
                                    }
                                    const embed = new MessageEmbed()
                                        .setTitle("Song queued!")
                                        .addFields(
                                            {name:"Name", value:name, inline: false},
                                            {name: "Channel", value:this.parseLength(chan), inline: true},
                                            {name: "Queued by",value:gm.user.username,inline:true},
                                            {name:"Length",value:len,inline:true}
                                        )
                                        .addField("Link", (await vid).video_details.url, false)
                                        .setThumbnail((await vid).video_details.thumbnail.url)
                                        .setColor(`#${randomColor()}`)
                                        .setFooter("Timber")
                                    inter.reply({embeds: [embed]})
                                    if (!player._playing) {
                                        player.start(con)
                                    }
                                } else {
                                    inter.followUp("No results!")
                                }
                        }
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
                        if (gm.voice.channel) {
                            if (inter.guild?.me?.voice.channel) {
                                inter.guild.me.voice.disconnect()
                                const con = joinVoiceChannel({
                                    channelId: gm.voice.channel.id,
                                    guildId: inter.guild!!.id,
                                    adapterCreator: inter.guild!!.voiceAdapterCreator
                                })
                            } else {
                                const con = joinVoiceChannel({
                                    channelId: gm.voice.channel.id,
                                    guildId: inter.guild!!.id,
                                    adapterCreator: inter.guild!!.voiceAdapterCreator
                                })
                            }
                            inter.reply({content: `Joined ${inter.guild?.me?.voice.channel}`})
                        } else {
                            inter.reply("You are not in a voice channel!")
                        }
                    } else if (arg1 == "leave") {
                        if (inter.guild?.me?.voice.channel) {
                            if (inter.guild.me.voice.channel == gm.voice.channel) {
                                player._queue = new Array()
                                inter.guild.me.voice.disconnect()
                                inter.reply("Left!")
                            } else {
                                inter.reply({content: 'You aren\'t in a voice channel with me!', ephemeral: true});
                            }
                        } else {
                            inter.reply('I am not in a voice channel!'); 
                        }
                    } else if (arg1 == "pause") {
                        if (inter.guild?.me?.voice.channel) {
                            if (inter.guild.me.voice.channel == gm.voice.channel) {
                                if (!(player._subscription!!.state.status == AudioPlayerStatus.Paused)) {
                                    player._subscription!!.pause()
                                    inter.reply("Paused!")
                                } else {
                                    inter.reply("Already playing!")
                                }
                            } else {
                                inter.reply({content: 'You aren\'t in a voice channel with me!', ephemeral: true});
                            }
                        } else {
                            inter.reply('I am not in a voice channel!');
                        }
                    } else if (arg1 == "resume") {
                        if (inter.guild?.me?.voice.channel) {
                            if (inter.guild.me.voice.channel === gm.voice.channel) {
                                if (player._subscription!!.state.status == AudioPlayerStatus.Paused) {
                                    player._subscription!!.unpause()
                                    inter.reply("Resumed!")
                                } else {
                                    inter.reply('Already playing!');
                                }
                            } else {
                                inter.reply({content: 'You aren\'t in a voice channel with me!', ephemeral: true});
                            }
                        } else {
                            inter.reply('I am not in a voice channel!');
                        }
                    } else if (arg1 == "skip") {
                        if (inter.guild?.me?.voice.channel) {
                            if (inter.guild.me.voice.channel === gm.voice.channel) {
                                player.skip(lg.getVoiceConnection!!).then(next => {
                                    if (next.response != "ok") {
                                        inter.reply('Encountered an error processing that!');
                                    } else {
                                       inter.reply('Skipped!');
                                    }
                                })
                            } else {
                                inter.reply({content: 'You aren\'t in a voice channel with me!', ephemeral: true});
                            }
                        } else {
                            inter.reply('I am not in a voice channel!');
                        }
                    } else if (arg1 == "queue") {
                        let pn = 1
                        if (inter.options.getInteger("page")) {
                            pn = inter.options.getInteger("page")!!
                        }
                        const page = player.paginate()[pn-1]
                        if (page) {
                            const embed = new MessageEmbed()
                                .setAuthor("Timber | page " + pn)
                            page.forEach(p => {
                                embed.addField(p.song.video_details.title, "Queued by: "+p.queuedBy.user.username, false)
                            })
                            inter.reply({embeds:[embed]})
                        } else {
                            inter.reply({content:"Invalid page!", ephemeral: true})
                        }
                    } else if (arg1 == "current") {
                        if (player._playing) {
                            const embed = new MessageEmbed()
                                .setTitle('Current song')
                                .addFields(
                                    { name: `Title`, value: `${player._current?.track.video_details.title}`, inline: false },
                                    { name: 'Queued by', value: `${player._current?.by.user.username}`, inline: true },
                                    { name: 'Channel', value: this.parseLength(player._current?.track.video_details.channel.name), inline: true },
                                    { name: 'Length', value: new Date(Number(player._current?.track.video_details.durationInSec) * 1000).toISOString().substr(11, 8), inline: true },
                                    { name: `Link`, value: `${player._current?.track.video_details.url}`, inline: false }
                                )
                                .setColor(`#${randomColor()}`)
                                .setFooter('Timber');
                            inter.reply({embeds:[embed]})
                        } else {
                            inter.reply('Nothing is playing!');
                        }
                    } else if (arg1 == "loop") {
                        player._looping = true
                        inter.reply("Looping!")
                    }
                }
        })
    }
    parseLength = (title:string|undefined):string=>{
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
    optionsNotNull = (inter: CommandInteraction, options: Array<string>): boolean => {
        let opt = true
        options.forEach(s => {
            if (inter.options.get(s) == undefined) opt = false
        })
        return opt
    }
}
exports.cmd = new CmdPlayer()
export const name:string = "player"