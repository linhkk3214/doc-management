import { DatePipe } from '@angular/common';
import { Directive, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { IBaseModel } from './model/form-model';

export const EXPORT_VERSION_V4 = 4;
export const EXPORT_VERSION_V5 = 5;
@Directive()
export abstract class ComponentBase implements OnDestroy {
    model: any;
    modelSchema: ModelSchema[] = [];
    context: ComponentContextService;
    rootModel: any;
    rootContext: ComponentContextService;
    guidEmpty = '00000000-0000-0000-0000-000000000000';

    protected _unsubscribeAll: Subject<any>;
    protected _commonService: CommonService;
    protected _appContext: ApplicationContextService;
    protected _componentContext: ComponentContextService;
    protected _injector: Injector;
    protected _activatedRoute: ActivatedRoute;
    protected _crudService: CrudService;
    protected _datePipe: DatePipe;

    constructor(injector: Injector, componentName?: string) {
        this._unsubscribeAll = new Subject();
        this._injector = injector;
        this._appContext = injector.get(ApplicationContextService);
        this._componentContext = injector.get(ComponentContextService);
        this._activatedRoute = injector.get(ActivatedRoute);
        this._crudService = injector.get(CrudService);
        this._commonService = injector.get(CommonService);
        this._datePipe = injector.get(DatePipe);

        this._componentContext = this._appContext.addComponentContext(this._componentContext, this._activatedRoute, this.getComponentId());
        if (this._componentContext) {
            this.model = this._componentContext.data;
            this.context = this._componentContext;
            this.rootContext = this._componentContext.root;

            this.rootModel = this.rootContext.data;
            this.model.componentSubs = [];
        }
    }

    /**
    * On destroy
    */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(1);
        this._unsubscribeAll.complete();

        if (this.model.componentSubs) {
            for (const sub of this.model.componentSubs) {
                if (sub) sub.unsubscribe();
            }
        }

        if (this.context) {
            this.context.destroyContext();
        }
    }

    getComponentId(): string {
        return this._commonService.randomString();
    }

    subscribeRoot(name: string, callBack: any) {
        this.model.componentSubs.push(this.rootContext.subscribe(name, callBack));
    }

    subscribe(name: string, callBack: any) {
        this.model.componentSubs.push(this.context.subscribe(name, callBack));
    }

    subscribeOnce(name: string, callBack: any) {
        this.model.componentSubs.push(this.context.subscribeOnce(name, callBack));
    }

    replaySubscribe(name: string, callBack: any) {
        this.model.componentSubs.push(this.context.replaySubscribe(name, callBack));
    }

    trackByDefault(index: number, item: IBaseModel) {
        return index;
    }

    trackById(index: number, item: IBaseModel) {
        return item.id;
    }

    handleResponse(res: ResponseResult, message?: string, callBack?: Function, callBackError?: Function) {
        return this._crudService.handleResponse(res, message, callBack, callBackError);
    }

    handleResponseWithWaitBox(res: ResponseResult, message?: string, callBack?: Function, callBackError?: Function) {
        this.hideWaitBox();
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
            if (callBackError) callBackError(res);
            return;
        }
        if (message) {
            this._injector.get(NotifierService).showSuccess(message);
        }
        if (callBack) callBack(res);
    }

    isNotNullArray(arr) {
        return arr != null && arr.length > 0;
    }

    funcSortDefault(a, b) {
        if (a > b) return 1;
        if (a == b) return 0;
        return -1;
    }

    // addExportJob(job: ExportJob) {
    //     this.context.addExportJob(job);
    // }

    export(data: ExportItem, version = EXPORT_VERSION_V4): Promise<ResponseResult> {
        console.log('export version: ' + version);
        switch (version) {
            case EXPORT_VERSION_V4:
                return this.exportV4(data);
            case EXPORT_VERSION_V5:
                return this.exportV5(data);
            default:
                console.error(`Export version: ${version} is not supported!`);
                return;
        }
    }

    exportExcelV5(data: any, templateCode: string, fileName: string): Promise<ResponseResult> {
        const sheet = new ExportItem({
            type: ExportItemType.ExcelSheet,
            templateCode,
            data: JSON.stringify(data),
            name: 'Sheet1'
        });

        const file = new ExportItem({
            type: ExportItemType.ExcelFile,
            name: fileName
        });
        file.children = [sheet];
        return this.export(file, EXPORT_VERSION_V5);
    }

    exportV4(data: ExportItem): Promise<ResponseResult> {
        const templateV4Service = this._injector.get(TemplateV4Service);
        return templateV4Service.exportNormal(data);
    }

    exportV5(data: ExportItem): Promise<ResponseResult> {
        const templateInstanceService = this._injector.get(TemplateInstanceService);
        return templateInstanceService.exportNormal(data);
    }

    newFilterContainer(logic: 'and' | 'or', ...filters: Filter[]) {
        return new Filter({
            logic,
            filters: [...filters]
        });
    }

    newFilter(field: string, operator: Operator, value: any, valueIsField: boolean = false, stringCompareOption: StringCompareOption = StringCompareOption.Normal) {
        return this._commonService.newFilter(field, operator, value, valueIsField, stringCompareOption);
    }

    newFilterV4(field: string, operator: Operator, value: string) {
        return new Filter({
            field, operator,
            value
        });
    }

    newBindingFilter(column: string, operator: Operator, sourceField: string, subField?: string) {
        return new Filter({
            field: column,
            operator,
            sourceField,
            subField
        });
    }

    newSort(field: string, dir: 1 | -1 = 1) {
        return new Sort({ field, dir });
    }

    newPopupSize(width: number, height: number, maximize = false) {
        return new PopupSize({
            width, height, maximize
        });
    }

    showWaitBox(message?: string) {
        this.rootContext.fireEvent(ComCtxConstants.ROOT.SHOW_WAIT_BOX, {
            show: true,
            message
        });
    }

    hideWaitBox() {
        this.rootContext.fireEvent(ComCtxConstants.ROOT.SHOW_WAIT_BOX, {
            show: false
        });
    }

    copyToClipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    async _printPdf(baseService: BaseService, id: string, rowData: any) {
        const itemDetail = (await baseService.getDetail(id)).data;
        const data = await baseService.getDataTrinhKy(itemDetail, rowData);
        return this._printPdfBase(baseService, id, data);
    }

    async _printPdfBySchema(baseService: BaseService, model: any, schemas: FormSchemaBase[]) {
        const tmpModel = { ...model };
        delete tmpModel.printFileId;
        const data = [];
        await this._getKeyValue(data, '', schemas, tmpModel);
        return this._printPdfBase(baseService, model.id, data);
    }

    private async _printPdfBase(baseService: BaseService, id: string, data: any[]) {
        try {
            return baseService.exportToPdf(id, JSON.stringify({
                tieuDe: baseService.objectName,
                data
            }));
        }
        catch (err) {
            console.error(err);
            return <ResponseResult>{
                success: false,
                message: 'Có lỗi xảy ra'
            };
        }
    }

    private getLabel(prefix: string, label: string) {
        return `${prefix}${label}`;
    }

    private _getValueFromDatasource(itemSelected: any, isMultiple: boolean, funcGetLabel: (item) => string) {
        let value = null;
        if (isMultiple) {
            if (itemSelected && itemSelected.length > 0) {
                value = itemSelected.map(q => funcGetLabel(q.value)).join(', ');
            }
        }
        else {
            if (itemSelected) {
                value = funcGetLabel(itemSelected.value);
            }
        }
        return value;
    }

    async _getKeyValue(result: any[], prefix: string, schemas: FormSchemaBase[], model: any) {
        for (const schema of schemas) {
            if (!schema.hidden
                && schema.field != 'printFileId'
                && schema.label
                && !(schema instanceof FileUploadControlSchema)
                && !(schema instanceof FileManagerControlSchema)
            ) {
                let value = model[schema.field];
                if (value === undefined) value = null;
                if (value == null) {
                    result.push({
                        label: this.getLabel(prefix, schema.label),
                        value
                    });
                }
                else if (schema instanceof TableSchema) {
                    const tmpSchema = <TableSchema>schema;
                    if (value == null) value = [];
                    result.push({
                        label: this.getLabel(prefix, schema.label),
                        value: null
                    });
                    if (value.length > 0) {
                        for (const rowData of value) {
                            await this._getKeyValue(result, `${prefix}\t`, tmpSchema.rowTemplate, rowData);
                            result.push({
                                label: '',
                                value: null
                            });
                        }
                        result.splice(result.length - 1, 1);
                    }
                }
                else if (schema instanceof AddressControlSchema) {
                    const tmpSchema = <AddressControlSchema>schema;
                    result.push({
                        label: this.getLabel(prefix, schema.label),
                        value: null
                    });
                    await this._getKeyValue(result, `${prefix}\t`, tmpSchema._component.setting.schema, value);
                }
                else {
                    if (schema instanceof DateTimeControlSchema) {
                        if (!(value instanceof Date)) {
                            value = new Date(value);
                        }
                        value = getStringDateVN(value);
                    }
                    else if (schema instanceof CoCauToChucPickerControlSchema) {
                        const itemSelected = await schema._component.controlPicker._component.getDataSelectedValue(value);
                        const tmpSchema = <CoCauToChucPickerControlSchema>schema;
                        let funcGetLabel = tmpSchema.funcGetLabel;
                        if (!funcGetLabel) {
                            funcGetLabel = item => {
                                return item.value[tmpSchema.displayField];
                            };
                        }
                        value = this._getValueFromDatasource(itemSelected, schema.multiple, item => item.ten);

                        if (schema.multiple) {
                            if (itemSelected.length > 0) {
                                if (schema.funcGetLabel) {
                                    value = itemSelected.map(q => tmpSchema.funcGetLabel(q.value)).join(', ');
                                }
                                else {
                                    value = itemSelected.map(q => q.value[tmpSchema.displayField]).join(', ');
                                }

                            }
                            else {
                                value = null;
                            }
                        }
                        else {
                            if (itemSelected) {
                                if (schema.funcGetLabel) {
                                    value = schema.funcGetLabel(itemSelected.value);
                                }
                                else {
                                    value = itemSelected.value[schema.displayField];
                                }
                            }
                        }
                    }
                    else if (schema instanceof AutoCompletePickerControlSchema) {
                        const itemSelected = await schema._component.getDataSelectedValue(value);
                        const tmpSchema = <AutoCompletePickerControlSchema>schema;
                        let funcGetLabel = tmpSchema.funcGetLabel;
                        if (!funcGetLabel) {
                            funcGetLabel = item => {
                                if (item) {
                                    return item[tmpSchema.displayField];
                                }
                                else {
                                    return null;
                                }
                            };
                        }
                        value = this._getValueFromDatasource(itemSelected, schema.multiple, funcGetLabel);
                    }
                    else if (schema instanceof CoCauToChucControlSchema) {
                        const tmpSchema = <CoCauToChucControlSchema>schema;
                        const funcGetLabel = item => item.label;
                        let dataSource = null;
                        let itemSelected = null;
                        if (tmpSchema._component.multiSelect) {
                            dataSource = tmpSchema._component.multiSelect._options;
                            itemSelected = dataSource.filter(q => value.indexOf(x => x == q.value)).map(q => ({
                                value: q
                            }));
                        }
                        else {
                            dataSource = tmpSchema._component.dropdown._options;
                            itemSelected = dataSource.find(q => q.value == value);
                            if (itemSelected) {
                                itemSelected = {
                                    value: itemSelected
                                };
                            }
                        }
                        value = this._getValueFromDatasource(itemSelected, schema.multiple, funcGetLabel);
                    }
                    else if (schema instanceof DropdownControlSchema) {
                        const tmpSchema = <DropdownControlSchema>schema;
                        let itemSelected = null;
                        if (schema.multiple) {
                            itemSelected = schema._component.dataSourceInternal.filter(q => value.indexOf(x => x == q.value[q.value._dropdownvalue]));
                        }
                        else {
                            itemSelected = schema._component.dataSourceInternal.find(q => q.value[q.value._dropdownvalue] == value);
                        }
                        value = this._getValueFromDatasource(itemSelected, schema.multiple, tmpSchema.funcGetLabel);
                    }
                    else if (schema instanceof CheckboxControlSchema || schema instanceof SwitchControlSchema) {
                        if (!value) value = 'Không';
                        else value = 'Có';
                    }
                    // Value = undefined thì khi serialize sẽ bị mất prop
                    if (value === undefined) value = null;
                    result.push({
                        label: this.getLabel(prefix, schema.label),
                        value
                    });
                }
            }
        }
        return result;
    }

    getStringDate(value): string {
        if (!value) return '';
        if (value instanceof Date) {
            return this._datePipe.transform(value, 'dd/MM/yyyy');
        }
        const date = new Date(value);
        return this._datePipe.transform(date, 'dd/MM/yyyy');
    }
    // http://localhost:27230/universal-link?serviceCode=congviec&entity=DM_Priority&entityKey=0911f3e7-3db0-4b68-87cd-07d425741e9e&state=&sourcePath=http://localhost:27230/dm-priority
    parseAttachLink(content) {
        const links = content.split('\r\n');
        const op = [];
        for (const link of links) {
            const arr = link.split('?');
            if (arr.length > 1) {
                const temp = arr[1];
                const query = this.parseQueryString(temp);
                if (query && query.serviceCode && query.entity && query.entityKey) {
                    query.rawLink = link;
                    op.push(query);
                }
                else {
                    console.warn(`link ${link} invalid to parse`);
                }
            }
        }
        return op;
    }
    private parseQueryString(query: string): any {
        if (!query) return null;
        if (query.startsWith('?')) query = query.substring(1);
        const arr = query.split('&');
        const obj = {};
        for (const item of arr) {
            const temp = item.split('=');
            if (temp[1]) {
                obj[temp[0]] = decodeURIComponent(temp[1]);
            }
            else {
                obj[temp[0]] = null;
            }
        }
        return obj;
    }
    async getCopyPath(setting: CrudListSetting, rowData: any, permission: PermissionBase = PermissionBase.READ) {
        const itemShares: ModelShareLinkByPermission = new ModelShareLinkByPermission();
        itemShares.linkToMenu = `${top.location.origin}${top.location.pathname}`;
        itemShares.sourcePath = `${encodeURIComponent(top.location.href)}`;
        itemShares.targetPath = `${encodeURIComponent(setting.targetPath)}`;
        itemShares.objectDisplayName = `${encodeURIComponent(setting.objectName)}`;
        let displayField = '';
        if (setting.getDisplayNameInServer) {
            displayField = 'id';
        }
        else {
            if (setting.displayField) {
                displayField = this._commonService.isString(setting.displayField) ? setting.displayField : (setting.displayField as any)(rowData);
            }
            if (!displayField) {
                const linkColumn = setting.cols.find(x => x.showEditLink);
                if (linkColumn && !linkColumn.rawColumn) {
                    displayField = linkColumn.field;
                }
            }
            if (!displayField) {
                displayField = 'id';
            }
        }
        itemShares.displayField = displayField;
        itemShares.lstItemData = [];
        const state = await this.getLinkState(rowData);
        itemShares.lstItemData.push({
            itemId: rowData.id,
            permission,
            state: encodeURIComponent(state)
        });
        const dicPermissionId = (await setting.baseService.getSharedKey(itemShares)).data;
        if (!dicPermissionId) {
            this._injector.get(NotifierService).showWarning('Bạn không có quyền chia sẻ bản ghi');
        }
        let path = '';
        itemShares.lstItemData.forEach(itemData => {
            path += `${dicPermissionId[itemData.itemId]}\n`;
        });
        return path;
    }

    async getLinkState(rowData: any) {
        return '';
    }

    getDefaultSettings(): { [key: string]: string } {
        const localData = localStorage.getItem(ComCtxConstants.LOCALSTORAGE_KEY.DEFAULT_DATA);
        if (localData != null && localData != '') {
            return JSON.parse(localData);
        }
        return {};
    }
}