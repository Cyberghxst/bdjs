import { GuildMember, PartialGuildMember } from 'discord.js'
import { Context } from '../structures/Context'
import { BaseEvent } from '../structures/Event'
import { Data } from '../structures/Data'

export default new BaseEvent<[GuildMember | PartialGuildMember]>({
    name: 'onGuildMemberRemove',
    description: 'Executed when a new member joins a guild.',
    async listener(bot, member) {
        const context = new Context(member)
        const commands = bot.commands.filter(cmd => cmd.type === 'memberLeave')
            const data = new Data({
                bot,
                context,
                commandType: 'memberLeave',
                functions: bot.functions,
                instanceTime: new Date,
                reader: bot.reader
            })

            for (const command of commands) {
                await data.reader.compile(command.code, data)
            }
    }
})