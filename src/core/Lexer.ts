/**
 * Represents a Lexer Token Tyoe.
 */
export enum LexerType {
    String,
    FName,
    FParam
}

export interface LexerToken {
    type: LexerType,
    value: string
}

export class Lexer {
    /**
     * Reads the code and splits it into manipulable tokens.
     * @param code The code to be splitted into tokens.
     */
    static read(code: string): LexerToken[] {
        // Lexer data
        let type = LexerType.String, depth = 0;
        const tokens: LexerToken[] = [],
            chars = Array.from(code);

        // Util functions
        const appendToken = (type: LexerType, value: string) => tokens.push({ type, value }),
            isDollar = (t: string) => "$" === t,
            isSkippable = (t: string) => [" ", "\n", "\t"].includes(t),
            isAlpha = (t: string) => t.toLowerCase() !== t.toUpperCase(),
            isFunctionName = () => type === LexerType.FName,
            isFunctionArg = () =>  type === LexerType.FParam,
            isAnyFunctionState = () => isFunctionName() || isFunctionArg(),
            isOpenArg = (t: string) => "[" === t,
            isCloserArg = (t: string) => "]" === t,
            next = (i: number) => chars[i + 1];


        // Splitting tokens.
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i] as string;
            if (isOpenArg(char)) depth++;
            else if (isCloserArg(char)) depth--;
            if (isDollar(char) && isAlpha(next(i)))
                type = LexerType.FName;
            else if (isFunctionName() && isOpenArg(next(i)))
                type = LexerType.FParam;
            else if (depth <= 0 && isAnyFunctionState() && (isSkippable(char) || isCloserArg(char))) {
                appendToken(type, char);
                type = LexerType.String;
                continue;
            }
            appendToken(type, char);
        }

        // Returning splitted tokens.
        return tokens;
    }
}