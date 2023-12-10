const { BaseFunction } = require('../dist/structures/Function')
const { FunctionManager } = require('../dist/managers/Function')
const { CommandManager } = require('../dist/managers/Command')
const { Condition } = require('../dist/util/Condition')
const { Data } = require('../dist/structures/Data')
const { Reader } = require('../dist/core/Reader')
const { Util } = require('../dist/util/Util')
const { join } = require('path')

const functions = new FunctionManager()
functions.set('print', require('../dist/functions/print').default)
functions.set('if', require('../dist/functions/if').default)
functions.set('version', require('../dist/functions/version').default)
functions.set('lower', new BaseFunction({
    description: 'xd',
    parameters: [{
        name: 'xd',
        description:'aw',
        compile:true,
        unescape:true
    }],
    code: async (d, [text]) => {
        return text.toLowerCase()
    }
}))

const reader = new Reader

const data = new Data({
    env: {
        message: 'HELLO WORLD!'
    },
    functions,
    instanceTime: new Date,
    commandType: 'unknown',
    reader
})

reader.compile(`
$version
`.trim(), data).then((d) => {
    console.log(
        d.code
    )
})