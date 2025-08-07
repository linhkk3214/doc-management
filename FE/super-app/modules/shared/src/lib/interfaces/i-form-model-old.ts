import { PipeTransform, TemplateRef } from '@angular/core';
import { Action, ActionMany, ObjectType } from '../classes/model/common';
import { ControlFilter, PopupSize, ReferenceString, RefField, SchemaBase } from '../classes/model/form-model-old';
import { ControlType, DataType, FieldVisibility } from '../enum/form';
import { Filter, FilterOperator, Sort } from '../classes/model/crud';
import { BaseService } from '../services/base.service';

export interface ISchemaBase {
    [key: string]: any;

    field: string;
    label?: string;
    fullLabel?: string;
    description?: string;
    placeholder?: string;
    dataType?: DataType;
    readonly controlType: ControlType;
    rowSpan?: number;
    disabled?: boolean;
    visible?: FieldVisibility;
    defaultValue?: any;

    //#region Form
    layoutWidth?: LayoutWidth | string;
    mobileWidth?: LayoutWidth | string;
    formClass?: string;
    autoFocus?: boolean;
    required?: boolean;
    onChanged?: ActionMany<[this]>;
    onInit?: ActionMany<[this]>;
    //#endregion

    //#region List
    columnWidth?: number | string;
    allowFilter?: boolean;
    filterOperator?: FilterOperator;
    headerClass?: string;
    bodyClass?: string;
    separator?: string;
    pipe?: PipeTransform;
    asyncPipe?: boolean;
    //#endregion

    clone(): this;
}

export interface IContainerSchema extends ISchemaBase {
    [key: string]: any;
    controls?: SchemaBase<ISchemaBase>[];
    showInBox?: boolean;
}

export interface ITextSchema extends ISchemaBase {
    [key: string]: any;

    selectWhenFocus?: boolean;
    dataFormat?: 'text' | 'password' | 'number' | 'email' | 'phone' | 'fax' | 'money' | 'moneyint' | 'amount';
    maxLength?: number;
    min?: number;
    max?: number;

    baseService?: BaseService;
    valueField?: string;
    displayField?: ReferenceString;

    plusUrl?: string;
    sorts?: Sort[];
    sortField?: string;
    sortDir?: 1 | -1;
    fieldPlus?: string;
}

export interface ILabelSchema extends ISchemaBase {
    [key: string]: any;
    for?: string;
    isHtml: boolean;
}

export interface IDataSourceSchema extends ISchemaBase {
    [key: string]: any;

    baseService?: BaseService;
    defaultFilters?: ControlFilter;
    valueField: string;
    displayField: ReferenceString;
    refFields?: RefField[];
    bindingFilters?: Filter[];

    isServerLoad?: boolean;
    searchField?: string[];
    pageSize?: number;
    sorts?: Sort[];
    sortField?: string;
    sortDir?: 1 | -1;
    fieldPlus?: string;
    afterGetData?: Action;

    returnType?: 'value' | 'object';
    dataSource?: ObjectType[];
    operators?: FilterOperator[];
}

export interface IDateTimeSchema extends ISchemaBase {
    [key: string]: any;

    appendTo?: string;
    panelClass?: string;
    showTime?: boolean;
    showIcon?: boolean;
    format?: 'normal' | 'fromNow';
    showOnFocus?: boolean;
    minDate?: Date;
    maxDate?: Date;
    timeOnly?: boolean;
}

export interface ICheckboxSchema extends ISchemaBase {
    [key: string]: any;

    hiddenLabel?: boolean;
    defaultValue?: boolean;
}

export interface IButtonSchema extends ISchemaBase {
    [key: string]: any;

    btClass?: string;
    icon?: string;
    btStyle?: { [key: string]: any };
    onClick?: Action;
    buttonText?: string;
}

export interface ITextAreaSchema extends ISchemaBase {
    [key: string]: any;

    rows?: number;
}

export interface IEditorSchema extends ISchemaBase {
    [key: string]: any;

    mode?: 'basic' | 'medium' | 'full' | 'simple';
    height?: number;
    initValue?: any;
    languageCode?: 'vi' | 'en';
}

export interface IAddressSchema extends ISchemaBase {
    [key: string]: any;

    hideNo?: boolean;
    hideStreet?: boolean;
    hideWard?: boolean;
    hideDistrict?: boolean;

    requiredNo?: boolean;
    requiredStreet?: boolean;
    requiredWard?: boolean;
    requiredDistrict?: boolean;
    requiredProvince?: boolean;

    wardToProvince?: boolean;

    noWidth?: number;
    streetWidth?: number;
    wardWidth?: number;
    districtWidth?: number;
    provinceWidth?: number;

    showInBox?: boolean;
    hideHolder?: boolean;
}

export interface ITableSchema extends ISchemaBase {
    [key: string]: any;

    rowTemplate: SchemaBase<ISchemaBase>[];

    autoGenerateId?: boolean;
    rowButtons?: (rowData: ObjectType) => void;

    footerButtons?: {
        icon?: string;
        label?: string;
        class?: string;
        message: string;
    }[];

    showNumber?: boolean;
    showFunction?: boolean;
    showFooter?: boolean;
    showSave?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showAdd?: boolean;
    showDialog?: boolean;

    popupSize?: PopupSize;

    enableReorderRow?: boolean;
    onReordered?: BaseService;

    enableAddMulti?: boolean;
    pickerControlField?: string;
    isUnique?: boolean;
    enablePaging?: boolean;
    limit?: number;
    initRowCount?: number;
    widthFunctionColumn?: string;

    rowButtonTemplate?: TemplateRef<any>;
    summaryTemplate?: TemplateRef<any>;
    headerTemplate?: TemplateRef<any>;

    onTableFinishInit?: BaseService;
    onAdding?: BaseService;
    onAdded?: BaseService;
    onSave?: BaseService;
    onMessage?: BaseService;
    onDeleting?: BaseService;
    onDeleted?: BaseService;
}

// Định nghĩa các kiểu dữ liệu cơ bản
export type FormLayout = 'horizontal' | 'vertical';
export type FormValidation = 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
export type FieldType = 'textbox' | 'number' | 'dropdown' | 'date' | 'checkbox' | 'radio' | 'textarea' | 'editor' | 'address' | 'percent' | 'chips' | 'autocomplete' | 'radiobuttonlist' | 'checkboxlist' | 'table' | 'container';
export type LayoutWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Interface cơ bản cho validation
export interface IFormValidation {
    type: FormValidation;
    message: string;
    value?: any;
}

// Interface cơ bản cho field
export interface IFormField {
    /** Tên field, dùng để định danh field trong form */
    name: string;
    /** Label hiển thị cho field */
    label: string;
    /** Placeholder text khi field trống */
    placeholder?: string;
    /** Giá trị của field */
    value?: any;
    /** Danh sách các validation rule */
    validations?: IFormValidation[];
    /** Field có bị disable hay không */
    disabled?: boolean;
    /** Field có bị ẩn hay không */
    hidden?: boolean;
    /** Số cột chiếm trên màn hình web (1-12) hoặc độ rộng cố định (px) */
    layoutWidth?: LayoutWidth | string;
    /** Số cột chiếm trên màn hình điện thoại (1-12) hoặc độ rộng cố định (px) */
    mobileWidth?: LayoutWidth | string;
    /** Số cột chiếm trên giao diện list (1-12) hoặc độ rộng cố định (px) */
    columnWidth?: number | string;
    /** Loại field */
    type: FieldType;
}

// Interface cho TextBox
export interface ITextBox extends IFormField {
    /** Độ dài tối đa của text */
    maxLength?: number;
    /** Độ dài tối thiểu của text */
    minLength?: number;
    /** Regex pattern để validate text */
    pattern?: string;
}

// Interface cho NumberBox
export interface INumberBox extends IFormField {
    /** Giá trị tối thiểu */
    min?: number;
    /** Giá trị tối đa */
    max?: number;
    /** Bước nhảy khi tăng/giảm giá trị */
    step?: number;
    /** Text hiển thị trước giá trị */
    prefix?: string;
    /** Text hiển thị sau giá trị */
    suffix?: string;
    /** Số chữ số thập phân */
    decimalPlaces?: number;
}

// Interface cho Dropdown
export interface IDropdown extends IFormField {
    /** Danh sách các option */
    options: { label: string; value: any }[];
    /** Cho phép chọn nhiều giá trị hay không */
    multiple?: boolean;
    /** Cho phép tìm kiếm trong dropdown hay không */
    searchable?: boolean;
    /** Cho phép xóa giá trị đã chọn hay không */
    clearable?: boolean;
}

// Interface cho DatePicker
export interface IDatePicker extends IFormField {
    /** Format hiển thị ngày tháng */
    format?: string;
    /** Ngày tối thiểu có thể chọn */
    minDate?: Date;
    /** Ngày tối đa có thể chọn */
    maxDate?: Date;
    /** Hiển thị thời gian hay không */
    showTime?: boolean;
}

// Interface cho Checkbox
export interface ICheckbox extends IFormField {
    /** Trạng thái checked của checkbox */
    checked?: boolean;
}

// Interface cho Radio
export interface IRadio extends IFormField {
    /** Danh sách các option */
    options: { label: string; value: any }[];
    /** Bố cục hiển thị: ngang hoặc dọc */
    layout?: 'horizontal' | 'vertical';
}

// Interface cho TextArea
export interface ITextArea extends IFormField {
    /** Số dòng hiển thị */
    rows?: number;
    /** Độ dài tối đa của text */
    maxLength?: number;
    /** Độ dài tối thiểu của text */
    minLength?: number;
}

// Interface cho Editor
export interface IEditor extends IFormField {
    /** Chế độ hiển thị của editor: basic, medium, full, simple */
    mode?: 'basic' | 'medium' | 'full' | 'simple';
    /** Chiều cao của editor (px) */
    height?: number;
    /** Ngôn ngữ hiển thị: vi hoặc en */
    languageCode?: 'vi' | 'en';
}

// Interface cho Address
export interface IAddress extends IFormField {
    /** Ẩn trường số nhà */
    hideNo?: boolean;
    /** Ẩn trường đường */
    hideStreet?: boolean;
    /** Ẩn trường phường/xã */
    hideWard?: boolean;
    /** Ẩn trường quận/huyện */
    hideDistrict?: boolean;
    /** Bắt buộc nhập số nhà */
    requiredNo?: boolean;
    /** Bắt buộc nhập đường */
    requiredStreet?: boolean;
    /** Bắt buộc nhập phường/xã */
    requiredWard?: boolean;
    /** Bắt buộc nhập quận/huyện */
    requiredDistrict?: boolean;
    /** Bắt buộc nhập tỉnh/thành phố */
    requiredProvince?: boolean;
    /** Tự động điền tỉnh/thành phố khi chọn phường/xã */
    wardToProvince?: boolean;
    /** Độ rộng trường số nhà (px) */
    noWidth?: number;
    /** Độ rộng trường đường (px) */
    streetWidth?: number;
    /** Độ rộng trường phường/xã (px) */
    wardWidth?: number;
    /** Độ rộng trường quận/huyện (px) */
    districtWidth?: number;
    /** Độ rộng trường tỉnh/thành phố (px) */
    provinceWidth?: number;
    /** Hiển thị trong box hay không */
    showInBox?: boolean;
    /** Ẩn holder hay không */
    hideHolder?: boolean;
}

// Interface cho Percent
export interface IPercent extends IFormField {
    /** Giá trị tối thiểu (%) */
    min?: number;
    /** Giá trị tối đa (%) */
    max?: number;
    /** Bước nhảy khi tăng/giảm giá trị (%) */
    step?: number;
}

// Interface cho Chips
export interface IChips extends IFormField {
    /** Số lượng chip tối đa */
    max?: number;
    /** Số lượng chip tối thiểu */
    min?: number;
}

// Interface cho AutoComplete
export interface IAutoComplete extends IFormField {
    /** Danh sách các option */
    options: { label: string; value: any }[];
    /** Cho phép chọn nhiều giá trị hay không */
    multiple?: boolean;
    /** Độ dài tối thiểu để bắt đầu tìm kiếm */
    minLengthFilter?: number;
}

// Interface cho RadioButtonList
export interface IRadioButtonList extends IFormField {
    /** Danh sách các option */
    options: { label: string; value: any }[];
    /** Bố cục hiển thị: ngang hoặc dọc */
    layout?: 'horizontal' | 'vertical';
    /** Căn lề: trái, giữa, phải */
    align?: 'left' | 'center' | 'right';
}

// Interface cho CheckBoxList
export interface ICheckBoxList extends IFormField {
    /** Danh sách các option */
    options: { label: string; value: any }[];
    /** Bố cục hiển thị: ngang hoặc dọc */
    layout?: 'horizontal' | 'vertical';
    /** Căn lề: trái, giữa, phải */
    align?: 'left' | 'center' | 'right';
    /** Class CSS bổ sung */
    classPlus?: string;
    /** Text tự do */
    freeText?: string;
    /** Số cột hiển thị */
    pColClass?: number;
}

// Interface cho Table
export interface ITable extends IFormField {
    /** Template cho mỗi dòng */
    rowTemplate: IFormField[];
    /** Tự động tạo ID cho mỗi dòng */
    autoGenerateId?: boolean;
    /** Các nút cho mỗi dòng */
    rowButtons?: (rowData: any) => void;
    /** Các nút ở footer */
    footerButtons?: {
        /** Icon của nút */
        icon?: string;
        /** Label của nút */
        label?: string;
        /** Class CSS của nút */
        class?: string;
        /** Message hiển thị khi click nút */
        message: string;
    }[];
    /** Hiển thị số thứ tự hay không */
    showNumber?: boolean;
    /** Hiển thị cột chức năng hay không */
    showFunction?: boolean;
    /** Hiển thị footer hay không */
    showFooter?: boolean;
    /** Hiển thị nút lưu hay không */
    showSave?: boolean;
    /** Hiển thị nút sửa hay không */
    showEdit?: boolean;
    /** Hiển thị nút xóa hay không */
    showDelete?: boolean;
    /** Hiển thị nút thêm hay không */
    showAdd?: boolean;
    /** Hiển thị dialog hay không */
    showDialog?: boolean;
    /** Cho phép sắp xếp lại các dòng hay không */
    enableReorderRow?: boolean;
    /** Cho phép thêm nhiều dòng cùng lúc hay không */
    enableAddMulti?: boolean;
    /** Field điều khiển picker */
    pickerControlField?: string;
    /** Kiểm tra tính duy nhất hay không */
    isUnique?: boolean;
    /** Bật phân trang hay không */
    enablePaging?: boolean;
    /** Số dòng tối đa mỗi trang */
    limit?: number;
    /** Số dòng ban đầu */
    initRowCount?: number;
    /** Độ rộng cột chức năng */
    widthFunctionColumn?: string;
}

// Interface cho Container
export interface IContainer extends IFormField {
    /** Danh sách các field con */
    fields: IFormField[];
    /** Bố cục hiển thị: ngang hoặc dọc */
    layout?: 'horizontal' | 'vertical';
    /** Số cột (cho layout ngang) */
    columns?: number;
    /** Khoảng cách giữa các field (px) */
    gap?: number;
    /** Padding của container (px) */
    padding?: number;
    /** Có viền hay không */
    border?: boolean;
    /** Tiêu đề của container */
    title?: string;
    /** Có thể thu gọn hay không */
    collapsible?: boolean;
    /** Trạng thái thu gọn */
    collapsed?: boolean;
}

