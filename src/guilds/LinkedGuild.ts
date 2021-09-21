import { VoiceConnection } from "@discordjs/voice"
import { Guild } from "discord.js"
import { Player } from "../music/Player"

export class LinkedGuild {
    static _cache: Map<string, LinkedGuild> = new Map()
    _voiceConnection: VoiceConnection | undefined = undefined
    _guild: Guild
    player: Player | undefined = undefined
    constructor(id: Guild) {
        this._guild=id
    }
    get getVoiceConnection() {
        return this._voiceConnection
    }
    setVoiceConnection = (con: VoiceConnection) => {
        this._voiceConnection = con
    }
    // getCommand(name:string)
    // rmCmd(name:string)
    //setLogger(which:string,id:string)
    //getLogger(which:string)
    createPlayer = ():Player => {
        if (!this.player) {
            this.player=new Player(this)
            return this.player
        } else {
            return this.player
        }
    }
    get getPlayer() {
        return this.createPlayer()
    }
    //setupFiles()
    //allExist()
    //readFiles()
    //setPrefix()
    //getPrefix()
    //writeFiles()
    //addPingNotif()
    //removePingNotif()
    //hasPingNotif()
    //getPingNotif()
    //adInfoNode()
    static getBy = (g:Guild | null): Promise<LinkedGuild> => {
        return new Promise(async (resolve, reject) => {
                if (g != null) {
                    if (!LinkedGuild._cache.has(g.id)) {
                        const guild = new LinkedGuild(g)
                        LinkedGuild._cache.set(g.id, guild)
                        //listener.emit('linkedGuildCreate', guild);
                        resolve(guild)
                    } else {
                        resolve(LinkedGuild._cache.get(g.id)!!)
                    }
                } else {
                    reject(new Error("Invalid guild"))
                }
            })
    }
}