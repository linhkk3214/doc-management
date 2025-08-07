export class StringUtils {
    static guidEmpty() {
        return '00000000-0000-0000-0000-000000000000';
    }

    static s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    static guid(hasDelimiter = true) {
        if (hasDelimiter)
            return `${StringUtils.s4()}${StringUtils.s4()}-${StringUtils.s4()}-${StringUtils.s4()}-${StringUtils.s4()}-${StringUtils.s4()}${StringUtils.s4()}${StringUtils.s4()}`;
        return `${StringUtils.s4()}${StringUtils.s4()}${StringUtils.s4()}${StringUtils.s4()}${StringUtils.s4()}${StringUtils.s4()}${StringUtils.s4()}${StringUtils.s4()}`;
    }

    static htmlEncode(str: string) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&quot;');
    }

    static isNullOrWhiteSpace(input: string) {
        if (input !== undefined && input !== null) {
            if (input.trim() !== '') {
                return false;
            }
        }
        return true;
    }

    static stringFormat(inputString: string, ...args: string[]) {
        for (const index in args) {
            inputString = inputString.replace(`{${index}}`, args[index]);
        }

        return inputString;
    }

    static compare(value1: string, value2: string) {
        if (value1 == null && value2 != null)
            return -1;
        else if (value1 != null && value2 == null)
            return 1;
        else if (value1 == null && value2 == null)
            return 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
            return value1.localeCompare(value2);
        else {
            return 0;
        }
    }

    static isNumber(str: string) {
        if (!str) { return false; }
        const num = Number(str);
        return !Number.isFinite(num) && !Number.isNaN(num);
    }

    static upperFirstLetterOfWords(input: string): string {
        if (!input)
            return '';

        const result: Array<string> = [];
        const words = input.split(' ');
        const length = words.length;
        for (let i = 0; i < length; i++) {
            const word = words[i].trim();
            if (word) {
                result.push(
                    word.substring(0, 1).toUpperCase() + word.substring(1)
                )
            }
        }
        return result.join();
    }

    static toCamelCase(input: string) {
        if (!input)
            return '';
        input = input.trim();
        if (input.length == 0)
            return '';
        return input.substring(0, 1).toUpperCase() + input.substring(1)
    }
}