"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Function_1 = require("../structures/Function");
exports.default = new Function_1.BaseFunction({
    description: 'Execute a code for each key/value pair.',
    parameters: [
        {
            name: 'Name',
            description: 'The name for this object.',
            required: true,
            resolver: 'String',
            value: 'none'
        },
        {
            name: 'Variable',
            description: 'Variable to load the results to.',
            required: true,
            resolver: 'String',
            value: 'none'
        },
        {
            name: 'Code',
            description: 'Code to be applied to each key/value pair.',
            required: true,
            compile: false,
            resolver: 'String',
            value: 'none'
        },
        {
            name: 'Separator',
            description: 'Result separator.',
            required: false,
            resolver: 'String',
            value: ','
        }
    ],
    code: async function (d, [name, variable, code, separator = ',']) {
        if (name === undefined)
            throw new d.error(d, 'required', 'Object Name', d.function?.name);
        if (variable === undefined)
            throw new d.error(d, 'required', 'Variable Name', d.function?.name);
        if (code === undefined)
            throw new d.error(d, 'required', 'Code', d.function?.name);
        if (!d.hasEnvironmentVariable(name))
            throw new d.error(d, 'invalid', 'Object Name', d.function?.name);
        let object = d.getEnvironmentVariable(name);
        if (typeof object !== 'object' || (typeof object === 'object' && !(JSON.stringify(object).startsWith('{')) && !(JSON.stringify(object).endsWith('}'))))
            throw new d.error(d, 'invalid', 'Object', d.function?.name);
        const results = [];
        for (const [key, value] of Object.entries(object)) {
            const data = d.extend(d);
            data.setEnvironmentVariable('key', key), data.setEnvironmentVariable('value', value);
            const compiled = await data.reader.compile(code, data);
            if (compiled.code !== '')
                results.push(compiled.code);
        }
        d.setEnvironmentVariable(variable, results.join(separator));
    }
});