import { ObjectType } from "../classes/model/common";

export function deepClone<T>(obj: T, weakMap = new WeakMap()): T {
    if (obj === null || typeof obj !== 'object') return obj;

    // Nếu đã clone rồi, tránh lặp vô hạn với circular reference
    if (weakMap.has(obj)) return weakMap.get(obj);

    // Nếu là Array
    if (Array.isArray(obj)) {
        const arrClone: any = [];
        weakMap.set(obj, arrClone);
        obj.forEach((item, i) => {
            arrClone[i] = deepClone(item, weakMap);
        });
        return arrClone as T;
    }

    // Clone giữ nguyên prototype (class)
    const clone = Object.create(Object.getPrototypeOf(obj));
    weakMap.set(obj, clone);

    for (const key of Object.keys(obj)) {
        clone[key] = deepClone((obj as any)[key], weakMap);
    }

    return clone;
}

export function getValueByPath(item: ObjectType, path: string) {
    const paths = path.split('.');
    const length = paths.length;
    if (length == 1)
        return item[paths[length - 1]];
    return paths.reduce((acc, key) => acc?.[key], item);
}

export function setValueByPath(item: ObjectType, path: string, val: any) {
    const paths = path.split('.');
    const length = paths.length;
    if (length == 1) {
        item[paths[length - 1]] = val;
        return;
    }
    for (let i = 0; i < length - 1; i++) {
        const path = paths[i];
        item = item[path];
        if (!item)
            return;
    }
    item[paths[length - 1]] = val;
}