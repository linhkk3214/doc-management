import { PrimitiveType } from '../../interfaces/i-form-model';
import { isLiteralObject, ObjectType } from './common';

export enum FilterOperator {
    equal = 1,
    notEqual,
    lower,
    lowerOrEqual,
    greater,
    greaterOrEqual,

    contains,
    notContains,
    startsWith,
    notStartsWith,
    endsWith,
    notEndsWith,

    in,
    notIn,

    isNull,
    isNotNull,
    isTrue,
    isFalse,

    relationalData
}

export enum Direction {
    Asc = 1,
    Desc = -1
}

export class GridInfo {
    fields?: string;
    filters?: Filter[];
    sorts?: Sort[];
    includes?: Include[];
    page = 1;
    pageSize = 15;

    clone() {
        const gridInfo = new GridInfo();
        gridInfo.fields = this.fields;
        if (this.filters) {
            const length = this.filters.length;
            gridInfo.filters = [];
            for (let i = 0; i < length; i++) {
                gridInfo.filters.push(this.filters[i].clone());
            }
        }
        gridInfo.sorts = this.sorts;
        gridInfo.includes = this.includes;
        gridInfo.page = this.page;
        gridInfo.pageSize = this.pageSize;
    }

    getFilterValue(field: string, removeFilter = false) {
        if (!this.filters) return null;
        for (let i = 0; i < this.filters.length; i++) {
            if (this.filters[i].field == field) {
                const value = this.filters[i].value;
                if (removeFilter) {
                    this.filters.splice(i, 1);
                }
                return value;
            }
        }
        return null;
    }

    async modifyFilter(field: string, funcModify: (filter: Filter) => void) {
        if (!this.filters) return;
        for (let i = 0; i < this.filters.length; i++) {
            if (this.filters[i].field == field) {
                await funcModify(this.filters[i]);
                break;
            }
        }
    }

    /**
     * Remove unused data when filtering by API
     */
    clean() {
        if (this.filters) {
            const result = Filter.cleanFilters(this.filters, undefined);
            if (result === undefined) {
                this.filters = undefined;
            }
        }
    }
}

export class Include {
    field: string;
    then?: Include;
    filters?: Filter[];

    constructor(field: string) {
        this.field = field;
    }

    thenInclude(field: string) {
        this.then = new Include(field);
        return this.then;
    }
}

export class Sort {
    field: string;
    dir: Direction = Direction.Asc;
    keyIsPath?: boolean = false;

    constructor(field: string, dir: Direction = Direction.Asc) {
        this.field = field;
        this.dir = dir;
    }
}

export class Filter {
    field?: string;
    logic?: 'or' | 'and';
    funcGetValue: (filter: Filter, item: ObjectType | PrimitiveType) => PrimitiveType | null = Filter.getValueFromObject;
    valueField = 'value';
    value?: string;
    operator?: FilterOperator;
    filters?: Filter[];

    static fromPrefix = '_from';
    static toPrefix = '_to';

    constructor(field?: string, operator?: FilterOperator, value?: string) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    clone() {
        const filter = new Filter();
        filter.field = this.field;
        filter.logic = this.logic;
        filter.funcGetValue = this.funcGetValue;
        filter.value = this.value;
        filter.operator = this.operator;
        if (this.filters != null) {
            filter.filters = [];
            const length = this.filters.length;
            for (let i = 0; i < length; i++) {
                filter.filters.push(this.filters[i].clone());
            }
        }
        return filter;
    }

    static buildFilter(field: string, operator: FilterOperator, value?: ObjectType | PrimitiveType) {
        return new Filter(field, operator, !value ? undefined : JSON.stringify(value));
    }

    static buildLogicFilter(logic: 'and' | 'or', ...filters: Filter[]): Filter {
        const filter = new Filter();
        filter.logic = logic;
        filter.filters = filters;
        return filter;
    }

    static buildFilterForArrayField(field: string, values: string[]) {
        const filter = new Filter();
        filter.logic = 'or';
        const filters: Array<Filter> = [];
        values.forEach(value => {
            const jsonValue = JSON.stringify(value);
            filters.push(
                new Filter(field, FilterOperator.equal, jsonValue),
                new Filter(field, FilterOperator.startsWith, `${jsonValue},`),
                new Filter(field, FilterOperator.endsWith, `,${jsonValue}`),
                new Filter(field, FilterOperator.contains, `,${jsonValue},`)
            );
        });
        filter.filters = filters;
    }

    static buildFieldsContains(fields: string[], value: string): Filter {
        const filter = new Filter();
        filter.logic = 'or';
        const filters: Array<Filter> = [];
        fields.forEach(field => {
            filters.push(new Filter(field, FilterOperator.contains, value));
        });
        filter.filters = filters;
        return filter;
    }

    static buildFieldExistValue(field: string, values: Array<string>) {
        const filter = new Filter();
        filter.logic = 'or';
        const filters: Array<Filter> = [];
        values.forEach(value => {
            filters.push(new Filter(field, FilterOperator.contains, value));
        });
        filter.filters = filters;
        return filter;
    }

    static applyValue(filters: Filter[], fields: Set<string>, dicValue: ObjectType, result: Filter[]) {
        const length = filters.length;
        for (let i = 0; i < length; i++) {
            const element = filters[i];
            if (element.logic) {
                if (element.filters) {
                    const childResult: Filter[] = [];
                    Filter.applyValue(element.filters, fields, dicValue, childResult);
                    if (childResult.length > 0) {
                        result.push(Filter.buildLogicFilter(element.logic, ...childResult));
                    }
                }
            }
            else if (element.field != null) {
                if (fields.has(element.field)) {
                    const value = this.getFilterValue(dicValue[element.field], element);
                    if (value !== undefined) {
                        element.value = JSON.stringify(value);
                        switch (element.operator) {
                            case FilterOperator.isTrue:
                                result.push(new Filter(element.field, value ? FilterOperator.isTrue : FilterOperator.isFalse, element.value));
                                break;
                            case FilterOperator.isFalse:
                                result.push(new Filter(element.field, value ? FilterOperator.isFalse : FilterOperator.isTrue, element.value));
                                break;
                            default:
                                result.push(new Filter(element.field, element.operator, element.value));
                                break;
                        }
                    }
                    else {
                        element.value = undefined;
                    }
                }
                else if (element.value !== undefined) {
                    result.push(element);
                }
            }
        }
    }

    static getValueFromObject(filter: Filter, item: ObjectType | PrimitiveType): PrimitiveType | null {
        return (<ObjectType>item)[filter.valueField];
    }

    static getFilterValue(value: ObjectType | PrimitiveType, filter: Filter): PrimitiveType | null {
        if (isLiteralObject(value)) {
            return filter.funcGetValue(filter, value);
        }
        else {
            return <PrimitiveType>value;
        }
    }

    static removeValue(filters: Filter[]) {
        const length = filters.length;
        for (let i = 0; i < length; i++) {
            const element = filters[i];
            if (element.logic) {
                if (element.filters) {
                    Filter.removeValue(element.filters);
                }
            }
            else if (element.field != null) {
                element.value = undefined;
            }
        }
    }

    /**
     * Remove unused data when filtering by API
     */
    clean() {
        if (this.filters) {
            const result = Filter.cleanFilters(this.filters, this.logic);
            if (result === undefined) {
                this.filters = this.logic = this.field = undefined;
            }
            else {
                this.logic = result[1];
            }
        }
        else {
            this.logic = undefined;
        }
    }

    static cleanFilters(filters: Filter[], logic: 'and' | 'or' | undefined): [Filter[], 'and' | 'or'] | undefined {
        let count = filters.length;
        if (count == 0) {
            return undefined;
        }
        else {
            if (!logic)
                logic = 'and';
            for (let i = 0; i < count; i++) {
                const filter = filters[i];
                filter.clean();
                if (!filter.logic) {
                    if (!filter.field) {
                        filters.splice(i, 1);
                        i--;
                        count--;
                        continue;
                    }
                }
                else if (filter.logic == logic) {
                    const childFilters = <Filter[]>filter.filters;
                    filters.splice(i, 1, ...childFilters);
                    const additionalCount = childFilters.length - 1;
                    i += additionalCount;
                    count += additionalCount;
                    continue;
                }
            }
        }
        return [filters, logic];
    }
}

export enum StringCompareOption {
    Normal,
    FreeText,
    IgnoreCase
}
