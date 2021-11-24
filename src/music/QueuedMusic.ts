import { CommandInteraction, GuildMember } from "discord.js"
import { Video } from "play-dl/dist/YouTube/classes/Video"
import { SongInfo } from "../Def"

export class QueuedMusic {
    _song: SongInfo
    _qm: CommandInteraction
    _by: GuildMember
    constructor(song: SongInfo, by: GuildMember, qm: CommandInteraction) {
        this._song = song
        this._by = by
        this._qm=qm
    }
}