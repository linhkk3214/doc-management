import { ObjectType } from '../classes/model/common';

export interface IListBase {
    getData(): ObjectType[];
}

export interface IResponse {
    success: boolean;
    error?: string;
    status: number;
}

export interface IResponseData<T> extends IResponse {
    data?: T;
    total: number;
}

export class ListData<T> {
    data: T[];
    total: number;
    constructor(data: T[], total: number) {
        this.data = data;
        this.total = total;
    }
}