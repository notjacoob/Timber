import { GuildMember } from "discord.js"
import { Video } from "play-dl/dist/YouTube/classes/Video"
import { VideoInfo } from "../Def"

export class QueuedMusic {
    _song: VideoInfo
    _by: GuildMember
    constructor(song: VideoInfo, by: GuildMember) {
        this._song = song
        this._by = by
    }
    get song() {
        return this._song
    }
    get queuedBy() {
        return this._by
    }
}