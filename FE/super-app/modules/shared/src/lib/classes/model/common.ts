export type ObjectType = Record<string, any>;
export type Func<T> = () => T;
export type Action = () => void;
export type FuncMany<TArgs extends any[], TResult> = (...args: TArgs) => TResult;
export type ActionMany<TArgs extends any[]> = (...args: TArgs) => void;

export const isLiteralObject = (obj: any) => {
    return (obj instanceof Object)
        && !isArray(obj)
        && !isNumber(obj)
        && !isDate(obj)
        && !isFunction(obj)
        && !isBoolean(obj)
        && !isRegular(obj)
        && !isString(obj);
}

export const isNumber = (obj: any) => {
    return obj instanceof Number;
}

export const isDate = (obj: any) => {
    return obj instanceof Date;
}

export const isFunction = (obj: any) => {
    return obj instanceof Function;
}

export const isBoolean = (obj: any) => {
    return obj instanceof Boolean;
}

export const isString = (obj: any) => {
    return obj instanceof String;
}

export const isRegular = (obj: any) => {
    return obj instanceof RegExp;
}

export const isArray = (obj: any) => {
    return obj instanceof Array;
}

export const isSimpleType = (obj: any) => {
    const t = typeof obj;
    return t == 'number' || t == 'boolean' || t == 'string' || t == 'symbol' || t == 'bigint';
}

export const isValidDate = (date: any) => {
    return date instanceof Date && !isNaN(date.getTime());
}