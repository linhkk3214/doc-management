import { PipeTransform, TemplateRef } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import {
  AllowedRowsPerPage,
  ListEventData,
  RunTimeSetting,
} from '../../components/crud/ae-list/ae-list.component';
import { ControlType, DataType, FormState, HeightType } from '../../enum/form';
import {
  IAddress,
  IAutoComplete,
  ICheckbox,
  ICheckBoxList,
  IChips,
  IContainer,
  IDataSource,
  IDatePicker,
  IDropdown,
  IEditor,
  IFormField,
  IFormValidation,
  INumberBox,
  IParentField,
  IPercent,
  IRadio,
  IRadioButtonList,
  ITable,
  ITextArea,
  ITextBox,
  LayoutWidth,
} from '../../interfaces/i-form-model';
import { BaseService } from '../../services/base.service';
import { StringUtils } from '../../util/string';
import { ActionMany, ObjectType } from './common';
import { Filter, FilterOperator, GridInfo } from './crud';
import { ListData } from '../../interfaces/i-list-base';

export type ReferenceString = string | ((obj: ObjectType) => string);

abstract class BaseClass {
  initBase<T>(this: T, actionInit: (obj: T) => void): T {
    actionInit(this);
    return this;
  }
}

export class ListSetting extends BaseClass {
  title?: string; // The title of the list
  settingsPath?: string;
  tableName?: string;
  entityKey = 'id';
  objectName = '';

  dataSource?: ObjectType[] | undefined = undefined;
  schemas: IFormField[] = [];
  pageSetting: PageSetting = new PageSetting();
  heightType: HeightType = HeightType.default; // Có custom chiều cao không: Thường sử dụng trong dialog
  fixHeightTypeInDialog? = true;

  allowSelectRow: boolean | ((rowData: ObjectType, evt: Event) => boolean) =
    true;
  selectionMode: 'single' | 'multiple' = 'multiple';
  sortMode: 'single' | 'multiple' = 'multiple';

  paginator = true;
  showPageSettings = true;
  allowImport = false;

  hiddenHeader = false;
  hiddenPageSetting = false;
  hiddenAdvanceSearch = false;
  hiddenSetting = false;
  hiddenPageTitle = false;

  hiddenCheckbox = false;
  hiddenRowIndex = false;
  hiddenReOrder = true;
  hiddenFunctionColumn = false;
  hiddenRefresh = false;
  hiddenFilterRow = false;

  fieldSearchText: string[] = [];

  constructor(title?: string) {
    super();
    this.title = title;
  }

  getSettingsPath(): string {
    return this.settingsPath
      ? this.settingsPath
      : (this.tableName ? `${this.tableName}-` : '') + window.location.pathname;
  }
}

export class CrudListSetting extends ListSetting {
  viewDetailPath?: string;
  baseService?: BaseService;
  fields?: string; // list custom fields
  reSelectLastItem = true; // Select lại item cuối cùng đã chọn của grid
  afterGetData: (
    data: ListData<ObjectType>
  ) => Observable<ListData<ObjectType>> = (data) => of(data);
  onEdit?: (eventData: ListEventData) => void;
  modifyGridInfo?: (gridInfo: GridInfo) => void;

  showEditLink = true; // show a detail link in rows
  constructor(title?: string) {
    super(title);
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
  pageSize: AllowedRowsPerPage = 15;

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
  buildInSchema?: IFormField[] = [];
  uniqueField?: string[] | string[][] = [];
  fieldDropdown?: { [key: string]: Dropdown } = {};
  fieldNeedGetRef?: { [key: string]: TextBox } = {};
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
  entityPermissionSchema?: IFormField[] = [];
  keepInitSearchDataNotNull = true;

  constructor(init?: AdvanceSearchSetting) {
    super();
    for (const key in init) {
      this[key] = init[key];
    }
  }
}

function setDefaultValueForField<T extends IFormField>(options: Partial<T>) {
  if (!options.layoutWidth) options.layoutWidth = 6;
  options.mobileWidth = 12;
  return options;
}

// Helper functions để tạo field schema
export function createTextBox(
  field: string,
  options: Partial<ITextBox> = {}
): ITextBox {
  setDefaultValueForField(options);
  options.field = field;
  return new TextBox(<ITextBox>options);
}

export function createNumberBox(
  field: string,
  options: Partial<INumberBox> = {}
): INumberBox {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.decimal;
  return new NumberBox(<INumberBox>options);
}

export function createDropdown(
  field: string,
  dropdownOptions: Partial<IDropdown> = {}
): IDropdown {
  setDefaultValueForField(dropdownOptions);
  dropdownOptions.field = field;
  dropdownOptions.dataType = DataType.enum;
  return new Dropdown(<IDropdown>dropdownOptions);
}

export function createDatePicker(
  field: string,
  options: Partial<IDatePicker> = {}
): IDatePicker {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.date;
  return new DatePicker(<IDatePicker>options);
}

export function createCheckbox(
  field: string,
  options: Partial<ICheckbox> = {}
): ICheckbox {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.boolean;
  return new Checkbox(<ICheckbox>options);
}

export function createRadio(
  field: string,
  options: { ten: string; id: any }[],
  radioOptions: Partial<IRadio> = {}
): IRadio {
  setDefaultValueForField(radioOptions);
  radioOptions.field = field;
  radioOptions.dataType = DataType.enum;
  radioOptions.options = options;
  return new Radio(<IRadio>radioOptions);
}

export function createTextArea(
  field: string,
  options: Partial<ITextArea> = {}
): ITextArea {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.string;
  return new TextArea(<ITextArea>options);
}

export function createEditor(
  field: string,
  options: Partial<IEditor> = {}
): IEditor {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.html;
  return new Editor(<IEditor>options);
}

export function createAddress(
  field: string,
  options: Partial<IAddress> = {}
): IAddress {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.string;
  return new Address(<IAddress>options);
}

export function createPercent(
  field: string,
  options: Partial<IPercent> = {}
): IPercent {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.decimal;
  return new Percent(<IPercent>options);
}

export function createChips(
  field: string,
  options: Partial<IChips> = {}
): IChips {
  setDefaultValueForField(options);
  options.field = field;
  options.dataType = DataType.string;
  return new Chips(<IChips>options);
}

export function createAutoComplete(
  field: string,
  options: { label: string; value: any }[],
  autoCompleteOptions: Partial<IAutoComplete> = {}
): IAutoComplete {
  setDefaultValueForField(autoCompleteOptions);
  autoCompleteOptions.field = field;
  autoCompleteOptions.dataType = DataType.enum;
  autoCompleteOptions.options = options;
  return new AutoComplete(<IAutoComplete>autoCompleteOptions);
}

export function createRadioButtonList(
  field: string,
  options: { label: string; value: any }[],
  radioButtonListOptions: Partial<IRadioButtonList> = {}
): IRadioButtonList {
  setDefaultValueForField(radioButtonListOptions);
  radioButtonListOptions.field = field;
  radioButtonListOptions.dataType = DataType.enum;
  radioButtonListOptions.options = options;
  return new RadioButtonList(<IRadioButtonList>radioButtonListOptions);
}

export function createCheckBoxList(
  field: string,
  options: { label: string; value: any }[],
  checkBoxListOptions: Partial<ICheckBoxList> = {}
): ICheckBoxList {
  setDefaultValueForField(checkBoxListOptions);
  checkBoxListOptions.field = field;
  checkBoxListOptions.dataType = DataType.enum;
  checkBoxListOptions.options = options;
  return new CheckBoxList(<ICheckBoxList>checkBoxListOptions);
}

export function createTable(
  rowTemplate: IFormField[],
  tableOptions: Partial<ITable> = {}
): ITable {
  setDefaultValueForField(tableOptions);
  if (!tableOptions.field) tableOptions.field = StringUtils.guid();
  tableOptions.includeInList = false;
  tableOptions.dataType = DataType.list;
  tableOptions.rowTemplate = rowTemplate;
  return new Table(<ITable>tableOptions);
}

export function createContainer(
  fields: IFormField[],
  containerOptions: Partial<IContainer> = {}
): IContainer {
  setDefaultValueForField(containerOptions);
  if (!containerOptions.field) containerOptions.field = StringUtils.guid();
  containerOptions.dataType = DataType.object;
  containerOptions.fields = fields;
  if (containerOptions.hiddenInList === undefined)
    containerOptions.hiddenInList = true;
  if (containerOptions.allowFilter === undefined)
    containerOptions.allowFilter = false;
  return new Container(<IContainer>containerOptions);
}

// Ví dụ sử dụng:
/*
// Khai báo field schema
const cityFieldSchema: IFormField[] = [
    createTextBox('ma', 'Mã thành phố', {
        validations: [{ type: 'required', message: 'Vui lòng nhập mã thành phố' }]
    }),
    createTextBox('ten', 'Tên thành phố', {
        validations: [{ type: 'required', message: 'Vui lòng nhập tên thành phố' }]
    }),
    createNumberBox('dienTich', 'Diện tích', {
        validations: [
            { type: 'required', message: 'Vui lòng nhập diện tích' },
            { type: 'min', message: 'Diện tích phải lớn hơn 0', value: 0 }
        ],
        suffix: ' km²'
    }),
    createNumberBox('danSo', 'Dân số', {
        validations: [
            { type: 'required', message: 'Vui lòng nhập dân số' },
            { type: 'min', message: 'Dân số phải lớn hơn 0', value: 0 }
        ],
        suffix: ' người'
    }),
    createDropdown('tinhId', 'Tỉnh', [
        { label: 'Hà Nội', value: 'HN' },
        { label: 'Hồ Chí Minh', value: 'HCM' }
    ], {
        validations: [{ type: 'required', message: 'Vui lòng chọn tỉnh' }]
    })
];

// Sử dụng cho form
const formFields = cityFieldSchema.map(field => FormFieldFactory.createField(field));

// Sử dụng cho list
const listFields = cityFieldSchema.filter(field => !field.hidden);
*/

// Class cơ bản cho field
export abstract class FormFieldBase implements IFormField {
  readonly controlType: ControlType = ControlType.textbox;
  field: string;
  displayField = '';
  label?: string;
  fullLabel?: string;
  value?: any;
  validations?: IFormValidation[];
  disabled?: boolean;
  dataType: DataType;
  useLocalization = false;

  //#region Form
  hiddenInForm = false;
  placeholder?: string = '';
  layoutWidth: LayoutWidth | string = 6;
  mobileWidth: LayoutWidth | string = 12;
  formClass?: string;
  autoFocus = false;
  required = false;
  onChanged?: ActionMany<[this]>;
  onInit?: ActionMany<[this]>;
  //#endregion

  //#region List
  cellTemplate?: TemplateRef<any> | undefined;
  hiddenInList = false;
  includeInList = true;
  columnWidth?: number | string;
  allowFilter = true;
  allowSort = true;
  searchPlaceholder?: string = '';
  filterOperator?: FilterOperator;
  headerClass?: string;
  bodyClass?: string;
  separator = ', '; // Trong trường hợp field là reference
  pipe?: PipeTransform;
  pipeParams?: any[];
  asyncPipe = true;
  //#endregion
  //#endregion

  //#region Custom
  fieldPath?: string;
  // The original index in schemas
  rawIndex: number[] = [];
  //#region Form
  template: TemplateRef<any> | null = null;
  subTemplate: TemplateRef<any> | null = null;
  //#endregion
  customSetting: RunTimeSetting = <RunTimeSetting>{};
  //#endregion

  protected _template?: TemplateRef<any>;
  protected _isDirty: boolean = false;
  protected _isTouched: boolean = false;
  protected _errors: string[] = [];

  constructor(field: IFormField) {
    Object.assign(this, field);
    this.field = field.field;
    if (!this.displayField) this.displayField = field.field;
    this.dataType = field.dataType;
  }

  public setTemplate(template: TemplateRef<any>): void {
    this._template = template;
  }

  public getTemplate(): TemplateRef<any> | undefined {
    return this._template;
  }

  public markAsDirty(): void {
    this._isDirty = true;
  }

  public markAsTouched(): void {
    this._isTouched = true;
  }

  public isDirty(): boolean {
    return this._isDirty;
  }

  public isTouched(): boolean {
    return this._isTouched;
  }

  public getErrors(): string[] {
    return this._errors;
  }

  public validate(): boolean {
    this._errors = [];
    if (!this.validations) return true;

    for (const validation of this.validations) {
      switch (validation.type) {
        case 'required':
          if (!this.value) {
            this._errors.push(validation.message);
            return false;
          }
          break;
        case 'min':
          if (this.value < validation.value) {
            this._errors.push(validation.message);
            return false;
          }
          break;
        case 'max':
          if (this.value > validation.value) {
            this._errors.push(validation.message);
            return false;
          }
          break;
        case 'pattern':
          if (!new RegExp(validation.value).test(this.value)) {
            this._errors.push(validation.message);
            return false;
          }
          break;
      }
    }

    return true;
  }

  abstract clone(): this;
}

// Class cho TextBox
export class TextBox extends FormFieldBase implements ITextBox {
  override dataType: DataType = DataType.string;
  override controlType: ControlType = ControlType.textbox;
  maxLength?: number;
  minLength?: number;
  pattern?: string;

  constructor(field: ITextBox) {
    super(field);
    this.maxLength = field.maxLength;
    this.minLength = field.minLength;
    this.pattern = field.pattern;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.minLength && this.value.length < this.minLength) {
      this._errors.push(`Độ dài tối thiểu là ${this.minLength} ký tự`);
      return false;
    }

    if (this.maxLength && this.value.length > this.maxLength) {
      this._errors.push(`Độ dài tối đa là ${this.maxLength} ký tự`);
      return false;
    }

    if (this.pattern && !new RegExp(this.pattern).test(this.value)) {
      this._errors.push('Giá trị không đúng định dạng');
      return false;
    }

    return true;
  }

  override clone(): this {
    const clone: TextBox = new TextBox({
      ...this,
    });
    return clone as this;
  }
}

// Class cho NumberBox
export class NumberBox extends FormFieldBase implements INumberBox {
  override dataType: DataType = DataType.decimal;
  override controlType: ControlType = ControlType.number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;

  constructor(field: INumberBox) {
    super(field);
    this.min = field.min;
    this.max = field.max;
    this.step = field.step;
    this.prefix = field.prefix;
    this.suffix = field.suffix;
    this.decimalPlaces = field.decimalPlaces;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.min !== undefined && this.value < this.min) {
      this._errors.push(`Giá trị tối thiểu là ${this.min}`);
      return false;
    }

    if (this.max !== undefined && this.value > this.max) {
      this._errors.push(`Giá trị tối đa là ${this.max}`);
      return false;
    }

    return true;
  }

  override clone(): this {
    const clone: NumberBox = new NumberBox({
      ...this,
    });
    return clone as this;
  }
}

export abstract class DataSource extends FormFieldBase implements IDataSource {
  optionValue = 'id';
  optionLabel = 'ten';
  funcGetLabel?: ((item: ObjectType) => string) | undefined;
  indexGetData = 1;
  options: { id: any; ten: string }[] = [];
  parrentFields: IParentField[] = [];
  baseService?: BaseService;
  multipleSearch = true;
  constructor(field: IDataSource) {
    super(field);
    if (field.optionValue) this.optionValue = field.optionValue;
    if (field.optionLabel) this.optionLabel = field.optionLabel;
    this.indexGetData = field.indexGetData;
    this.options = field.options;
    if (field.parrentFields)
      this.parrentFields = <IParentField[]>field.parrentFields;
    this.baseService = field.baseService;
  }
}

// Class cho Dropdown
export class Dropdown extends DataSource implements IDropdown {
  override dataType: DataType = DataType.enum;
  override controlType: ControlType = ControlType.combobox;
  multiple?: boolean;

  constructor(field: IDropdown) {
    super(field);
    this.multiple = field.multiple;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.multiple) {
      if (!Array.isArray(this.value)) {
        this._errors.push('Giá trị phải là một mảng');
        return false;
      }
    } else {
      if (Array.isArray(this.value)) {
        this._errors.push('Giá trị không được là một mảng');
        return false;
      }
    }

    return true;
  }

  override clone(): this {
    const clone: Dropdown = new Dropdown({
      ...this,
    });
    return clone as this;
  }
}

// Class cho DatePicker
export class DatePicker extends FormFieldBase implements IDatePicker {
  override dataType: DataType = DataType.date;
  override controlType: ControlType = ControlType.date;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;

  constructor(field: IDatePicker) {
    super(field);
    this.format = field.format;
    this.minDate = field.minDate;
    this.maxDate = field.maxDate;
    this.showTime = field.showTime;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.minDate && this.value < this.minDate) {
      this._errors.push(
        `Ngày tối thiểu là ${this.minDate.toLocaleDateString()}`
      );
      return false;
    }

    if (this.maxDate && this.value > this.maxDate) {
      this._errors.push(`Ngày tối đa là ${this.maxDate.toLocaleDateString()}`);
      return false;
    }

    return true;
  }

  override clone(): this {
    const clone: DatePicker = new DatePicker({
      ...this,
    });
    return clone as this;
  }
}

// Class cho Checkbox
export class Checkbox extends FormFieldBase implements ICheckbox {
  override dataType: DataType = DataType.boolean;
  override controlType: ControlType = ControlType.checkbox;
  checked?: boolean;

  constructor(field: ICheckbox) {
    super(field);
    this.checked = field.checked;
  }

  override clone(): this {
    const clone: Checkbox = new Checkbox({
      ...this,
    });
    return clone as this;
  }
}

// Class cho Radio
export class Radio extends DataSource implements IRadio {
  override dataType: DataType = DataType.enum;
  override controlType: ControlType = ControlType.radio;
  layout?: 'horizontal' | 'vertical';

  constructor(field: IRadio) {
    super(field);
    this.layout = field.layout;
  }

  override clone(): this {
    const clone: Radio = new Radio({
      ...this,
    });
    return clone as this;
  }
}

// Class cho TextArea
export class TextArea extends FormFieldBase implements ITextArea {
  override dataType: DataType = DataType.string;
  override controlType: ControlType = ControlType.textarea;
  rows?: number;
  maxLength?: number;
  minLength?: number;

  constructor(field: ITextArea) {
    super(field);
    this.rows = field.rows;
    this.maxLength = field.maxLength;
    this.minLength = field.minLength;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.minLength && this.value.length < this.minLength) {
      this._errors.push(`Độ dài tối thiểu là ${this.minLength} ký tự`);
      return false;
    }

    if (this.maxLength && this.value.length > this.maxLength) {
      this._errors.push(`Độ dài tối đa là ${this.maxLength} ký tự`);
      return false;
    }

    return true;
  }

  override clone(): this {
    const clone: TextArea = new TextArea({
      ...this,
    });
    return clone as this;
  }
}

// Class cho Editor
export class Editor extends FormFieldBase implements IEditor {
  override dataType: DataType = DataType.html;
  override controlType: ControlType = ControlType.editor;
  mode?: 'basic' | 'medium' | 'full' | 'simple';
  height?: number;
  languageCode?: 'vi' | 'en';

  constructor(field: IEditor) {
    super(field);
    this.mode = field.mode;
    this.height = field.height;
    this.languageCode = field.languageCode;
  }

  override clone(): this {
    const clone: Editor = new Editor({
      ...this,
    });
    return clone as this;
  }
}

// Class cho Address
export class Address extends FormFieldBase implements IAddress {
  override dataType: DataType = DataType.string;
  override controlType: ControlType = ControlType.address;
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

  constructor(field: IAddress) {
    super(field);
    this.hideNo = field.hideNo;
    this.hideStreet = field.hideStreet;
    this.hideWard = field.hideWard;
    this.hideDistrict = field.hideDistrict;
    this.requiredNo = field.requiredNo;
    this.requiredStreet = field.requiredStreet;
    this.requiredWard = field.requiredWard;
    this.requiredDistrict = field.requiredDistrict;
    this.requiredProvince = field.requiredProvince;
    this.wardToProvince = field.wardToProvince;
    this.noWidth = field.noWidth;
    this.streetWidth = field.streetWidth;
    this.wardWidth = field.wardWidth;
    this.districtWidth = field.districtWidth;
    this.provinceWidth = field.provinceWidth;
    this.showInBox = field.showInBox;
    this.hideHolder = field.hideHolder;
  }

  override clone(): this {
    const clone: Address = new Address({
      ...this,
    });
    return clone as this;
  }
}

// Class cho Percent
export class Percent extends FormFieldBase implements IPercent {
  override dataType: DataType = DataType.decimal;
  override controlType: ControlType = ControlType.number;
  min?: number;
  max?: number;
  step?: number;

  constructor(field: IPercent) {
    super(field);
    this.min = field.min;
    this.max = field.max;
    this.step = field.step;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.min !== undefined && this.value < this.min) {
      this._errors.push(`Giá trị tối thiểu là ${this.min}%`);
      return false;
    }

    if (this.max !== undefined && this.value > this.max) {
      this._errors.push(`Giá trị tối đa là ${this.max}%`);
      return false;
    }

    return true;
  }

  override clone(): this {
    const clone: Percent = new Percent({
      ...this,
    });
    return clone as this;
  }
}

// Class cho Chips
export class Chips extends FormFieldBase implements IChips {
  override dataType: DataType = DataType.string;
  override controlType: ControlType = ControlType.chips;
  max?: number;
  min?: number;

  constructor(field: IChips) {
    super(field);
    this.max = field.max;
    this.min = field.min;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.min !== undefined && this.value.length < this.min) {
      this._errors.push(`Số lượng tối thiểu là ${this.min}`);
      return false;
    }

    if (this.max !== undefined && this.value.length > this.max) {
      this._errors.push(`Số lượng tối đa là ${this.max}`);
      return false;
    }

    return true;
  }

  override clone(): this {
    const clone: Chips = new Chips({
      ...this,
    });
    return clone as this;
  }
}

// Class cho AutoComplete
export class AutoComplete extends FormFieldBase implements IAutoComplete {
  override dataType: DataType = DataType.enum;
  override controlType: ControlType = ControlType.autocomplete;
  options: { label: string; value: any }[] = [];
  multiple?: boolean;
  minLengthFilter?: number;

  constructor(field: IAutoComplete) {
    super(field);
    this.options = field.options;
    this.multiple = field.multiple;
    this.minLengthFilter = field.minLengthFilter;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    if (this.multiple) {
      if (!Array.isArray(this.value)) {
        this._errors.push('Giá trị phải là một mảng');
        return false;
      }
    } else {
      if (Array.isArray(this.value)) {
        this._errors.push('Giá trị không được là một mảng');
        return false;
      }
    }

    return true;
  }

  override clone(): this {
    const clone: AutoComplete = new AutoComplete({
      ...this,
    });
    return clone as this;
  }
}

// Class cho RadioButtonList
export class RadioButtonList extends FormFieldBase implements IRadioButtonList {
  override dataType: DataType = DataType.enum;
  override controlType: ControlType = ControlType.radio;
  options: { label: string; value: any }[] = [];
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';

  constructor(field: IRadioButtonList) {
    super(field);
    this.options = field.options;
    this.layout = field.layout;
    this.align = field.align;
  }

  override clone(): this {
    const clone: RadioButtonList = new RadioButtonList({
      ...this,
    });
    return clone as this;
  }
}

// Class cho CheckBoxList
export class CheckBoxList extends FormFieldBase implements ICheckBoxList {
  override dataType: DataType = DataType.enum;
  override controlType: ControlType = ControlType.checkbox;
  options: { label: string; value: any }[] = [];
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
  classPlus?: string;
  freeText?: string;
  pColClass?: number;

  constructor(field: ICheckBoxList) {
    super(field);
    this.options = field.options;
    this.layout = field.layout;
    this.align = field.align;
    this.classPlus = field.classPlus;
    this.freeText = field.freeText;
    this.pColClass = field.pColClass;
  }

  override clone(): this {
    const clone: CheckBoxList = new CheckBoxList({
      ...this,
    });
    return clone as this;
  }
}

// Class cho Table
export class Table extends FormFieldBase implements ITable {
  override dataType: DataType = DataType.list;
  override controlType: ControlType = ControlType.table;
  rowTemplate: IFormField[] = [];
  autoGenerateId?: boolean;
  rowButtons?: (rowData: any) => void;
  footerButtons?: {
    icon?: string;
    label?: string;
    class?: string;
    message: string;
  }[] = [];
  showNumber?: boolean;
  showFunction?: boolean;
  showFooter?: boolean;
  showSave?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showAdd?: boolean;
  showDialog?: boolean;
  enableReorderRow?: boolean;
  enableAddMulti?: boolean;
  pickerControlField?: string;
  isUnique?: boolean;
  enablePaging?: boolean;
  limit?: number;
  initRowCount?: number;
  widthFunctionColumn?: string;

  constructor(field: ITable) {
    super(field);
    this.rowTemplate = field.rowTemplate;
    this.autoGenerateId = field.autoGenerateId;
    this.rowButtons = field.rowButtons;
    this.footerButtons = field.footerButtons;
    this.showNumber = field.showNumber;
    this.showFunction = field.showFunction;
    this.showFooter = field.showFooter;
    this.showSave = field.showSave;
    this.showEdit = field.showEdit;
    this.showDelete = field.showDelete;
    this.showAdd = field.showAdd;
    this.showDialog = field.showDialog;
    this.enableReorderRow = field.enableReorderRow;
    this.enableAddMulti = field.enableAddMulti;
    this.pickerControlField = field.pickerControlField;
    this.isUnique = field.isUnique;
    this.enablePaging = field.enablePaging;
    this.limit = field.limit;
    this.initRowCount = field.initRowCount;
    this.widthFunctionColumn = field.widthFunctionColumn;
  }

  override clone(): this {
    const clone: Table = new Table({
      ...this,
      rowTemplate: this.rowTemplate.map((field) => field.clone()),
    });
    return clone as this;
  }
}

// Class cho Container
export class Container extends FormFieldBase implements IContainer {
  override dataType: DataType = DataType.object;
  override controlType: ControlType = ControlType.container;
  fields: IFormField[] = [];
  layout?: 'horizontal' | 'vertical';
  columns?: number;
  gap?: number;
  padding?: number;
  border?: boolean;
  title?: string;
  collapsible?: boolean;
  collapsed?: boolean;

  constructor(field: IContainer) {
    super(field);
    this.fields = field.fields;
    this.layout = field.layout;
    this.columns = field.columns;
    this.gap = field.gap;
    this.padding = field.padding;
    this.border = field.border;
    this.title = field.title;
    this.collapsible = field.collapsible;
    this.collapsed = field.collapsed;
  }

  public override validate(): boolean {
    if (!super.validate()) return false;

    // Validate all fields in container
    for (const field of this.fields) {
      const fieldInstance = <FormFieldBase>(<any>field);
      if (!fieldInstance.validate()) {
        this._errors.push(...fieldInstance.getErrors());
        return false;
      }
    }

    return true;
  }

  override clone(): this {
    const clone: Container = new Container({
      ...this,
      fields: this.fields.map((field) => field.clone()),
    });
    return clone as this;
  }
}
