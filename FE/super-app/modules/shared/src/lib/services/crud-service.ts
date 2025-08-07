import { DatePipe } from '@angular/common';
import { Injectable, Injector } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CrudService {
    private _commonService: CommonService;
    private datePipe: DatePipe;
    private _notifierService: NotifierService;
    constructor(
        private _injector: Injector,
    ) {
        this._commonService = this._injector.get(CommonService);
        this.datePipe = this._injector.get(DatePipe);
        this._notifierService = this._injector.get(NotifierService);
    }

    
    buildFilterDate(field: string, operator: Operator, value: Date): Filter {
        return new Filter({ field, operator, value: this.getDate(value) });
    }

    getDate(value: Date): string {
        return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
    }

    buildFilterDateInListRange(field: string, arrMinMax: Date[][], operatorLeft: string = 'gte', operatorRight: string = 'lte'): Filter {
        const result = new Filter({
            logic: 'or',
            filters: []
        });
        arrMinMax.forEach(minMax => {
            const strStart = this.getStringDateValue(minMax[0]);
            const strEnd = this.getStringDateValue(minMax[1]);
            result.filters.push(
                {
                    logic: 'and',
                    filters: [
                        this.buildFilter(field, Operator.greaterThanEqual, strStart),
                        this.buildFilter(field, Operator.lowerThanEqual, strEnd)
                    ]
                }
            );
        });

        return result;
    }

    getStringDateValue(value: Date) {
        return `${value.getUTCDate()}/${value.getUTCMonth() + 1}/${value.getUTCFullYear()} ${value.getUTCHours()}:${value.getUTCMinutes()}:${value.getUTCSeconds()}`;
    }


    createDropdownOptions(schema: DropdownControlSchema | ColumnSchemaBase) {
        const result = new DropdownOptions({
            fieldParentTreeItem: schema.fieldParentTreeItem,
            displayField: schema.displayField,
            valueField: schema.valueField,
            fieldPlus: schema.fieldPlus,
            fieldTree: schema.fieldTree,
            funcGetLabel: schema.funcGetLabel,
            sorts: schema.sorts,
            sortField: schema.sortField,
            sortDir: schema.sortDir,
            plusUrl: schema.plusUrl,
            callbackDataFinish: schema.callbackDataFinish,
            isServerLoad: schema.isServerLoad,
            refFields: schema.refFields,
            // TODO: Cần điền vào không có lỗi không chạy được
            selectChildItem: null
        });
        if (result.isServerLoad) {
            result.pageSize = schema.pageSize;
            // result.pageSize = 2;
        }
        return result;
    }

    async getRefDataInDatasource(
        dataSource: any[],
        schemas: RefField[],
        callBackAfterGetRefDataDropdown: Function = null,
    ) {
        if (!dataSource || !dataSource.length) return;
        if (!schemas || !schemas.length) return;
        const dicData: {
            schemas: RefField[],
            promises: Promise<any>[];
        }[] = [];
        // preprocess schema, them schema vao arr voi index = schema.order
        for (const schema of schemas) {
            const promise = schema.baseService ? this.processSchemaWithBaseService(schema, dataSource) : new Promise((resolve) => resolve(true));
            const data = dicData[schema.order];
            if (data == null) {
                dicData[schema.order] = {
                    promises: [promise],
                    schemas: [schema]
                };
                continue;
            }
            data.schemas.push(schema);
            data.promises.push(promise);
        }

        // get data va merge voi dataSource
        const lstData = Object.values(dicData);
        for (let index = 0; index < lstData.length; index++) {
            const data = lstData[index];
            if (data == null) {
                continue;
            }
            const promises = data.promises;
            const schemaDatas = data.schemas;

            if (promises.length === 0) {
                continue;
            }
            const arrRes = await Promise.all(promises);
            schemaDatas.forEach((schema, resIndex) => {
                const schemaData = arrRes[resIndex] === true ? schema.dataSource : arrRes[resIndex];
                if (schema.callbackDataFinish) {
                    schema.callbackDataFinish(<any>{
                        data: schemaData
                    });
                }
                schema.dataSource = schemaData;
                if (callBackAfterGetRefDataDropdown) {
                    callBackAfterGetRefDataDropdown(schema.field);
                }
            });
            this.mergeRefDatasToDatasource(dataSource, schemaDatas);
        }
    }

    private processSchemaWithBaseService(schema: RefField, dataSource: any[]) {
        const arrValue = [];
        dataSource.forEach(itemData => {
            const currentValue = schema.funcGetValueOfField(itemData);
            if (currentValue == null) {
                return;
            }

            if (schema.multiple) {
                this.mapValueMultiple(arrValue, currentValue, schema);
                return;
            }

            if (!arrValue.some(p => p == currentValue)) {
                arrValue.push(currentValue);
            }
        });

        if (schema.baseService instanceof MasterDataService) {
            return schema.baseService.getDataDropdown(
                schema.groupCode,
                arrValue,
                this.createDropdownOptions(schema));
        }
        return schema.baseService.getDataDropdownByFilter(
            [this._commonService.newFilter(schema.valueField, Operator.in, arrValue)],
            this.createDropdownOptions(schema)
        );
    }

    private mapValueMultiple(arrValue: any[], valueToMap, schema: RefField) {
        if (!valueToMap) {
            return;
        }
        let values = [];
        if (!Array.isArray(valueToMap)) {
            values = valueToMap.split(',');
        }
        else {
            values = valueToMap;
        }
        values.forEach(value => {
            if (!value) return;
            if (!arrValue.some(p => p == value)) {
                arrValue.push(value);
            }
        });
    }

    private getFuntionGetLabel(schema: RefField) {
        return schema.funcGetLabel ? schema.funcGetLabel : item => item[schema.displayFieldInGrid] || item[schema.displayField] || item['ten'];
    }

    private mergeRefDatasToDatasource(dataSource: any[], schemas: RefField[], callBackAfterGetRefDataDropdown?: Function) {
        // #region set default function
        for (const rowData of dataSource) {
            for (const schema of schemas) {
                const data = schema.dataSource;
                const field = schema.field;
                if (!data || !data.length) {
                    if (schema.funcSetValueRowWhenNullOrEmpty) {
                        schema.funcSetValueRowWhenNullOrEmpty(rowData);
                    }
                    continue;
                }
                const fieldData = schema.funcGetValueOfField(rowData);
                if (fieldData == null) {
                    continue;
                }
                const funcGetLabel = this.getFuntionGetLabel(schema);
                const funcSetValueRow = schema.funcSetValueRow
                    ? schema.funcSetValueRow
                    : (rowItem, data) => {
                    };
                const funcSetValueRowWhenNullOrEmpty = schema.funcSetValueRowWhenNullOrEmpty
                    ? schema.funcSetValueRowWhenNullOrEmpty
                    : (rowItem, data) => {
                    };
                const funcGetRefDataRow = schema.funcGetRefDataRow
                    ? schema.funcGetRefDataRow
                    : (refItems) => {
                        return refItems.map(item => funcGetLabel(item)).join(`${schema.separator} `);
                    };
                let funcGetRefDataSingle = (rowData) => {
                    const refItem = data.find(i => schema.funcCompare(i, fieldData));
                    if (refItem != null) {
                        rowData['str' + field] = funcGetLabel(refItem);
                        funcSetValueRow(rowData, refItem);
                        return;
                    }
                    funcSetValueRowWhenNullOrEmpty(rowData, refItem);
                };

                if (schema.isChildObject) {
                    funcGetRefDataSingle = (rowData) => {
                        const refItems = data.filter(i => schema.funcCompare(i, fieldData));
                        if (refItems != null) {
                            rowData['str' + field] = funcGetRefDataRow(refItems);
                            funcSetValueRow(rowData, refItems);
                        }
                        else {
                            funcSetValueRowWhenNullOrEmpty(rowData, refItems);
                        }
                    };
                }
                // #endregion
                if (schema.multiple) {
                    const ids = [];
                    this.mapValueMultiple(ids, fieldData, schema);
                    const refItems = data.filter(i => ids.some(q => schema.funcCompare(i, q)));
                    if (refItems.length > 0) {
                        rowData['str' + field] = funcGetRefDataRow(refItems);
                        funcSetValueRow(rowData, refItems);
                        continue;
                    }
                    funcSetValueRowWhenNullOrEmpty(rowData, refItems);
                    continue;
                }
                funcGetRefDataSingle(rowData);
            }

            // if (callBackAfterGetRefDataDropdown) {
            //     callBackAfterGetRefDataDropdown(rowData);
            // }
        }
    }

    private mergeRefDataToDatasource(dataSource: any[], schema: RefField, data: any[]) {
        const field = schema.field;
        if (!data || !data.length) {
            if (schema.funcSetValueRowWhenNullOrEmpty) {
                dataSource.forEach(itemData => {
                    schema.funcSetValueRowWhenNullOrEmpty(itemData);
                });
            }
            return;
        }
        // #region set default function
        const funcGetLabel = this.getFuntionGetLabel(schema);
        let funcSetValueRow = (rowItem, data) => {
        };
        let funcSetValueRowWhenNullOrEmpty = (rowItem, data) => {
        };
        let funcGetRefDataRow = (refItems) => {
            return refItems.map(item => funcGetLabel(item)).join(`${schema.separator} `);
        };
        if (schema.funcSetValueRow) {
            funcSetValueRow = schema.funcSetValueRow;
        }
        if (schema.funcSetValueRowWhenNullOrEmpty) {
            funcSetValueRowWhenNullOrEmpty = schema.funcSetValueRowWhenNullOrEmpty;
        }
        if (schema.funcGetRefDataRow) {
            funcGetRefDataRow = schema.funcGetRefDataRow;
        }
        let funcGetRefDataSingle = (rowData) => {
            const refItem = data.find(i => schema.funcCompare(i, schema.funcGetValueOfField(rowData)));
            if (refItem != null) {
                rowData['str' + field] = funcGetLabel(refItem);
                funcSetValueRow(rowData, refItem);
            }
            else {
                funcSetValueRowWhenNullOrEmpty(rowData, refItem);
            }
        };
        if (schema.isChildObject) {
            funcGetRefDataSingle = (rowData) => {
                const refItems = data.filter(i => schema.funcCompare(i, schema.funcGetValueOfField(rowData)));
                if (refItems != null) {
                    rowData['str' + field] = funcGetRefDataRow(refItems);
                    funcSetValueRow(rowData, refItems);
                }
                else {
                    funcSetValueRowWhenNullOrEmpty(rowData, refItems);
                }
            };
        }
        // #endregion
        if (schema.multiple) {
            dataSource.forEach(rowData => {
                if (schema.funcGetValueOfField(rowData) != null) {
                    const ids = [];
                    this.mapValueMultiple(ids, schema.funcGetValueOfField(rowData), schema);
                    const refItems = data.filter(i => ids.some(q => schema.funcCompare(i, q)));
                    if (refItems.length > 0) {
                        rowData['str' + field] = funcGetRefDataRow(refItems);
                        funcSetValueRow(rowData, refItems);
                    }
                    else {
                        funcSetValueRowWhenNullOrEmpty(rowData, refItems);
                    }
                }
            });
        }
        else {
            dataSource.forEach(rowData => {
                if (schema.funcGetValueOfField(rowData) != null) {
                    funcGetRefDataSingle(rowData);
                }
            });
        }
    }

    splitToListNumber(str: string, separator: string = ','): number[] {
        return str.split(separator).map(item => Number(item));
    }

    pushAsc(arr: any[], item: any, fieldOrder: string) {
        if (arr.length == 0) {
            arr.push(item);
            return;
        }
        for (let i = arr.length - 1; i >= 0; i--) {
            if (item[fieldOrder] >= arr[i][fieldOrder]) {
                arr.splice(i + 1, 0, item);
                return;
            }
        }
        arr.splice(0, 0, item);
    }

    pushDesc(arr: any[], item: any, fieldOrder: string) {
        if (arr.length == 0) {
            arr.push(item);
            return;
        }
        for (let i = 0; i < arr.length - 1; i++) {
            if (item[fieldOrder] >= arr[i][fieldOrder]) {
                arr.splice(i, 0, item);
                return;
            }
        }
        arr.push(item);
    }

    pushAscByFunc(arr: any[], item: any, func: Function): number {
        if (arr.length == 0) {
            arr.push(item);
            return arr.length - 1;
        }
        for (let i = arr.length - 1; i >= 0; i--) {
            if (func(item) >= func(arr[i])) {
                arr.splice(i + 1, 0, item);
                return i + 1;
            }
        }
        arr.splice(0, 0, item);
        return 0;
    }

    pushDescByFunc(arr: any[], item: any, func: Function) {
        if (arr.length == 0) {
            arr.push(item);
            return;
        }
        for (let i = 0; i < arr.length - 1; i++) {
            if (func(item) >= func(arr[i])) {
                arr.splice(i, 0, item);
                return;
            }
        }
        arr.push(item);
    }

    getTreeTableDataWithOrder(dataSource: any[], fieldTree: string, fieldOrder: string,
        valueParentRoot: string = null, dirOrder: number = 1, levelClose: number = 9999, options: any = {}
    ): TreeNode[] {
        const result: TreeNode[] = [];
        const funcGetValueOrder = item => {
            return item.data[fieldOrder];
        };
        dataSource.forEach(item => {
            if (item[fieldTree] == valueParentRoot) {
                const rootItem = <TreeNode>{
                    data: item,
                    level: 1,
                    leaf: true,
                    children: []
                };
                if (dirOrder == 1) {
                    this.pushAscByFunc(result, rootItem, funcGetValueOrder);
                }
                else {
                    this.pushDescByFunc(result, rootItem, funcGetValueOrder);
                }
                if (rootItem['level'] >= levelClose) {
                    rootItem.expanded = false;
                }
                else {
                    rootItem.expanded = true;
                }
                this.deQuyGetTreeTableDataWithOrder(rootItem, dataSource, fieldTree, dirOrder, funcGetValueOrder, levelClose, options);
                if (rootItem.children.length == 0) {
                    delete rootItem.children;
                }
                if (options.modifyTreeNode) {
                    options.modifyTreeNode(rootItem, item);
                }
            }
        });
        return result;
    }

    private deQuyGetTreeTableDataWithOrder(nodeParent: TreeNode, dataSource: any[], fieldTree: string,
        dirOrder: number, funcGetValueOrder: Function, levelClose: number, options: any = {}
    ) {
        dataSource.forEach(item => {
            if (item[fieldTree] == nodeParent.data.id) {
                const itemChildren = <TreeNode>{
                    data: item,
                    level: nodeParent['level'] + 1,
                    leaf: true,
                    children: []
                };
                if (dirOrder == 1) {
                    this.pushAscByFunc(nodeParent.children, itemChildren, funcGetValueOrder);
                }
                else {
                    this.pushDescByFunc(nodeParent.children, itemChildren, funcGetValueOrder);
                }
                if (itemChildren['level'] >= levelClose) {
                    itemChildren.expanded = false;
                }
                else {
                    itemChildren.expanded = true;
                }
                this.deQuyGetTreeTableDataWithOrder(itemChildren, dataSource, fieldTree, dirOrder, funcGetValueOrder, levelClose, options);
                if (itemChildren.children.length == 0) {
                    delete itemChildren.children;
                }
                if (options.modifyTreeNode) {
                    options.modifyTreeNode(itemChildren, item);
                }
            }
        });
    }

    getTreeTableData(dataSource: any[], fieldTree: string, valueParentRoot: string = null, levelClose: number = 9999, options: any = {}): TreeNode[] {
        const result: TreeNode[] = [];
        dataSource.forEach(item => {
            if (item[fieldTree] == valueParentRoot) {
                const rootItem = <TreeNode>{
                    data: item,
                    level: 1,
                    leaf: true,
                    children: []
                };
                result.push(rootItem);
                if (rootItem['level'] >= levelClose) {
                    rootItem.expanded = false;
                }
                else {
                    rootItem.expanded = true;
                }
                this.deQuyGetTreeTableData(rootItem, dataSource, fieldTree, levelClose, options);
                if (rootItem.children.length == 0) {
                    delete rootItem.children;
                }
                if (options.modifyTreeNode) {
                    options.modifyTreeNode(rootItem, item);
                }
            }
        });
        return result;
    }

    private deQuyGetTreeTableData(nodeParent: TreeNode, dataSource: any[], fieldTree: string, levelClose: number, options: any = {}) {
        dataSource.forEach(item => {
            if (item[fieldTree] == nodeParent.data.id) {
                const itemChildren = <TreeNode>{
                    data: item,
                    level: nodeParent['level'] + 1,
                    leaf: true,
                    children: []
                };
                nodeParent.children.push(itemChildren);
                if (itemChildren['level'] >= levelClose) {
                    itemChildren.expanded = false;
                }
                else {
                    itemChildren.expanded = true;
                }
                this.deQuyGetTreeTableData(itemChildren, dataSource, fieldTree, levelClose, options);
                if (itemChildren.children.length == 0) {
                    delete itemChildren.children;
                }
                if (options.modifyTreeNode) {
                    options.modifyTreeNode(itemChildren, item);
                }
            }
        });
    }

    getTreeData(dataSource: any[], fieldTree: string, option: TreeDataOption, valueParentRoot: string = null, levelClose: number = 9999): TreeNode[] {
        return this.getTreeTableData(dataSource, fieldTree, valueParentRoot, levelClose, {
            modifyTreeNode: (itemTree, itemData) => {
                itemTree.label = itemData[option.displayField];
                itemTree.expandedIcon = option.expandedIcon;
                itemTree.collapsedIcon = option.collapsedIcon;
            }
        });
    }

    getTreeDataWithOrder(dataSource: any[], fieldTree: string, fieldOrder: string,
        option: TreeDataOption, valueParentRoot: string = null, dirOrder: number = 1, levelClose: number = 9999
    ): TreeNode[] {
        return this.getTreeTableDataWithOrder(dataSource, fieldTree, fieldOrder, valueParentRoot, dirOrder, levelClose, {
            modifyTreeNode: (itemTree, itemData) => {
                itemTree.label = itemData[option.displayField];
                itemTree.shortLabel = itemData[option.shortDisplayField];
                itemTree.expandedIcon = option.expandedIcon;
                itemTree.collapsedIcon = option.collapsedIcon;
            }
        });
    }

    createGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Get điều kiện tìm kiếm mặc định (Cấu hình hệ đào tạo, năm học, học kỳ)
    // Chỉ sử dụng cho phần mềm quản lý đào tạo
    getDefaultSearchData() {
        const localData = localStorage.getItem(ComCtxConstants.LOCALSTORAGE_KEY.DEFAULT_DATA);
        if (localData != null && localData != '') {
            return JSON.parse(localData);
        }
        return {};
    }

    forceSelectDefaultData(_component, cb) {
        _component.dataSearchDefault = this.getDefaultSearchData();
        if (!_component.dataSearchDefault.heDaoTao
            || !_component.dataSearchDefault.namHoc
            || !_component.dataSearchDefault.hocKy
        ) {
            _component.model.readyToGetData = false;
            _component.rootContext.subscribe(ComCtxConstants.ROOT_USMART.CONFIG_DATA_DEFAULT_CLOSED, f => {
                _component.dataSearchDefault = this.getDefaultSearchData();
                if (!_component.dataSearchDefault.heDaoTao
                    || !_component.dataSearchDefault.namHoc
                    || !_component.dataSearchDefault.hocKy
                ) {
                    this._injector.get(NotifierService).showError('Bạn phải cấu hình thông tin (hệ đào tạo, năm học, học kỳ) trước');
                    _component.rootContext.fireEvent(ComCtxConstants.ROOT_USMART.SHOW_CONFIG_DATA_DEFAULT);
                }
            });
            _component.rootContext.fireEvent(ComCtxConstants.ROOT_USMART.SHOW_CONFIG_DATA_DEFAULT);
        }
        else if (cb) {
            cb(_component.dataSearchDefault);
        }
    }

    forceSelectDefaultDataWithFields(_component, arrField, arrFieldName, cb) {
        if (!arrField || arrField.length == 0) {
            return;
        }

        _component.dataSearchDefault = this.getDefaultSearchData();
        let enoughFields = true;
        arrField.forEach(field => {
            if (!_component.dataSearchDefault[field]) {
                enoughFields = false;
            }
        });

        if (!enoughFields) {
            _component.model.readyToGetData = false;
            _component.rootContext.subscribe(ComCtxConstants.ROOT_USMART.CONFIG_DATA_DEFAULT_CLOSED, f => {
                _component.dataSearchDefault = this.getDefaultSearchData();
                enoughFields = true;
                arrField.forEach(field => {
                    if (!_component.dataSearchDefault[field]) {
                        enoughFields = false;
                    }
                });
                if (!enoughFields) {
                    this._injector.get(NotifierService).showError(`Bạn phải cấu hình thông tin (${arrFieldName.toString()}) trước`);
                    _component.rootContext.fireEvent(ComCtxConstants.ROOT_USMART.SHOW_CONFIG_DATA_DEFAULT);
                }
            });
            _component.rootContext.fireEvent(ComCtxConstants.ROOT_USMART.SHOW_CONFIG_DATA_DEFAULT);
        }
        else if (cb) {
            cb(_component.dataSearchDefault);
        }
    }

    resetField(model, arrField) {
        arrField.forEach(field => {
            model.data[field] = null;
        });
    }

    getTraceId = () => sessionStorage.getItem('traceId');

    processErrorResponse(rs) {
        switch (rs.error) {
            case Validation.ERR_BUSINESS:
                this._notifierService.showWarning(rs.message);
                break;
            case Validation.ERR_SYS_DEV:
                console.log(`__________ ERR_SYS_DEV __________  : ${rs.message}`);
                console.log(`TraceId ====> ${this.getTraceId()} để dùng cho elastic search`);
            default:
                this._notifierService.showWarning('Thao tác chưa thành công. Vui lòng thử lại sau!');
                break;
        }
        this._notifierService.showWarning(`Copy TraceId ====> ${this.getTraceId()} và gửi cho quản trị viên`);
    }

    handleResponse(res: ResponseResult, message?: string, callBack?: Function, callBackError?: Function) {
        if (!res.success) {
            if (res.error == Validation.ERR_SYS_DEV) {
                console.error(res.message);
                this._injector.get(NotifierService).showWarning('Có lỗi xảy ra. Liên hệ quản trị viên để biết thêm chi tiết.');
            }
            else {
                if (res.message != null && res.message != '') {
                    this._injector.get(NotifierService).showWarning(res.message);
                }
                else {
                    this._injector.get(NotifierService).showWarning(res.error);
                }
            }
            if (callBackError) {
                callBackError(res);
            }
            return;
        }
        if (message) {
            this._injector.get(NotifierService).showSuccess(message);
        }
        if (callBack) {
            callBack(res);
        }
    }

    handleReponsePromise(res: ResponseResult, messageSuccess?: string): Promise<ResponseResult> {
        return new Promise((resolve, reject) => {
            if (!res.success) {
                if (res.error == Validation.ERR_SYS_DEV) {
                    console.error(res.message);
                    this._injector.get(NotifierService).showWarning('Có lỗi xảy ra. Liên hệ quản trị viên để biết thêm chi tiết.');
                }
                else {
                    let message = res.error;
                    if (res.message) message = res.message;
                    this._injector.get(NotifierService).showWarning(message);
                }
                this._notifierService.showWarning(`Copy TraceId ====> ${this.getTraceId()} và gửi cho quản trị viên`);
            }
            else {
                if (messageSuccess) {
                    this._injector.get(NotifierService).showSuccess(messageSuccess);
                }
            }
            resolve(res);
        });
    }

    getFilterFromTemplate(templateFilter: Filter[], model: any, rootModel?: any) {
        const result = [];
        if (Array.isArray(templateFilter)) {
            templateFilter.forEach(f => {
                this.deQuyReplaceValue(result, f, model, rootModel);
            });
        }
        else {
            this.deQuyReplaceValue(result, templateFilter, model, rootModel);
        }
        return result;
    }

    private deQuyReplaceValue(filters: Filter[], filter: Filter, model: any, rootModel?: any) {
        let valueFilter = null;

        const sourceField = filter.sourceField;
        const subField = filter.subField;
        const tryGetBySubField = (value) => {
            if (!subField) return value;
            if (isArray(value)) return value.map(q => q[subField]);
            if (isLiteralObject(value)) return value[subField];
            return value;
        };
        if (model.hasOwnProperty(sourceField)) {
            valueFilter = tryGetBySubField(model[sourceField]);
        }
        else if (rootModel) {
            if (rootModel.hasOwnProperty(sourceField)) {
                valueFilter = tryGetBySubField(rootModel[sourceField]);
            }
            else {
                const fields = sourceField.split('.');
                let temp = rootModel;
                for (const f of fields) {
                    if (temp.hasOwnProperty(f)) {
                        temp = temp[f];
                    }
                    else {
                        temp = null;
                        break;
                    }
                }
                valueFilter = tryGetBySubField(temp[subField]);
            }
        }

        if (filter.logic == null && (valueFilter == null || valueFilter === '' || valueFilter.length == 0)) {
            return;
        }
        const tmpFilter = new Filter(filter);
        delete tmpFilter.sourceField;
        if (filter.isArrayField) {
            tmpFilter.filters = [];
            tmpFilter.logic = 'or';
            tmpFilter.value = null;
            valueFilter.forEach(val => {
                tmpFilter.filters.push(
                    this._commonService.newFilter(filter.field, Operator.equal, val.toString()),
                    this._commonService.newFilter(filter.field, Operator.startWith, `${val},`),
                    this._commonService.newFilter(filter.field, Operator.endWith, `,${val}`),
                    this._commonService.newFilter(filter.field, Operator.contain, `,${val},`),
                );
            });
            filters.push(tmpFilter);
        }
        else {
            if (tmpFilter.funcGetValue) {
                valueFilter = tmpFilter.funcGetValue(valueFilter);
            }
            tmpFilter.value = JSON.stringify(valueFilter);
            tmpFilter.filters = [];
            if (filter.logic && filter.filters) {
                filter.filters.forEach(f => this.deQuyReplaceValue(tmpFilter.filters, f, model, rootModel));
                if (tmpFilter.filters.length > 0) {
                    filters.push(tmpFilter);
                }
            }
            else {
                filters.push(tmpFilter);
            }
        }
    }

    getWorkflowCoreStatusText(workflowCoreStatusValue: number) {
        const item = DataSourceWorkflowCoreStatus.find(x => x.id == workflowCoreStatusValue);
        if (!item) return '';
        return item.ten;
    }
}