import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ObjectType } from '../classes/model/common';
import { Filter, FilterOperator, GridInfo } from '../classes/model/crud';
import { IResponseData } from '../interfaces/i-list-base';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const API_ENDPOINT = {
  GET_DATA: 'GetData',
  GET_ALL: 'GetAll',
  GET_DETAIL: 'GetByFilter',
};

export abstract class BaseService {
  private _serviceUri: string;
  _http = inject(HttpClient);
  constructor(serviceUri: string) {
    this._serviceUri = serviceUri;
  }

  getData(gridInfo: GridInfo): Observable<IResponseData<ObjectType[]>> {
    return this._http.post<IResponseData<ObjectType[]>>(
      `${this._serviceUri}/${API_ENDPOINT.GET_DATA}`,
      gridInfo
    );
  }

  update(
    id: string,
    model: ObjectType
  ): Observable<IResponseData<ObjectType[]>> {
    return this._http.put<IResponseData<ObjectType[]>>(
      `${this._serviceUri}/${id}`,
      model
    );
  }

  getDetail(id: string): Observable<IResponseData<ObjectType>> {
    const gridInfo = new GridInfo();
    gridInfo.filters = [Filter.buildFilter('id', FilterOperator.equal, id)];
    gridInfo.page = 1;
    gridInfo.pageSize = 1;

    return this._http
      .post<IResponseData<ObjectType[]>>(
        `${this._serviceUri}/${API_ENDPOINT.GET_DATA}`,
        gridInfo
      )
      .pipe(
        map(
          (res): IResponseData<ObjectType> => ({
            data: res.data?.[0] ?? undefined,
            total: res.total,
            status: res.status,
            success: res.success,
          })
        )
      );
  }
}

export class HttpOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}
