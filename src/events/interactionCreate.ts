import { Context } from '../structures/Context'
import { BaseEvent } from '../structures/Event'
import { Data } from '../structures/Data'
import { Interaction } from 'discord.js'

export default new BaseEvent<[Interaction]>({
    name: 'onInteractionCreate',
    description: 'Executed when an interaction is created.',
    async listener(bot, interaction) {
        const context = new Context(interaction)

        // Any interaction commands.
        bot.commands.filter(cmd => cmd.type === 'anyInteraction').forEach(async cmd => {
            const data = new Data({
                bot,
                commandType: 'anyInteraction',
                context,
                functions: bot.functions,
                instanceTime: new Date,
                reader: bot.reader
            })
            await data.reader.compile(cmd.code, data)
        })

        // Button interactions.
        if (interaction.isButton()) {
            const data = new Data({
                bot,
                commandType: 'buttonInteraction',
                context,
                functions: bot.functions,
                instanceTime: new Date,
                reader: bot.reader
            })
            const command = bot.commands.filter(
                cmd => cmd.type === 'buttonInteraction'
            ).find(
                cmd => cmd.name === interaction.customId
            )
            if (command) await data.reader.compile(command.code, data)
        }

        // Select menu interactions.
        if (interaction.isAnySelectMenu()) {
            const data = new Data({
                bot,
                commandType: 'buttonInteraction',
                context,
                functions: bot.functions,
                instanceTime: new Date,
                reader: bot.reader
            })
            const command = bot.commands.filter(
                cmd => cmd.type === 'selectMenuInteraction'
            ).find(
                cmd => cmd.name === interaction.customId
            )
            if (command) await data.reader.compile(command.code, data)
        }

        // Modal interactions.
        if (interaction.isModalSubmit()) {
            const data = new Data({
                bot,
                commandType: 'modalInteraction',
                context,
                functions: bot.functions,
                instanceTime: new Date,
                reader: bot.reader
            })
            const command = bot.commands.filter(
                cmd => cmd.type === 'modalInteraction'
            ).find(
                cmd => cmd.name === interaction.customId
            )
            if (command) await data.reader.compile(command.code, data)
        }

        // Slash commands
        if (interaction.isCommand()) {
            const data = new Data({
                bot,
                commandType: 'commandInteraction',
                context,
                functions: bot.functions,
                instanceTime: new Date,
                reader: bot.reader
            })
            const command = bot.commands.filter(
                cmd => cmd.type === 'commandInteraction'
            ).find(
                cmd => cmd.name?.startsWith(interaction.commandName)
            )
            if (command) await data.reader.compile(command.code, data)
        }
    }
})