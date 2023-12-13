import { Context } from '../structures/Context'
import { BaseEvent } from '../structures/Event'
import { Data } from '../structures/Data'
import { Guild } from 'discord.js'

export default new BaseEvent<[Guild]>({
    name: 'onGuildCreate',
    description: 'Executed when bot joins a guild.',
    async listener(bot, guild) {
        const context = new Context(guild)
        const commands = bot.commands.filter(cmd => cmd.type === 'botJoin')
            const data = new Data({
                bot,
                context,
                commandType: 'memberJoin',
                functions: bot.functions,
                instanceTime: new Date,
                reader: bot.reader
            })

            for (const command of commands) {
                data.command = command
                await data.reader.compile(command.code, data)
            }
    }
})