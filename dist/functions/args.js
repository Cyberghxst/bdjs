"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Function_1 = require("../structures/Function");
const ALLOWED_EVENTS = [
    'always',
    'prefixed',
    'unprefixed',
    'messageUpdate',
    'messageDelete'
];
exports.default = new Function_1.BaseFunction({
    description: 'Get context message arguments, if any.',
    parameters: [
        {
            name: 'Index',
            description: 'The index to get the argument.',
            required: false,
            resolver: 'Number',
            value: 'none'
        },
        {
            name: 'End Index',
            description: 'The index to slice message arguments.',
            required: false,
            resolver: 'Number',
            value: 'none'
        }
    ],
    code: async (d, [index = '-1', endIndex]) => {
        if (!ALLOWED_EVENTS.includes(d.commandType))
            throw new d.error(d, 'disallowed', d.function.name, 'Message Context');
        if (index === undefined)
            throw new d.error(d, 'required', 'Index', d.function.name);
        if (isNaN(Number(index)))
            throw new d.error(d, 'invalid', 'Index', d.function.name);
        if (endIndex && isNaN(Number(endIndex)))
            throw new d.error(d, 'invalid', 'End Index', d.function.name);
        const args = d.getEnvironmentVariable('__BDJS__ARGS__');
        return endIndex
            ? args.slice(Number(index), Number(endIndex)).join(' ')
            : Number(index) === -1
                ? args.join(' ')
                : args[Number(index)];
    }
});
