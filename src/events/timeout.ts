import { BaseEvent } from '../structures/Event'
import { Data } from '../structures/Data'

export default new BaseEvent<[Record<string, any>]>({
    name: 'onTimeout',
    description: 'Executed when a timeout is emitted.',
    async listener(bot, env) {
        const commands = Array.from(bot.commands.values()).filter(cmd => cmd.type === 'timeout')
        const data = new Data({
            bot,
            commandType: 'timeout',
            env,
            functions: bot.functions,
            reader: bot.reader
        })
        for (const command of commands) {
            data.command = command
            await data.reader.compile(command.code, data)
        }
    }
})