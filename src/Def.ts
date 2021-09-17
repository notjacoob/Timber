import { CommandInteraction, GuildMember } from "discord.js";
import { Video } from "play-dl/dist/YouTube/classes/Video";

export interface Command {
    run(inter: CommandInteraction): void
}

export interface SubCommand {
    run(inter:CommandInteraction,opts:any): void
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
    track: VideoInfo, index: number, by: GuildMember
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

