import { CommandInteraction, MessageEmbed } from "discord.js";
import { SpotifyVideo } from "play-dl/dist/Spotify/classes";
import { Video } from "play-dl/dist/YouTube/classes/Video";
import { videoInfo } from "ytdl-core";
import { subCommands } from "../Bot";
import { SongInfo, VideoInfo } from "../Def";
import { Player } from "../music/Player";

export const randomColor = (): string => {
    return Math.floor(Math.random() * 16777215).toString(16);
}
export const useSubCommand = (name: string, inter: CommandInteraction, opts: any) => {
    const scmdf = [...subCommands].filter(([k, v]) => k.toLowerCase() == name.toLowerCase())
    if (scmdf.length > 0) {
        scmdf[0][1].run(inter, opts)
    }
}
export const parseLength = (title: string | undefined): string => {
    if (title) {
        if (title.split(' ').length > 2) {
            return title.split(' ').filter((s, i) => i < 3).join(' ') + '...'
        } else {
            return title
        }
    } else {
        return '???'
    }
}
export const optionsNotNull = (inter: CommandInteraction, options: Array<string>): boolean => {
    let opt = true
    options.forEach(s => {
        if (inter.options.get(s) == undefined) opt = false
    })
    return opt
}
export const wrapVideo = (v: Video): SongInfo => {
    return {
        id: v.id,
        url: v.url!!,
        title: v.title!!,
        description: v.description!!,
        durationInSec: v.durationInSec,
        thumbnail: v.thumbnail,
        channel: {
            name: v.channel?.name!!,
            url: v.channel?.url!!,
        }
    }
}
export const wrapVideoInfo = (v: VideoInfo): SongInfo => {
    return {
        id: v.video_details.id,
        url: v.video_details.url!!,
        title: v.video_details.title!!,
        description: v.video_details.description!!,
        durationInSec: v.video_details.durationInSec,
        thumbnail: v.video_details.thumbnail,
        channel: {
            name: v.video_details.channel.name,
            url: v.video_details.channel.url,
        }
    }
}
export const wrapSpotifySong = (v:any): SongInfo => {
    return {
        id: v.id,
        url: v.preview_url,
        title: v.name,
        description: "",
        durationInSec: v.duration_ms,
        thumbnail: undefined,
        channel: {
            name: v.artists.map((a:any) => a.name).join(", "),
            url: v.artists[0].url,
        }
    }
}
export const getSpotifyId = (url: string): any => {
    return url.replace("https://", "").split("/")[2].split("?")[0]
}

export const shuffleArray = (array: Array<any>) => {
    for (let i = array.length- 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [array[i], array[j]] = [array[j], array[i]]
    }
}

export const renderCurrent = (player: Player): MessageEmbed => {
    const embed = new MessageEmbed()
    .setTitle('Now playing!')
    .addFields(
        { name: `Title`, value: `${player._current?.track.title}`, inline: false },
        { name: 'Queued by', value: `${player._current?.by.user.username}`, inline: true },
        { name: 'Channel', value: parseLength(player._current?.track.channel.name), inline: true },
        { name: 'Length', value: new Date(Number(player._current?.track.durationInSec) * 1000).toISOString().substr(11, 8), inline: true },
        { name: `Link`, value: `${player._current?.track.url}`, inline: false }
    )
    .setColor(`#${randomColor()}`)
    .setFooter('Timber');
    return embed
}