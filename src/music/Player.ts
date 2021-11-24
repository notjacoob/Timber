import { Guild } from 'discord.js'
import { AudioPlayer, VoiceConnection, VoiceConnectionStatus, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, StreamType } from '@discordjs/voice'
import { QueuedMusic } from './QueuedMusic'
import { PlayerState, PlayerError, CurrentPlaying } from '../Def'
import * as play from 'play-dl'
import { cloneDeep, renderCurrent } from '../helpers/FuncHelper'
import { LinkedGuild } from '../guilds/LinkedGuild'
const config = require("../../config.json")

export class Player {
    _playing: boolean = false
    _started: boolean = false
    q_page: number = 1
    _q_looping: boolean = false
    _looping: boolean = false
    _guild: LinkedGuild
    _q_store: Array<QueuedMusic> = new Array()
    _idle: boolean = true
    _subscription: AudioPlayer | undefined = undefined
    _queue: Array<QueuedMusic> = new Array()
    _current: CurrentPlaying | undefined = undefined
    constructor(guild: LinkedGuild) {
        this._guild = guild
    }
    get guild() {
        return this._guild
    }
    addQueue = (music: QueuedMusic): boolean => {
        if (this._queue.includes(music)) {
            return false
        } else {
            this._queue.push(music)
            if (this._q_looping) this._q_store.push(music)
            return true
        }
    }
    skip = async (vc: VoiceConnection): Promise<PlayerState> => {
        if (this._playing) {
            this._queue = this._queue.filter((m, i) => i !== this._current?.index)
            if (this._subscription != null) {
                this._subscription.stop()
                if (this._queue.length > 0) {
                    this._current = { track: this._queue[0]._song, index: 0, by: this._queue[0]._by, qmusic: this._queue[0], startTime: new Date() }
                    this._subscription.play(createAudioResource((await play.stream(this._current.track.url, config.cookie)).stream))
                    this._idle = false
                    this._subscription.once(AudioPlayerStatus.Idle, () => {
                        if (this.__lq_check()) {
                            this.start(vc)
                        } else {
                            this.next(vc)
                        }
                    })
                    return { playing: true, response: "ok" }
                } else {
                    this.__idle()
                    this._playing = false
                    return { playing: false, response: "ok" }
                }
            } else {
                return { playing: this._playing, response: "error", error: [PlayerError.NOTHING_PLAYING] }
            }
        } else {
            return { playing: false, response: "error", error: [PlayerError.NOTHING_PLAYING] }
        }
    }
    removeQueue = (name: string): boolean => {
        const found = this._queue.find((qm, i) => qm._song.title === name)
        if (found) {
            const q = this._queue.filter(qm => qm != found)
            this._queue = q
            if (this._q_looping) {
                this._q_store = q
            }
            return true
        } else {
            return false
        }
    }
    __lq_check = () => {
        console.log(this._q_store.map(q => q._song.title))
        const c = this.__isCurrentLastSongLQ()
        if (c) {
            this._queue = cloneDeep(this._q_store)
        }
        return c
    }
    start = async (vc: VoiceConnection): Promise<PlayerState> => {
        console.log("-----------")
        if (!this._started) {
            console.log("not started")
            if (!this._playing && this._queue.length > 0) {
                console.log("not playing and queue isnot empty")
                console.log(this._queue.map(qm => qm._song.title))
                try {
                    this._playing = true
                    this._current = { track: this._queue[0]._song, index: 0, by: this._queue[0]._by, qmusic: this._queue[0], startTime: new Date() }
                    this._subscription = this._subscription ? this._subscription : createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } })
                    const stream = await play.stream(this._queue[0]._song.url, config.cookie)
                    this._subscription.play(createAudioResource(
                        stream.stream, { inputType: StreamType.Arbitrary }
                    ))
                    this._idle = false
                    vc.subscribe(this._subscription)
                    this._subscription.once(AudioPlayerStatus.Idle, () => {
                        if (this.__lq_check()) {
                            this._playing = false
                            this.start(vc)
                        } else {
                            this.next(vc)
                        }
                    })
                    vc.on(VoiceConnectionStatus.Disconnected, () => {
                        this._playing = false
                        this._started = false
                    })
                    return { playing: true, response: "ok" }
                } catch (error) {
                    return { playing: false, response: "error", error: [PlayerError.UNKNOWN] }
                }
            } else if (!this._playing && this._queue.length <= 0) {
                console.log("Not playing and queue length 0")
                this.__idle()
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] };
            } else if (this._playing && this._queue.length > 0) {
                console.log("Playing and queue length not 0")
                return { playing: true, response: "error", error: [PlayerError.ALREADY_PLAYING] }
            } else if (this._playing && this._queue.length <= 0) {
                console.log("Playing and queue length 0")
                return { playing: true, response: "error", error: [PlayerError.ALREADY_PLAYING, PlayerError.NO_QUEUE] };
            } else {
                console.log("?????")
                return { playing: this._playing, response: "error", error: [PlayerError.UNKNOWN] }
            }
        } else {
            console.log("started")
            return { playing: this._playing, response: "error", error: [PlayerError.UNKNOWN] }
        }
    }
    play = async (vc: VoiceConnection, which: number): Promise<PlayerState> => {
        if (!this._playing) {
            if (this._queue[which] != undefined) {
                this._playing = true
                this._current = { track: this._queue[which]._song, index: which, by: this._queue[which]._by, qmusic: this._queue[which], startTime: new Date() }
                this._subscription?.play(createAudioResource(
                    (await play.stream(this._queue[which]._song.url, config.cookie)).stream
                ))
                this._idle = false
                this._subscription?.once(AudioPlayerStatus.Idle, () => {
                    if (this.__lq_check()) {
                        this._playing = false
                        this.start(vc)
                    } else {
                        this.next(vc)
                    }
                })
                return { playing: true, response: "ok" }
            } else {
                this._playing = false
                this._current = undefined
                this.__idle()
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] }
            }
        } else {
            this._playing = true
            return { playing: true, response: "error", error: [PlayerError.ALREADY_PLAYING] }
        }
    }
    __idle = () => {
        this._idle = true
        setTimeout(() => {
            if (this._idle) {
                this._guild._voiceConnection?.disconnect()
                this._playing = false
                this._started = false
                this._queue = []
            }
        }, 300000)
    }
    __lq = () => {
        this._q_looping = true
        this._q_store = cloneDeep(this._queue)
    }
    __isCurrentLastSongLQ = (): Boolean => {
        if (this._q_store.length > 0) {
            console.log("RRRRRRRRRRRRRRRRR")
            console.log(this._q_store[this._q_store.length-1]._song.id)
            console.log("RRRRRRRRRRRRRRRRR")
            console.log(this._current?.track.id)
            return this._current?.track.id === this._q_store[this._q_store.length-1]._song.id
        } else {
            console.log("BI BI BI BI")
            return false
        }
    }
    next = async (vc: VoiceConnection): Promise<PlayerState> => {
        if (this._playing && this._current) {
            if (!this._looping) {
                this._queue = this._queue.filter((s, i) => i !== this._current?.index)
                if (this._queue[0]) {
                    this._current = { track: this._queue[0]._song, index: 0, by: this._queue[0]._by, qmusic: this._queue[0], startTime: new Date() }
                }
            }
            if (this._queue[0] || this._looping) {
                this._playing = true
                this._subscription?.play(createAudioResource(
                    (await play.stream(this._current.track.url, config.cookie)).stream
                ))
                this._idle = false
                const interaction = this._current.qmusic._qm
                interaction.followUp({embeds: [renderCurrent(this)]})
                this._subscription?.once(AudioPlayerStatus.Idle, () => {
                    if (this.__lq_check()) {
                        this._playing = false
                        console.log("GAY GAY GAY GAY GAY")
                        this.start(vc)
                    } else {
                        console.log("STRAIGHT STRAIGHT STRAIGHT")
                        this.next(vc)
                    }
                })
                return { playing: true, response: "ok" }
            } else {
                this._playing = false
                this._current = undefined
                this.__idle()
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] }
            }
        } else {
            if (this._queue.length > 0) {
                this._current = { track: this._queue[0]._song, index: 0, by: this._queue[0]._by, qmusic: this._queue[0], startTime: new Date() }
                this._playing = true
                this._subscription?.play(createAudioResource(
                    (await play.stream(this._current.track.url, config.cookie)).stream
                ))
                this._subscription?.on(AudioPlayerStatus.Idle, () => {
                    if (this.__lq_check()) {
                        this._playing = false
                        this.start(vc)
                    } else {
                        this.next(vc)
                    }
                })
                this._idle = false
                return { playing: true, response: "ok" }
            } else {
                this.__idle()
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] }
            }
        }
    }
    paginate = (): Array<Array<QueuedMusic>> => {
        const len = Math.ceil(this._queue.length > 7 ? this._queue.length / 7 : 1)
        const pages: Array<Array<QueuedMusic>> = []
        for (let i = 0; i < len; i++) {
            pages[i] = new Array()
        }
        let done = 0
        let page = 0
        this._queue.forEach(m => {
            pages[page][done] = m
            if (done == 7) {
                done = 0
                page++
                return
            }
            done++
        })
        return pages
    }
}
