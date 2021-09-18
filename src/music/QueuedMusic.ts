import { GuildMember } from "discord.js"
import { Video } from "play-dl/dist/YouTube/classes/Video"
import { SongInfo } from "../Def"

export class QueuedMusic {
    _song: SongInfo
    _by: GuildMember
    constructor(song: SongInfo, by: GuildMember) {
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