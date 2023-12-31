"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../structures/Context");
const Event_1 = require("../structures/Event");
const Data_1 = require("../structures/Data");
exports.default = new Event_1.BaseEvent({
    name: 'onThreadUpdate',
    description: 'Executed when a thread is updated.',
    async listener(bot, old, thread) {
        const context = new Context_1.Context({
            guild: thread.guild,
            raw: thread
        }, bot);
        const commands = Array.from(bot.commands.values()).filter(cmd => cmd.type === 'threadUpdate');
        const data = new Data_1.Data({
            bot, ctx: context,
            env: {
                '__BDJS__OLD__THREAD__': old,
                '__BDJS__NEW__THREAD__': thread,
            },
            commandType: 'threadUpdate',
            functions: bot.functions,
            reader: bot.reader
        });
        for (const command of commands) {
            data.command = command;
            await data.reader.compile(command.code, data);
        }
    }
});
