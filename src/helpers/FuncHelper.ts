import { CommandInteraction } from "discord.js";
import { Video } from "play-dl/dist/YouTube/classes/Video";
import { subCommands } from "../Bot";
import { VideoInfo } from "../Def";

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
export const optionsNotNull = (inter: CommandInteraction, options: Array<string>): boolean => {
    let opt = true
    options.forEach(s => {
        if (inter.options.get(s) == undefined) opt = false
    })
    return opt
}
export const wrapVideo = (v: Video):VideoInfo => {
    return {
        LiveStreamData: {
            isLive: false,
            dashManifestUrl: undefined,
            hlsManifestUrl: undefined
        },
        html5player: "undefined",
        format: [],
        video_details: {
            id: v.id,
            url: v.url!!,
            title: v.title,
            description: v.description,
            durationInSec: v.durationInSec,
            durationRaw: v.durationRaw,
            uploadedDate: undefined,
            thumbnail: v.thumbnail,
            channel: {
                name: v.channel?.name,
                id: v.channel?.id,
                url: v.channel?.url!!,
                verified: v.channel?.verified!!
            },
            views: v.views,
            tags: v.tags,
            averageRating: undefined,
            live: v.live,
            private: v.private

        }

    }
}