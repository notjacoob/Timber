import { CommandInteraction, MessageEmbed } from "discord.js";
import { SpotifyVideo } from "play-dl/dist/Spotify/classes";
import { Video } from "play-dl/dist/YouTube/classes/Video";
import { start } from "repl";
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
        },
        thumbUrl: v.thumbnail?.url
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
        },
        thumbUrl: v.video_details.thumbnail.url
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
        },
        thumbUrl: undefined
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
    const startTime = player._current?.startTime
    const endTime = new Date()
    endTime.setSeconds(endTime.getSeconds() + Number(player._current?.track.durationInSec))
    const ap = new Date(((new Date().getTime()/1000)-(startTime!!.getTime()/1000))*1000).toISOString().substr(14,5)
    const t = `[${parseLength(player._current?.track.channel.name)} - ${player._current?.track.title}](${player._current?.track.url})\n\n`
        + `${progressBar(secDifference(endTime,startTime!!), player._current?.track.durationInSec, 20)}\n\n`
        + `\`${ap} / ${new Date(Number(player._current?.track.durationInSec) * 1000).toISOString().substr(14, 5)}\`\n\n`
        + `\`Queued by:\` ${player._current?.by.user.username}`
    const embed = new MessageEmbed()
    .setTitle('Now playing!')
    .setDescription(t)
    .setColor(`#${randomColor()}`)
    .setFooter('Timber');
    if (player._current?.track.thumbUrl) {
        embed.setThumbnail(player._current.track.thumbUrl)
    }
    return embed
}

// https://github.com/Mw3y/Text-ProgressBar/blob/master/ProgressBar.js modified a bit
export const progressBar = (value: number, maxValue: number, size: number): string => {
    const percent = (value/maxValue)-1
    const prog = Math.round(size*percent)
    const emptyProg = size - prog
    
    const progText = '▇'.repeat(clamp(prog, 0, 20))
    const eProgText = '—'.repeat(clamp(emptyProg, 0, 20))

    const bar = '`['+progText+eProgText+']`'
    return bar
}

export const secDifference = (d1: Date, d2: Date): number => {
    const dif = d1.getTime() - d2.getTime()
    const sBetween1 = dif/1000
    const sBetween2 = Math.abs(sBetween1)
    return sBetween2
}

export const clamp = (n1: number, min: number, max: number): number => {
    if (n1 > max) return max
    else if (n1 < min) return min
    else return n1
}