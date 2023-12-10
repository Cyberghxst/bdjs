import { ActivityType, Collection } from 'discord.js'
import { Bot } from '../structures/Bot'
import { Util } from '../util/Util'
import { Log } from '../util/Log'
import ms from 'ms'

interface StatusData {
    text: string
    time?: string | number
    type?: ActivityType
    status?: 'online' | 'idle' | 'dnd' | 'invisible'
    url?: string
}

export class StatusManager {
    #data: Collection<string, StatusData>
    #bot: Bot
    constructor(bot: Bot) {
        this.#bot = bot
        this.#data = new Collection
    }

    /**
     * Add a status data to the manager.
     * @param status - Array of status objects.
     * @returns {StatusManager}
     */
    add(...status: StatusData[]) {
        for (const data of status) {
            let {
                text,
                type = ActivityType.Playing,
                status = 'online',
                time = 10000
            } = data
            if (!text) {
                Log.error('Missing status text!')
                break
            } else if (typeof time !== 'string' && typeof time !== 'number') {
                Log.error('Invalid status time provided!')
                break
            }

            if (typeof time === 'string') time = ms(time)

            if (time === null || isNaN(Number(time))) {
                Log.error('Invalid status time provided!')
                break
            }

            this.#data.set(this.#data.size.toString(), {
                text, type, status, time
            })
        }
        return this
    }

    /**
     * Rotates all cached statuses.
     */
    async rotate() {
        let i = 0;
        while (true) {
            const data = this.#data.get(i.toString()) as StatusData

            this.#bot.user.presence.set({
                activities: [
                    {
                        name: data.text,
                        type: data.type
                    }
                ],
                status: data.status
            })

            await Util.sleep(data?.time as number)

            if (i >= this.size - 1) i = 0
            else i++
        }
    }

    /**
     * Returns the number of cached statuses.
     */
    get size() {
        return this.#data.size
    }
}