import { RawFunction, RawString } from './Structures'
import { Data } from '../structures/Data'
import { Log } from '../util/Log'

/**
 * Represents the compiled data by BDJS reader.
 */
export interface CompiledData {
    functions: RawFunction[]
    function: RawFunction
    strings: RawString[]
    string: RawString
    temp: RawString
    depth: number
    line: number
    type: string
}

/**
 * Check if the provided string is word.
 * @param {string} t The string to test.
 * @returns {boolean}
 */
function isWord(t: string) {
    return /\w/.test(t)
}

const escapers = [
    ['%SEMI%', ';'],
    ['%COLON%', ':'],
    ['%LEFT%', '['],
    ['%RIGHT%', ']'],
    ['%DOL%', '$']
]

/**
 * Escape a text.
 * @param text - The text to escape.
 * @returns {string}
 */
function EscapeText(text: string) {
    for (const escaper of escapers) {
        text = text.replace(new RegExp(`${escaper[1]}`, 'ig'), escaper[0])
    }
    return text
}

/**
 * Unescape a text.
 * @param text - The text to escape.
 * @returns {string}
 */
function UnescapeText(text: string) {
    for (const escaper of escapers) {
        text = text.replace(new RegExp(`${escaper[0]}`, 'ig'), escaper[1])
    }
    return text
}

/**
 * BDJS code reader.
 */
export class Reader {
    /**
     * Reads BDJS code.
     * @param {string} code BDJS code to read.
     * @param {Data} data Environment data.
     * @returns {Promise<Data>}
     */
    async compile(code: string, data: Data) {
        const lines = code.split('\n').map(line => line.trim()).join('\n')

        let compiled: CompiledData = {
            functions: [],
            strings: [],
            function: new RawFunction,
            string: new RawString,
            depth: 0,
            line: 1,
            type: 'any',
            temp: new RawString
        }
        
        // Reading each line character.
        for (let i = 0; i < lines.length; i++) {
            const char = lines[i], next = lines[i + 1]            

            if (char === '\n') compiled.line++

            if ('[' === char) compiled.depth++
            else if (']' === char) compiled.depth--

            if (compiled.type === 'any') {
                if ('$' === char && isWord(next)) {
                    compiled.temp.write(char)
                    compiled.type = 'function:name'
                    if (compiled.string.isEmpty === false) {
                        compiled.strings.push(compiled.string)
                        compiled.string = new RawString
                    }
                } else compiled.string.write(char)
            } else {
                const [start, mode] = compiled.type.split(':')
                if (mode === 'name') {
                    if ([' ', '\n'].includes(char)) {
                        compiled.function.setName(compiled.temp.value)
                        .setLine(compiled.line)
                        .setIndex(compiled.functions.length)
                        .setClosed(true);
                        compiled.strings.push(
                            new RawString().overwrite(
                                `(call_${compiled.functions.length})`
                            )
                        )
                        compiled.functions.push(compiled.function)
                        compiled.function = new RawFunction
                        compiled.temp = new RawString
                        compiled.type = 'any'
                    } else if ('[' === char) {
                        compiled.type = 'function:parameters'
                        compiled.function.setName(compiled.temp.value)
                        .setLine(compiled.line)
                        .setIndex(compiled.functions.length);
                        compiled.temp = new RawString
                    } else compiled.temp.write(char)
                } else if (mode === 'parameters') {
                    if (';' === char && compiled.depth <= 1) {
                        compiled.function.addField(
                            compiled.temp.value
                        )
                        compiled.temp = new RawString
                    } else if (']' === char && compiled.depth <= 0) {
                        compiled.function.addField(
                            compiled.temp.value
                        ).setClosed(true);
                        compiled.strings.push(
                            new RawString().overwrite(
                                `(call_${compiled.functions.length})`
                            )
                        )
                        compiled.functions.push(compiled.function)
                        compiled.function = new RawFunction
                        compiled.temp = new RawString
                        compiled.type = 'any'
                    } else compiled.temp.write(char)
                }
            }

        }

        if (compiled.string.isEmpty === false) {
            compiled.strings.push(compiled.string)
            compiled.string = new RawString
        }

        if (compiled.function.name !== '') {
            compiled.functions.push(compiled.function)
            compiled.function = new RawFunction
        }

        let parsedFunctions: string[] = [], texts = compiled.strings.map(str => str.value)

        for (const dfunc of compiled.functions) {
            const spec = data.functions.get(dfunc.name.slice(1).toUpperCase())
            if (!spec) {
                Log.error('"' + dfunc.name + '" is not a function.\n' + [
                    '|-> Please provide a valid function name at:',
                    '|-> Line: ' + dfunc.line,
                    '|-> Source: "' + dfunc.toString + '"',
                    '|--------------------------------------------'
                ].join('\n'))
                return
            } else if (dfunc.closed === false) {
                Log.error('"' + dfunc.name + '" is not a closed.\n' + [
                    '|-> Please make sure to close function fields at:',
                    '|-> Line: ' + dfunc.line,
                    '|-> Source: "' + dfunc.toString + '"',
                    '|-------------------------------------------------'
                ].join('\n'))
                return
            }

            const fields = dfunc.fields.map(field => field.value)
            for (let idx = 0; idx < fields.length; idx++) {
                const field = fields[idx],
                    compile = spec.parameters?.[idx].compile ?? true,
                    unescape = spec.parameters?.[idx].unescape ?? true
                
                const parsed = compile ? (await this.compile(field, data))?.code ?? '' : field
                const result = unescape ? UnescapeText(parsed) : parsed

                fields[idx] = result
            }

            const result = await spec.code(data, fields).catch(e => {
                Log.error('Something internal went wrong!' + [
                    JSON.stringify(e, null, 3)
                ].join('\n'))
            })
            parsedFunctions[parsedFunctions.length] = result === undefined ? '' : result
        }

        parsedFunctions.forEach((text, index) => {
            texts[texts.indexOf(`(call_${index})`)] = text
        })

        data.setCode(texts.join(''))
        data.compiled = compiled
        return data
    }
}