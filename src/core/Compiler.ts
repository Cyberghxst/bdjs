import { Lexer, LexerType } from "./Lexer.js";

enum CompilerTokenType {
    String,
    Function
}
interface BaseCompiledToken {
    type: CompilerTokenType
}
interface CompiledStringToken extends BaseCompiledToken {
    value: string
}
interface CompiledFunctionToken extends BaseCompiledToken {
    name: string
    source: string
    content: string,
    length: number
    fields: {
        source: string,
        value: unknown,
        index: number
    }[]
}
type CompiledToken = CompiledStringToken | CompiledFunctionToken
export enum CompilerPlaceholders {
    FunctionNotFound = "%##__##NAME##__##NOT##__##FOUND##__##%",
    NoFields = "%##__##NO##__##FIELDS##__##FOUND##__"
}

export class Compiler {
    static compile(code: string, trim = false) {
        if (trim)
            code = code.split("\n").map((line) => line.trim()).join("\n");

        /**
         * Builds compiled tokens.
         * @param c The code to be readed and splitted into tokens.
         */
        function construct(c: string) {
            const raw = Lexer.read(c),
                tokens: CompiledToken[] = [],
                isFunction = (v: LexerType) => LexerType.FName === v || LexerType.FParam === v,
                next = (i: number) => raw[i + 1];
            let temporal: CompiledStringToken = {
                type: CompilerTokenType.String,
                value: ""
            };
            for (let i = 0; i < raw.length; i++) {
                const token = raw[i];
                if (isFunction(token.type)) {
                    if (next(i) === undefined || !isFunction(next(i).type)) {
                        temporal.value += token.value;
                        temporal.type = CompilerTokenType.Function;
                        tokens.push(temporal);
                        temporal = {
                            type: CompilerTokenType.String,
                            value: ""
                        };
                    } else temporal.value += token.value;
                } else {
                    if (next(i) === undefined || isFunction(next(i).type)) {
                        temporal.value += token.value;
                        tokens.push(temporal);
                        temporal = {
                            type: CompilerTokenType.String,
                            value: ""
                        };
                    } else temporal.value += token.value;
                }
            }
            return tokens;
        }

        /**
         * Reestructurates a string typed token into a proper function token.
         * @param content The token content to parse.
         */
        function restructurate(content: string): CompiledFunctionToken {
            const name = content.match(/\$\w+/)?.[0] ?? CompilerPlaceholders.FunctionNotFound;
            const inside = name !== CompilerPlaceholders.FunctionNotFound && (content.includes("]") && content.includes("[")) ? content.slice(content.indexOf("[") + 1, content.indexOf("]")) : CompilerPlaceholders.NoFields;
            const fields: {
                source: string,
                value: unknown,
                index: number
            }[] = [];
            let length = 0;
            if (inside !== CompilerPlaceholders.NoFields) {
                let depth = 0, writing = "", argi = 0;
                for (const char of Array.from(inside)) {
                    if (char === "[") depth++;
                    else if (char === "]") depth--;
                    if (char === ";" && depth <= 0) {
                        fields.push({
                            source: writing,
                            value: null,
                            index: argi
                        });
                        writing = "", argi++;
                        continue;
                    }
                    writing += char;
                }
                if (writing !== "") fields.push({
                    source: writing,
                    value: null,
                    index: argi
                });
                length = argi;
            }
            return {
                name,
                content: inside,
                source: content,
                fields,
                length,
                type: CompilerTokenType.Function
            };
        }

        const tokens = construct(code).map(token => {
            if (token.type === CompilerTokenType.String)
                return token;
            else return restructurate((token as CompiledStringToken).value);
        });
        return tokens;
    }
}