import { ButtonInteraction, CommandInteraction, GuildMember } from "discord.js";
import Knex from "knex";
import { QueuedMusic } from "./music/QueuedMusic";
import { Model } from 'objection'
import { session } from "./Bot";
const knex = require('knex')

export const knexc: Knex = knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: "./bot.db"
    }
})



export class CommandDiagnostic extends Model {
    static get tableName() {
        return "CommandDiagnostics"
    }
}

export interface Command {
    run(inter: CommandInteraction): void
}

export interface SubCommand {
    run(inter:CommandInteraction,opts:any): void
}

export interface Button {
    run(inter: ButtonInteraction):void
}

export type PlayerState = {
    playing: boolean, response: "ok" | "error", error?: Array<PlayerError>
}

export enum PlayerError {
    NO_QUEUE,
    ALREADY_PLAYING,
    NO_VC,
    NOTHING_PLAYING,
    UNKNOWN
}

export type CurrentPlaying = {
    track: SongInfo, index: number, by: GuildMember, qmusic: QueuedMusic, startTime: Date
}

export type SongInfo = {
    id: any
    url: string
    title: string
    description: string
    durationInSec: any
    thumbnail: any
    channel: {
        name: string
        url: string
    }
    thumbUrl: string | undefined
}



export type VideoInfo = {
    LiveStreamData: {
        isLive: any;
        dashManifestUrl: any;
        hlsManifestUrl: any;
    };
    html5player: string;
    format: any[];
    video_details: {
        id: any;
        url: string;
        title: any;
        description: any;
        durationInSec: any;
        durationRaw: string;
        uploadedDate: any;
        thumbnail: any;
        channel: {
            name: any;
            id: any;
            url: string;
            verified: boolean;
        };
        views: any;
        tags: any;
        averageRating: any;
        live: any;
        private: any;
    };
}

export class CommandStatistics {
    static wrap = async (command: CommandInteraction, action: () => Date) => {
        const start = new Date()
        const end = action()
        await CommandDiagnostic.query().insertGraph({
            //@ts-ignore ?????
            startTimeMs: start.getTime(),
            endTimeMs: end.getTime(),
            msg: JSON.stringify(command.options),
            name: command.commandName,
            authorId: command.user.id,
            gid: command.guildId,
            session: session
        })
    }
}
export const avg = (arr: number[]): number => {
    let t= 0
    let c= 0
    arr.forEach(n => {
        t+=n
        c++
    })
    return t/c
}