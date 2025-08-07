import { PipeTransform, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ControlType, DataType, FieldVisibility, FormState, HeightType } from '../../enum/form';
import { IAddressSchema, IButtonSchema, ICheckboxSchema, IContainerSchema, IDataSourceSchema, IDateTimeSchema, IEditorSchema, ILabelSchema, ISchemaBase, ITableSchema, ITextAreaSchema, ITextSchema } from '../../interfaces/i-form-model-old';
import { BaseService } from '../../services/base.service';
import { Action, ActionMany, Func, isArray, isLiteralObject, ObjectType } from './common';
import { Filter, FilterOperator, Sort } from './crud';

export type ControlFilter = Filter[] | Func<Filter[]> | Promise<Filter[]>;
export type PrimitiveType = string | Date | number;
export type LayoutWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ReferenceString = string | ((item: ObjectType) => string);

export interface IBaseModel {
    id: 'string';
}

abstract class BaseClass {
    initBase<T>(this: T, actionInit: (obj: T) => void): T {
        actionInit(this);
        return this;
    }
}

export class ListSetting extends BaseClass {
    [key: string]: any;
    title: string; // The title of the list
    tableName?: string;
    entityKey = 'id';
    objectName = '';

    viewDetailPath?: string;
    baseService?: BaseService;
    cols: ISchemaBase[] = [];
    pageSetting: PageSetting = new PageSetting();
    heightType: HeightType = HeightType.default; // Có custom chiều cao không: Thường sử dụng trong dialog
    fixHeightTypeInDialog? = true;

    allowSelectRow: boolean | ((rowData: ObjectType, evt: Event) => boolean) = true;
    selectionMode: 'single' | 'multiple' = 'multiple';
    reSelectLastItem = true; // Select lại item cuối cùng đã chọn của grid

    displayField: ReferenceString; // trường đại diện cho bản ghi làm tiêu đề hiển thị (phục vụ cho các dịch vụ khác khai thác)
    showEditLink = true; // show a detail link in rows

    hiddenHeader = false;
    hiddenPageSetting = false;
    hiddenAdvanceSearch = false;
    hiddenSetting = false;
    hiddenPageTitle = false;

    hiddenCheckbox = false;
    hiddenOrderColumn = false;
    hiddenFunctionColumn = false;
    hiddenRefresh = false;
    hiddenFilterRow = false;

    fieldSearchText: string[] = [];

    constructor(title: string, displayField: ReferenceString) {
        super();
        this.title = title;
        this.displayField = displayField;
    }
}

export class CrudBase {
    [key: string]: any;
    // Component subscribe - Khi subcribe một component thì add vào array để khi destroy thì unsubscribe
    componentSubs: Subscription[] = [];

    constructor(init?: CrudBase) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class CrudListData extends CrudBase {
    [key: string]: any;
    loading = false;
    adjustedPositionLoading = false;
    ready = true;
    dataSource: ObjectType[] = [];
    selectedItems: ObjectType[] = [];
    selectedItem?: ObjectType;
    selectedItemLast?: ObjectType;
    selectedId?: number;
    total = 0;
    advanceData: ObjectType = {};
    constructor(init?: CrudListData) {
        super();
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class PageSetting {
    [key: string]: any;
    page = 1;
    pageSize = 15;

    constructor(init?: PageSetting) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class CrudFormData extends CrudBase {
    [key: string]: any;
    data?: any = {};
    submitting? = false;
    /**
     * Trạng thái của form đang được mở: Là form thêm mới, hay form sửa, hay form xóa
     */
    formState?: FormState = FormState.ADD;

    constructor(init?: CrudFormData) {
        super();
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class CrudFormSetting {
    [key: string]: any;
    disableCaching = false;
    disableDefaultSettingCache = false;
    hiddenTrinhKy = true;
    baseService?: BaseService;
    buildInSchema?: ISchemaBase[] = [];
    uniqueField?: string[] | string[][] = [];
    fieldDropdown?: { [key: string]: DropdownSchema; } = {};
    fieldNeedGetRef?: { [key: string]: TextSchema; } = {};
    displayField?: ReferenceString;
    firstFocusControl?: string;
    filterCheckExistByVersion?: Filter[];
    defaultFilterCheckExist?: Filter[] | (() => Filter[]);
    entityMetadataData?: CrudFormData;
    entityMetadataSetting?: CrudFormSetting;

    constructor(init?: CrudFormSetting) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class AdvanceSearchData extends CrudFormData {
    [key: string]: any;
    initData?: any = {};

    constructor(init?: AdvanceSearchData) {
        super();
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class AdvanceSearchSetting extends CrudFormSetting {
    [key: string]: any;
    fieldKey = '_k';
    entityPermissionSchema?: ISchemaBase[] = [];
    keepInitSearchDataNotNull = true;

    constructor(init?: AdvanceSearchSetting) {
        super();
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export abstract class SchemaBase<T> extends BaseClass implements ISchemaBase {
    //#region implements
    [key: string]: any;
    field: string;
    label?: string;
    fullLabel?: string;
    description?: string;
    placeholder?: string;
    dataType: DataType = DataType.string;
    readonly controlType: ControlType = ControlType.textbox;
    rowSpan = 1;
    disabled?: boolean;
    visible: FieldVisibility = FieldVisibility.FORM | FieldVisibility.VIEW | FieldVisibility.LIST;
    defaultValue?: any;

    //#region Form
    layoutWidth: LayoutWidth | string = 6;
    mobileWidth: LayoutWidth | string = 12;
    formClass?: string;
    autoFocus = false;
    required = false;
    onChanged?: ActionMany<[this]>;
    onInit?: ActionMany<[this]>;
    //#endregion

    //#region List
    columnWidth?: number | string;
    allowFilter = true;
    filterOperator?: FilterOperator;
    headerClass?: string;
    bodyClass?: string;
    separator = ', '; // Trong trường hợp field là reference
    pipe?: PipeTransform;
    asyncPipe = true;
    //#endregion
    //#endregion

    //#region Custom
    //#region Form
    template: TemplateRef<any> | null = null;
    subTemplate: TemplateRef<any> | null = null;
    //#endregion
    customSetting: ObjectType = {};
    //#endregion

    constructor(field: string, controlType: ControlType) {
        super();
        this.field = field;
        this.controlType = controlType;
    }

    init(actionInit: ActionMany<[T]>): any {
        actionInit(<T><any>this);
        return this;
    }

    abstract clone(): this;
}

export class ContainerSchema extends SchemaBase<IContainerSchema> implements IContainerSchema {
    [key: string]: any;
    controls: SchemaBase<any>[];
    showInBox = true;

    constructor(controls: SchemaBase<ISchemaBase>[]) {
        super('', ControlType.container);
        this.controls = controls;
    }

    override clone(): this {
        const controls: SchemaBase<ISchemaBase>[] = [];
        const length = this.controls.length;
        for (let i = 0; i < length; i++) {
            const element = this.controls[i];
            controls.push(element.clone());
        }
        const container = new ContainerSchema(controls);
        Object.assign(container, this);
        container.controls = controls;
        return container as this;
    }
}

export class TextSchema extends SchemaBase<ITextSchema> implements ITextSchema {
    [key: string]: any;
    selectWhenFocus = false; // Chọn tất cả text khi focus
    dataFormat: 'text' | 'password' | 'number' | 'email' | 'phone' | 'fax' | 'money' | 'moneyint' | 'amount' = 'text';
    maxLength?: number;
    min = 0;
    max = Number.MAX_SAFE_INTEGER;

    baseService?: BaseService;
    valueField = 'id';
    displayField: ReferenceString = 'ten';

    plusUrl?: string;
    sorts: Sort[] = [];
    sortField = '';
    sortDir: 1 | -1 = 1;
    fieldPlus?: string; // Danh sách những trường bổ sung cần lấy thêm ngoài id, ten; Ví dụ ,ma

    constructor(field: string, controlType: ControlType = ControlType.textbox) {
        super(field, controlType);
    }

    override clone(): this {
        const container = new TextSchema(this.field, this.controlType);
        Object.assign(container, this);
        return container as this;
    }
}

export class LabelSchema extends SchemaBase<ILabelSchema> implements ILabelSchema {
    [key: string]: any;
    for? = '';
    isHtml = false;
    override layoutWidth: LayoutWidth | string = 12;

    constructor() {
        super('', ControlType.label);
    }

    override clone(): this {
        const container = new LabelSchema();
        Object.assign(container, this);
        return container as this;
    }
}

abstract class DataSourceSchema extends SchemaBase<IDataSourceSchema> implements IDataSourceSchema {
    [key: string]: any;
    baseService?: BaseService;
    defaultFilters?: ControlFilter;
    valueField = 'id';
    displayField: ReferenceString = 'ten';
    refFields: RefField[] = [];
    bindingFilters?: Filter[]; // Trường dữ liệu sẽ trigger load trường này

    isServerLoad = false;
    searchField?: string[];
    pageSize?: number = 15; // Dùng cho dropdown server load
    sorts?: Sort[] = [];
    sortField? = '';
    sortDir?: 1 | -1 = 1;
    fieldPlus? = ''; // Danh sách những trường bổ sung cần lấy thêm ngoài id, ten; Ví dụ ma
    afterGetData?: Action;

    returnType?: 'value' | 'object' = 'value';
    dataSource?: ObjectType[];
    // Sử dụng để khai báo operator cho control trong query-builder thay cho các operator mặc định được tạo từ query-builder
    operators?: FilterOperator[];

    constructor(controlType: ControlType, field: string) {
        super(field, controlType);
    }
}

export class NumberSchema extends TextSchema {
    [key: string]: any;
    maskType?: 'decimal' | 'int' = 'int';
    autoFormat? = true;
    prefix? = '';
    suffix? = '';
    decimalPlaces? = 2;

    constructor(field: string, init?: NumberSchema) {
        super(field, ControlType.number);
        for (const key in init) {
            this[key] = init[key];
        }
    }

    override clone(): this {
        return new NumberSchema(this.field, this) as this;
    }
}

export class NumberRangeSchema extends TextSchema {
    [key: string]: any;
    maskType?: 'decimal' | 'int';
    prefix? = '';
    suffix? = '';
    decimalPlaces? = 2;
    // Sử dụng để khai báo operator cho control trong query-builder thay cho các operator mặc định được tạo từ query-builder
    operators?: any[];

    constructor(field: string) {
        super(field, ControlType.numberRange);
    }

    override clone(): this {
        const container = new NumberRangeSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class DateTimeSchema extends SchemaBase<IDateTimeSchema> implements IDateTimeSchema {
    [key: string]: any;
    appendTo? = 'body';
    panelClass? = '';
    showTime? = false;
    showIcon? = true;
    format?: 'normal' | 'fromNow' = 'normal';
    showOnFocus = true;
    minDate?: Date;
    maxDate?: Date;
    timeOnly = false;

    constructor(field: string, controlType: ControlType = ControlType.datetime) {
        super(field, controlType);
        if (!this.placeholder) {
            this.placeholder = this.showTime ? 'dd/MM/yyyy hh:mm' : 'dd/MM/yyyy';
        }
    }

    override clone(): this {
        const container = new DateTimeSchema(this.field, this.controlType);
        Object.assign(container, this);
        return container as this;
    }
}

export class DateTimeRangeSchema extends DateTimeSchema {
    [key: string]: any;
    override showIcon? = false;

    constructor(field: string) {
        super(field, ControlType.datetimeRange);
    }

    override clone(): this {
        const container = new DateTimeRangeSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class SwitchSchema extends SchemaBase<ISchemaBase> implements ISchemaBase {
    [key: string]: any;
    constructor(field: string) {
        super(field, ControlType.switch);
    }

    override clone(): this {
        const container = new SwitchSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class CheckboxSchema extends SchemaBase<ICheckboxSchema> implements ICheckboxSchema {
    [key: string]: any;
    hiddenLabel? = false; // Set = true chủ yếu khi dùng trong table schema để ẩn label đi, vì label đã có trên tiêu đề cột
    override defaultValue = false;

    constructor(field: string) {
        super(field, ControlType.checkbox);
    }

    override clone(): this {
        const container = new CheckboxSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class ButtonSchema extends SchemaBase<IButtonSchema> implements IButtonSchema {
    [key: string]: any;
    btClass? = 'p-button-text';
    icon?: string;
    btStyle? = { width: 'auto' };
    onClick?: Action;

    constructor() {
        super('', ControlType.label);
    }

    override clone(): this {
        const container = new ButtonSchema();
        Object.assign(container, this);
        return container as this;
    }
}

export class TextAreaSchema extends SchemaBase<ITextAreaSchema> implements ITextAreaSchema {
    [key: string]: any;
    rows? = 5;

    constructor(field: string) {
        super(field, ControlType.textarea);
    }

    override clone(): this {
        const container = new TextAreaSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class EditorSchema extends SchemaBase<IEditorSchema> implements IEditorSchema {
    [key: string]: any;
    mode?: 'basic' | 'medium' | 'full' | 'simple' = 'basic';
    height? = 250;
    initValue?: any;
    languageCode?: 'vi' | 'en';

    constructor(field: string) {
        super(field, ControlType.editor);
    }

    override clone(): this {
        const container = new EditorSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class DropdownSchema extends DataSourceSchema {
    [key: string]: any;
    appendTo? = 'body';
    panelClass? = '';
    selectedItemsLabel? = 'Đã chọn {0} mục';
    selectedAllItemLabel? = 'Đã chọn tất cả';
    showClear? = true;
    filter? = true;
    multiple? = false;
    generateTooltip?: (item: ObjectType) => string;
    maxSelectedLabels? = 5;
    maxItemDisplay? = 50;
    virtualScroll?: boolean = false;
    fitPanel?: boolean = true;
    needClone? = false; // Sử dụng trong table schema, khi datasource của một cột trên mỗi dòng là khác nhau cần set needClone = true
    templateItem?: TemplateRef<any>;
    templateSelectedItem?: TemplateRef<any>;
    quickAdd? = false;
    cols?: ISchemaBase[];
    quickAddTemplate?: TemplateRef<any>;
    initData?: ObjectType | BaseService = {};
    defaultIndex? = -1;
    popupSize?: PopupSize = new PopupSize().initBase(q => {
        q.width = 750;
        q.height = 400;
    });

    loadInFirstDisplay? = true;

    autoGetData? = true;

    autoDisplayFirst? = false;
    notInCrudForm? = false;
    searchMultiple? = true;
    disableDisplayFieldServerSearch? = false;

    loadOnInit? = false;
    allowLoadDataWhenParentNull? = false;

    disabledParentItem? = true;
    onAdjustedValue?: BaseService;

    constructor(field: string) {
        super(ControlType.combobox, field);
        this.placeholder = 'Chọn';
    }

    override clone(): this {
        const container = new DropdownSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class AddressSchema extends SchemaBase<IAddressSchema> implements IAddressSchema {
    [key: string]: any;
    hideNo? = false;
    hideStreet? = false;
    hideWard? = false;
    hideDistrict? = false;
    requiredNo? = true;
    requiredStreet? = true;
    requiredWard? = true;
    requiredDistrict? = true;
    requiredProvince? = true;
    wardToProvince? = true;
    noWidth? = 1;
    streetWidth? = 3;
    wardWidth? = 3;
    districtWidth? = 2;
    provinceWidth? = 3;
    showInBox? = false;

    hideHolder? = true;

    constructor(field: string) {
        super(field, ControlType.address);
    }

    override clone(): this {
        const container = new AddressSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class PercentSchema extends SchemaBase<ISchemaBase> implements ISchemaBase {
    [key: string]: any;

    constructor(field: string) {
        super(field, ControlType.textbox);
        this.layoutWidth = 12;
    }

    override clone(): this {
        const container = new PercentSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class ChipsSchema extends SchemaBase<ISchemaBase> implements ISchemaBase {
    [key: string]: any;
    constructor(field: string) {
        super(field, ControlType.chips);
    }

    override clone(): this {
        const container = new ChipsSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class AutoCompleteSchema extends DataSourceSchema {
    [key: string]: any;
    multiple? = false;
    minLengthFilter? = 1;
    appendTo?: string = 'body';

    constructor(field: string) {
        super(ControlType.autocomplete, field);
    }

    override clone(): this {
        const container = new AutoCompleteSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class RadioButtonListSchema extends DataSourceSchema {
    [key: string]: any;
    layout?: 'vertical' | 'horizontal' = 'horizontal';
    align?: 'left' | 'center' | 'right' = 'left';
    onAdjustedValue?: BaseService;

    constructor(field: string) {
        super(ControlType.radio, field);
    }

    override clone(): this {
        const container = new RadioButtonListSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class CheckBoxListSchema extends DataSourceSchema {
    [key: string]: any;
    layout?: 'vertical' | 'horizontal' = 'horizontal';
    align?: 'left' | 'center' | 'right' = 'left';
    classPlus? = '';
    freeText? = '';
    pColClass?: number;

    constructor(field: string) {
        super(ControlType.checkbox, field);
    }

    override clone(): this {
        const container = new CheckBoxListSchema(this.field);
        Object.assign(container, this);
        return container as this;
    }
}

export class TableSchema extends SchemaBase<ITableSchema> implements ITableSchema {
    [key: string]: any;
    rowTemplate: SchemaBase<ISchemaBase>[];
    autoGenerateId? = false;
    rowButtons?: (rowData: ObjectType) => void;
    footerButtons?: {
        icon?: string;
        label?: string;
        class?: string;
        message: string;
    }[];
    showNumber? = true;
    showFunction? = true;
    showFooter? = true;
    showSave? = false;
    showEdit? = false;
    showDelete? = true;
    showAdd? = true;
    showDialog? = true;
    popupSize?: PopupSize = new PopupSize().initBase(q => {
        q.width = 1100;
        q.height = 650;
    });
    enableReorderRow? = false;
    onReordered?: BaseService;
    enableAddMulti? = false;
    pickerControlField?: string;
    isUnique? = true;
    enablePaging? = false;
    limit? = 50;
    initRowCount? = 1;
    widthFunctionColumn?: string;
    rowButtonTemplate?: TemplateRef<any> = undefined;
    summaryTemplate?: TemplateRef<any> = undefined;
    headerTemplate?: TemplateRef<any> = undefined;

    onTableFinishInit?: BaseService;
    onAdding?: BaseService;
    onAdded?: BaseService;
    onSave?: BaseService;
    onMessage?: BaseService;
    onDeleting?: BaseService;
    onDeleted?: BaseService;

    constructor(rowTemplate: SchemaBase<ISchemaBase>[]) {
        super('', ControlType.table);
        this.rowTemplate = rowTemplate;
        this.layoutWidth = 12;
    }

    disableControl() {
        this.disableChildrenControl(this.rowTemplate);
    }

    private disableChildrenControl = (schemas: SchemaBase<ISchemaBase>[]) => {
        schemas.forEach(schema => {
            schema.disabled = true;
            if (schema instanceof TableSchema) {
                this.disableChildrenControl(schema.rowTemplate);
            }
            else if (schema instanceof ContainerSchema) {
                this.disableChildrenControl(schema.controls);
            }
        });
    };

    override clone(): this {
        const rowTemplate: SchemaBase<ISchemaBase>[] = [];
        const length = this.rowTemplate.length;
        for (let i = 0; i < length; i++) {
            const row = this.rowTemplate[i];
            rowTemplate.push(row.clone());
        }
        const container = new TableSchema(rowTemplate);
        Object.assign(container, this);
        container.rowTemplate = rowTemplate;
        return container as this;
    }
}

export class RefField extends BaseClass {
    [key: string]: any;
    field: string;
    multiple? = false;
    separator? = ', ';
    baseService?: BaseService;
    isChildObject? = false;
    displayField: ReferenceString = 'ten';
    displayFieldInGrid?: string;
    valueField = 'id';
    fieldPlus? = '';
    groupCode?: string;
    dataSource?: any[];
    order?: number = 1;

    isTree? = false;
    fieldTree?: string;
    valueParentRoot?: any = null; // Giá trị trường [fieldTree] của item tree root
    fieldParentTreeItem? = 'id'; // Trường xác định bản ghi là bản ghi cha của bản ghi con
    sorts?: Sort[] = [];
    sortField? = '';
    sortDir?: 1 | -1 = 1;
    plusUrl?: string;

    funcSetValueRowWhenNullOrEmpty?: (rowItem: ObjectType) => string;
    callbackDataFinish?: (evt: EventData) => void;
    funcGetLabel?: (item: ObjectType) => string;
    funcCompare?: (item: any, value: PrimitiveType) => boolean = (item, value) => item[this.valueField] == value;

    constructor(field: string) {
        super();
        this.field = field;
    }
}

export class DialogModel extends BaseClass {
    [key: string]: any;
    showEditForm?: boolean = false;
    header?: string = '';
    popupSize?: PopupSize = new PopupSize().initBase(q => q.maximize = true);
    data?: any = {};
    buttonTemplate?: TemplateRef<any>;
}

export class PopupSize extends BaseClass {
    [key: string]: any;
    width?: number;
    height?: number;
    maximize? = false;
}

export class ControlTreeNode {
    modelPath?: string;
    schemaPath?: string;
    field: string;
    parentNode?: ControlTreeNode;
    rootNode: ControlTreeNode;
    childNodes: ControlTreeNode[] = [];
    control?: ISchemaBase;
    formControls;
    private childNodeDic: { [key: string]: ControlTreeNode } = {};
    private data: any;
    private hasSchema = true;
    constructor(model: any, schemas: [], field?: string | number | undefined, parentNode?: ControlTreeNode) {
        this.data = model;
        this.formControls = schemas;
        if (parentNode) {
            if (parentNode.modelPath != null) {
                if (typeof field === 'string') {
                    this.modelPath = parentNode.modelPath + '.' + field;
                    this.schemaPath = parentNode.schemaPath + '.' + field;
                }
                else if (typeof field === 'number') {
                    this.modelPath = parentNode.modelPath + '[' + field + ']';
                    this.schemaPath = parentNode.schemaPath;
                    this.hasSchema = false;
                }
            }
            else {
                this.modelPath = this.schemaPath = field?.toString();
            }

            this.rootNode = parentNode.rootNode;
        }
        else {
            this.rootNode = this;
        }

        if (typeof field !== 'number')
            this.field = field ?? '';
        else
            this.field = '';
        this.parentNode = parentNode;
        // if (this.hasSchema && typeof this.schemaPath !== 'number') {
        //     this.control = schemas[this.schemaPath ?? ''];
        // }
        this.initChildNodes(model, schemas);
    }

    public reinitChildNodes() {
        this.childNodes.length = 0;
        this.childNodeDic = {};
        this.initChildNodes(this.data, this.formControls);
    }

    private initChildNodes(model: any, schemas: []) {
        if (isLiteralObject(model)) {
            for (const key in model) {
                if (key != '_status' && key != '_errors' && key != '_source') {
                    const childNode = new ControlTreeNode(model[key], schemas, key, this);
                    this.childNodes.push(childNode);
                    this.childNodeDic[childNode.field] = childNode;
                }
            }
        }
        else if (isArray(model)) {
            let i = 0;
            for (const item of model) {
                const childNode = new ControlTreeNode(item, schemas, i, this);
                childNode.parentNode = this;
                this.childNodes.push(childNode);
                this.childNodeDic[childNode.field] = childNode;
                i++;
            }
        }
    }

    public getChildNode(field: string): ControlTreeNode | null {
        return this.childNodeDic[field];
    }

    get parentModel() {
        if (this.parentNode) return this.parentNode.model;
        return null;
    }

    get parentModelPath() {
        if (this.parentNode) return this.parentNode.modelPath;
        return null;
    }

    get parentControl() {
        if (this.parentNode) return this.parentNode.control;
        return null;
    }

    get model() {
        if (this.parentNode) return this.parentNode.data[this.field];
        else return this.data;
    }

    set model(val) {
        if (this.parentNode) this.parentNode.data[this.field] = val;
        else this.data = val;
    }

    get value() {
        if (this.parentNode) return this.parentNode.data[this.field];
        else return this.data;
    }

    set value(val) {
        if (this.parentNode) this.parentNode.data[this.field] = val;
        else this.data = val;
    }

    public setHidden(field: string | string[], hidden = true) {
        if (Array.isArray(field))
            field.forEach(f => {
                this.setHiddenField(f, hidden);
            });
        else
            this.setHiddenField(field, hidden);
    }

    private setHiddenField(field: string, hidden: boolean) {
        this.data._status[field].hidden = hidden;
    }

    public getNodeByPath(modelPath: string): ControlTreeNode | null {
        if (modelPath == null || modelPath === '') return this.rootNode;
        return this.findInTree(this.rootNode, modelPath.toLowerCase());
    }

    public getNodeBySchemaPath(schemaPath: string): ControlTreeNode | null {
        if (schemaPath == null || schemaPath === '') return this.rootNode;
        return this.findSchemaInTree(this.rootNode, schemaPath.toLowerCase());
    }

    private findInTree(node: ControlTreeNode, modelPath: string): ControlTreeNode | null {
        if (node.modelPath != null && node.modelPath.toLowerCase() == modelPath.toLowerCase()) return node;
        else {
            for (const childNode of node.childNodes) {
                if (childNode.modelPath != null && modelPath.startsWith(childNode.modelPath.toLowerCase())) {
                    const re = this.findInTree(childNode, modelPath);
                    if (re) return re;
                }
            }
        }
        return null;
    }

    private findSchemaInTree(node: ControlTreeNode, schemaPath: string): ControlTreeNode | null {
        if (node.schemaPath != null && node.schemaPath.toLowerCase() == schemaPath.toLowerCase()) return node;
        else {
            for (const childNode of node.childNodes) {
                if (childNode.schemaPath != null && schemaPath.startsWith(childNode.schemaPath.toLowerCase())) {
                    const re = this.findSchemaInTree(childNode, schemaPath);
                    if (re) return re;
                }
            }
        }
        return null;
    }
}

export class EventData {
    [key: string]: any;
    currentNode: ControlTreeNode;
    sourceNode?: ControlTreeNode;
    sourceEvent?: any;
    eventType?: any;
    data?: any;

    constructor(currentNode: ControlTreeNode, init?: EventData) {
        this.currentNode = currentNode;
        for (const key in init) {
            this[key] = init[key];
        }
    }

    get value(): any {
        return this.currentNode.model;
    }

    get model(): any {
        return this.currentNode.model;
    }

    get parentModel(): any {
        return this.currentNode.parentModel;
    }

    get parentPath(): any {
        return this.currentNode.parentModelPath;

    }

    get rootModel(): any {
        return this.currentNode.rootNode.model;
    }

    get control(): ISchemaBase | undefined {
        return this.currentNode.control;
    }

    get parentControl(): ISchemaBase | null | undefined {
        return this.currentNode.parentControl;
    }

    get formControls(): ISchemaBase[] {
        return this.currentNode.formControls;
    }
}

export class TabViewData {
    [key: string]: any;
    code?: string;
    hidden?: boolean = false;
    alwayRender?: boolean = false;
    icon?: string;
    label?: string;
    headerStyleClass?: string;
    active?: boolean;
    doNotReload? = true;
    useScrollbar? = true; // Config để xác định có sử dụng custom-scrollbar không, nếu không thì dùng scrollbar mặc định của trình duyệt

    constructor(init?: TabViewData) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class FieldRowSpan {
    field: string;
    funcGetValue?: (item: ObjectType) => any;

    constructor(field: string, funcGetValue: (item: ObjectType) => any) {
        this.field = field;
        this.funcGetValue = funcGetValue;
    }
}


