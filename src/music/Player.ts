import { Guild } from 'discord.js'
import { AudioPlayer, VoiceConnection, VoiceConnectionStatus, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, StreamType } from '@discordjs/voice'
import { QueuedMusic } from './QueuedMusic'
import { PlayerState, PlayerError, CurrentPlaying } from '../Def'
import * as play from 'play-dl'
const config = require("../../config.json")

export class Player {
    _playing: boolean = false
    _started: boolean = false
    _looping: boolean = false
    _guild: Guild
    _subscription: AudioPlayer | undefined = undefined
    _queue: Array<QueuedMusic> = new Array()
    _current: CurrentPlaying | undefined = undefined
    constructor(guild: Guild) {
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
            return true
        }
    }
    skip = async (vc: VoiceConnection): Promise<PlayerState> => {
        if (this._playing) {
            this._queue = this._queue.filter((m, i) => i !== this._current?.index)
            if (this._subscription != null) {
                this._subscription.stop()
                if (this._queue.length > 0) {
                    this._current = { track: this._queue[0].song, index: 0, by: this._queue[0]._by }
                    this._subscription.play(createAudioResource((await play.stream(this._current.track.video_details.url, config.cookie)).stream))
                    this._subscription.once(AudioPlayerStatus.Idle, () => {
                        this.next(vc)
                    })
                    return { playing: true, response: "ok" }
                } else {
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
        const found = this._queue.find((qm, i) => qm.song.video_details.title === name)
        if (found) {
            this._queue = this._queue.filter(qm => qm != found)
            return true
        } else {
            return false
        }
    }
    start = async (vc: VoiceConnection): Promise<PlayerState> => {
        if (!this._started) {
            if (!this._playing && this._queue.length > 0) {
                try {
                    this._playing = true
                    this._current = { track: this._queue[0].song, index: 0, by: this._queue[0].queuedBy }
                    this._subscription = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } })
                    const stream = await play.stream(this._queue[0].song.video_details.url, config.cookie)
                    this._subscription.play(createAudioResource(
                        stream.stream, { inputType: StreamType.Arbitrary }
                    ))
                    vc.subscribe(this._subscription)
                    this._subscription.once(AudioPlayerStatus.Idle, () => {
                        this.next(vc)
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
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] };
            } else if (this._playing && this._queue.length > 0) {
                return { playing: true, response: "error", error: [PlayerError.ALREADY_PLAYING] }
            } else if (this._playing && this._queue.length <= 0) {
                return { playing: true, response: "error", error: [PlayerError.ALREADY_PLAYING, PlayerError.NO_QUEUE] };
            } else {
                return { playing: this._playing, response: "error", error: [PlayerError.UNKNOWN] }
            }
        } else {
            return { playing: this._playing, response: "error", error: [PlayerError.UNKNOWN] }
        }
    }
    play = async (vc: VoiceConnection, which: number): Promise<PlayerState> => {
        if (!this._playing) {
            if (this._queue[which] != undefined) {
                this._playing = true
                this._current = { track: this._queue[which].song, index: which, by: this._queue[which].queuedBy }
                this._subscription?.play(createAudioResource(
                    (await play.stream(this._queue[which].song.video_details.url, config.cookie)).stream
                ))
                this._subscription?.once(AudioPlayerStatus.Idle, () => {
                    this.next(vc)
                })
                return { playing: true, response: "ok" }
            } else {
                this._playing = false
                this._current = undefined
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] }
            }
        } else {
            this._playing = true
            return { playing: true, response: "error", error: [PlayerError.ALREADY_PLAYING] }
        }
    }
    next = async (vc: VoiceConnection): Promise<PlayerState> => {
        if (this._playing && this._current) {
            if (!this._looping) {
                this._queue = this._queue.filter((s, i) => i !== this._current?.index)
                if (this._queue[0]) {
                    this._current = { track: this._queue[0].song, index: 0, by: this._queue[0].queuedBy }
                }
            }
            if (this._queue[0] || this._looping) {
                this._playing = true
                this._subscription?.play(createAudioResource(
                    (await play.stream(this._current.track.video_details.url, config.cookie)).stream
                ))
                this._subscription?.once(AudioPlayerStatus.Idle, () => {
                    this.next(vc)
                })
                return { playing: true, response: "ok" }
            } else {
                this._playing
                this._current = undefined
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] }
            }
        } else {
            if (this._queue.length > 0) {
                this._current = { track: this._queue[0].song, index: 0, by: this._queue[0].queuedBy }
                this._playing = true
                this._subscription?.play(createAudioResource(
                    (await play.stream(this._current.track.video_details.url, config.cookie)).stream
                ))
                return { playing: true, response: "ok" }
            } else {
                return { playing: false, response: "error", error: [PlayerError.NO_QUEUE] }
            }
        }
    }
    paginate = (): Array<Array<QueuedMusic>> => {
        const len = Math.ceil(this._queue.length > 5 ? this._queue.length / 5 : 1)
        const pages: Array<Array<QueuedMusic>> = []
        for (let i = 0; i < len; i++) {
            pages[i] = new Array()
        }
        let done = 0
        let page = 0
        this._queue.forEach(m => {
            pages[page][done] = m
            if (done == 5) {
                done = 0
                page++
                return
            }
            done++
        })
        return pages
    }
}