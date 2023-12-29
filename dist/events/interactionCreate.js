"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../structures/Context");
const Event_1 = require("../structures/Event");
const Data_1 = require("../structures/Data");
exports.default = new Event_1.BaseEvent({
    name: 'onInteractionCreate',
    description: 'Executed when an interaction is created.',
    async listener(bot, interaction) {
        const context = new Context_1.Context(interaction, bot);
        // Any interaction commands.
        Array.from(bot.commands.values()).filter(cmd => cmd.type === 'anyInteraction').forEach(async (cmd) => {
            const data = new Data_1.Data({
                bot,
                commandType: 'anyInteraction',
                context,
                command: cmd,
                functions: bot.functions,
                reader: bot.reader
            });
            await data.reader.compile(cmd.code, data);
        });
        // Button interactions.
        if (interaction.isButton()) {
            const command = Array.from(Array.from(bot.commands.values()).values()).filter(cmd => cmd.type === 'buttonInteraction').find(cmd => cmd.name === interaction.customId);
            const data = new Data_1.Data({
                bot,
                commandType: 'buttonInteraction',
                context,
                functions: bot.functions,
                reader: bot.reader
            });
            if (command)
                data.command = command, await data.reader.compile(command.code, data);
        }
        // Select menu interactions.
        if (interaction.isAnySelectMenu()) {
            const command = Array.from(Array.from(bot.commands.values()).values()).filter(cmd => cmd.type === 'selectMenuInteraction').find(cmd => cmd.name === interaction.customId);
            const data = new Data_1.Data({
                bot,
                commandType: 'selectMenuInteraction',
                context,
                functions: bot.functions,
                reader: bot.reader
            });
            if (command)
                data.command = command, await data.reader.compile(command.code, data);
        }
        // Modal interactions.
        if (interaction.isModalSubmit()) {
            const command = Array.from(bot.commands.values()).filter(cmd => cmd.type === 'modalInteraction').find(cmd => cmd.name === interaction.customId);
            const data = new Data_1.Data({
                bot,
                commandType: 'modalInteraction',
                context,
                functions: bot.functions,
                reader: bot.reader
            });
            if (command)
                data.command = command, await data.reader.compile(command.code, data);
        }
        // Slash commands
        if (interaction.isChatInputCommand()) {
            const commands = Array.from(bot.commands.values()).filter(cmd => cmd.type === 'commandInteraction');
            const command = interaction.options.getSubcommandGroup(false)
                ? commands.find(cmd => cmd.name?.toLowerCase() === `${interaction.commandName} ${interaction.options.getSubcommand(false)} ${interaction.options.getSubcommandGroup(false)}`)
                : interaction.options.getSubcommand(false) ? commands.find(cmd => cmd.name?.toLowerCase() === `${interaction.commandName} ${interaction.options.getSubcommand(false)}`)
                    : commands.find(cmd => cmd.name?.toLowerCase() === interaction.commandName);
            const data = new Data_1.Data({
                bot,
                commandType: 'commandInteraction',
                context,
                functions: bot.functions,
                reader: bot.reader
            });
            if (command)
                data.command = command, await data.reader.compile(command.code, data);
        }
    }
});