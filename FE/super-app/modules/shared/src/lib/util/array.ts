import { Direction, Sort } from '../classes/model/crud';
import { getValueByPath } from './object';

export class ArrayUtils {
    static isSame(array1: Array<number | string | Date | object>, array2: Array<number | string | Date | object>) {
        if (array1.length != array2.length)
            return false;
        for (const item of array1) {
            if (!array2.some(q => q == item))
                return false;
        }
        return true;
    }

    static isNullOrEmpty(array: Array<number | string | Date | object>) {
        if (array !== undefined && array !== null) {
            if (array.length > 0) {
                return false;
            }
        }
        return true;
    }

    static sort(sorts: Sort[]) {
        return (a: { [key: string]: [string | Date | number | object | null] }, b: { [key: string]: [string | Date | number | object | null] }) => {
            for (const sort of sorts) {
                const { field, dir = Direction.Asc, keyIsPath = false } = sort;
                const multiplier = dir;
                const valueA = keyIsPath ? getValueByPath(a, field) : a[field],
                    valueB = keyIsPath ? getValueByPath(b, field) : b[field];
                if (valueA < valueB) return -1 * multiplier;
                if (valueA > valueB) return 1 * multiplier;
            }
            return 0; // Trường hợp bằng nhau
        };
    }
}
