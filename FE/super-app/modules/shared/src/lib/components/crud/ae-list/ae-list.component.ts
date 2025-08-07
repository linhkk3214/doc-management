import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  effect,
  inject,
  input,
  OnInit,
  output,
  PipeTransform,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SortEvent, SortMeta } from 'primeng/api';
import { Button, ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  Table,
  TableModule,
  TableRowSelectEvent,
  TableRowUnSelectEvent,
} from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { isArray, ObjectType } from '../../../classes/model/common';
import {
  Filter,
  FilterOperator,
  GridInfo,
  Sort,
} from '../../../classes/model/crud';
import {
  Container,
  createCheckbox,
  createTextBox,
  DataSource,
  Dropdown,
  FormFieldBase,
  ListSetting,
} from '../../../classes/model/form-model';
import { ControlType, DataType } from '../../../enum/form';
import { IFormField } from '../../../interfaces/i-form-model';
import { ValueByPathPipe } from '../../../pipe/value-by-path.pipe';
import { AeMessageService } from '../../../services/ae-message.service';
import { LanguageService } from '../../../services/language.service';
import { StorageService } from '../../../services/storage.service';
import { ArrayUtils } from '../../../util/array';
import { addClickOutside, emptyHandle } from '../../../util/event';
import { getValueByPath, setValueByPath } from '../../../util/object';
import { CheckRenderedComponent } from '../../check-rendered/check-rendered.component';
import { AeDropdownComponent } from '../../controls/ae-dropdown/ae-dropdown.component';
import { ColumnConfigurationComponent } from '../column-configuration/column-configuration.component';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { ListData } from '../../../interfaces/i-list-base';

export const ROWS_PER_PAGE_OPTIONS = [-1, 5, 10, 15, 20, 30, 50, 100] as const;
export type AllowedRowsPerPage = (typeof ROWS_PER_PAGE_OPTIONS)[number];

@Component({
  selector: 'ae-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TooltipModule,
    CheckboxModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    ToastModule,
    AeDropdownComponent,
    TranslateModule,
    ButtonModule,
    DialogModule,
    SelectButtonModule,
    PaginatorModule,
    CheckRenderedComponent,
    ColumnConfigurationComponent,
    ValueByPathPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ae-list.component.html',
  styleUrl: './ae-list.component.css',
})
export class AeListComponent implements OnInit, AfterViewChecked {
  @ViewChild('filterText', { static: true })
  templateFilterText!: TemplateRef<any>;
  @ViewChild('filterNumber', { static: true })
  templateFilterNumber!: TemplateRef<any>;
  @ViewChild('filterCheckbox', { static: true })
  templateFilterCheckbox!: TemplateRef<any>;
  @ViewChild('filterDropdown', { static: true })
  templateFilterDropdown!: TemplateRef<any>;
  @ViewChild('cellTemplateCheckbox', { static: true })
  cellTemplateCheckbox!: TemplateRef<any>;
  @ViewChild('cellTemplateDate', { static: true })
  cellTemplateDate!: TemplateRef<any>;
  @ViewChild('cellTemplateDatetime', { static: true })
  cellTemplateDatetime!: TemplateRef<any>;
  @ViewChild('inlineTemplateCheckbox', { static: true })
  inlineTemplateCheckbox!: TemplateRef<any>;
  @ViewChild('table', { static: true }) table!: Table;
  @ViewChild('paginator') paginator!: Paginator;

  //#region User define
  @ContentChild('caption', { static: true }) caption?: TemplateRef<any>;
  //#endregion

  settings = input<ListSetting>(new ListSetting());
  settingsComputed = computed(() => this.settings());
  get settingsVal() {
    return this.settingsComputed();
  }
  columns = input<IFormField[]>([]);
  columnFlateds = signal<FormFieldBase[]>([]);
  processedColumns = signal<FormFieldBase[]>([]);
  loading = input<boolean>(false);
  listData = input<ListData<ObjectType>>(new ListData([], 0));
  filteredDataSource = signal<ObjectType[]>([]);
  dataSourceComputed = computed(() => {
    console.log('computed datasource');
    return [...this.filteredDataSource()];
  });
  get data() {
    return this.dataSourceComputed();
  }
  pageSize = input<AllowedRowsPerPage>(10);
  offline = input<boolean>(true);
  rowPerPageOptions: number[] = [...ROWS_PER_PAGE_OPTIONS];
  execute = output<ListEventData>();

  private languageService = inject(LanguageService);
  private translateService = inject(TranslateService);
  private storageService = inject(StorageService);
  private messageService = inject(AeMessageService);
  private columnsHasPipe: ColumnHasPipe[] = [];
  private syncDataSourceCols: DataSource[] = [];
  private dataSourceChain: DataSourceChain = new DataSourceChain();
  private tableElement: HTMLElement;
  private searchFilters: Filter[] = [];

  protected selectedItems: ObjectType[] = [];

  dialogType = DialogType;
  visibleDialog: DialogType = DialogType.None;
  checkedAll = false;
  checkedCount = 0;
  dicChecked: { [key: string | number | symbol]: boolean } = {};
  templateFilters: Filter[] = [];
  dicSearchValue: ObjectType = {};
  #previousSearchValue: any;
  binaryOptions = [
    {
      value: true,
      label: 'True',
      icon: 'pi pi-check',
      class: 'text-green-500',
    },
    {
      value: false,
      label: 'False',
      icon: 'pi pi-times',
      class: 'text-orange-500',
    },
  ];
  fromPrefix = Filter.fromPrefix;
  toPrefix = Filter.toPrefix;
  columnConfigurationSetting: ListSetting = new ListSetting();
  columnConfigurationSchema: IFormField[] = [
    createTextBox('label', {
      label: 'label',
      useLocalization: true,
    }),
    createCheckbox('visible', {
      label: 'visible',
      columnWidth: 100,
      useLocalization: true,
      bodyClass: 'text-center',
    }),
  ];
  columnConfigurationDataSource: ListData<ColumnSetting> = new ListData([], 0);
  get hasFilter() {
    return this.searchFilters.length > 0;
  }
  #previousSort: SortEvent | undefined;
  #clientSearch = false;
  first = 0;

  constructor() {
    this.tableElement = document.createElement('div');
    this.columnConfigurationSetting.hiddenFunctionColumn = true;
    this.columnConfigurationSetting.hiddenCheckbox = true;
    this.columnConfigurationSetting.hiddenFilterRow = true;
    this.columnConfigurationSetting.hiddenReOrder = false;
    this.columnConfigurationSetting.paginator = false;
    this.columnConfigurationSetting.entityKey = 'field';
    this.columnConfigurationSetting.selectionMode = 'single';
    effect(() => {
      this.processColumns();
      this.processDataSource();
    });
  }

  ngOnInit(): void {
    this.columnConfigurationSchema[1].cellTemplate =
      this.inlineTemplateCheckbox;
    this.languageService.changed$.subscribe(() => {
      this.localizePlaceholder();
    });
  }

  ngAfterViewChecked(): void {
    console.log('ae-list view checked');
  }

  private getRawCol(cols: IFormField[], indexes: number[]) {
    let col = cols[indexes[0]];
    for (let i = 1; i < indexes.length; i++) {
      col = (<Container>col).fields[indexes[i]];
    }
    return col;
  }

  localizePlaceholder() {
    const cols = this.processedColumns();
    if (cols.length == 0) return;
    const searchLabel = this.translateService.instant('search');
    const rawCols = this.columns();
    const length = cols.length;
    let needLocalize = false;
    for (let i = 0; i < length; i++) {
      const col = this.getRawCol(rawCols, cols[i].rawIndex);
      if (col.includeInList && col.allowFilter && !col.searchPlaceholder) {
        needLocalize = true;
      }
    }
    if (needLocalize) {
      for (let i = 0; i < length; i++) {
        const col = cols[i],
          rawCol = this.getRawCol(rawCols, col.rawIndex);
        if (rawCol.allowFilter) {
          if (!rawCol.searchPlaceholder) {
            const newCol = col.clone();
            cols[i] = newCol;
            newCol.searchPlaceholder =
              newCol.placeholder = `${searchLabel} ${col.label}`;
          }
        }
      }
      this.processedColumns.set(cols);
    }
  }

  processDataSource() {
    console.log('processDataSource');
    const rawData = this.listData().data;
    const itemCount = rawData.length;
    if (this.columnsHasPipe.length) {
      const pipeLength = this.columnsHasPipe.length;
      const cachePipeParams = [];
      for (let p = 0; p < pipeLength; p++) {
        const pipe = this.columnsHasPipe[p];
        const params = [];
        if (pipe.field.pipeParams) {
          params.push(...pipe.field.pipeParams);
        }
        params.push(this.languageService.currentLocale);
        cachePipeParams.push(params);
      }

      for (let i = 0; i < itemCount; i++) {
        const rowData = rawData[i];
        for (let p = 0; p < pipeLength; p++) {
          const pipe = this.columnsHasPipe[p];
          setValueByPath(
            rowData,
            pipe.field.displayField,
            pipe.pipe.transform(
              getValueByPath(rowData, <string>pipe.field.fieldPath),
              ...cachePipeParams[p]
            )
          );
        }
      }
    }
    const syncColCount = this.syncDataSourceCols.length;
    if (syncColCount > 0) {
      for (let i = 0; i < itemCount; i++) {
        const rowData = rawData[i];
        for (let c = 0; c < syncColCount; c++) {
          const col = this.syncDataSourceCols[c];
          const opt = col.options.find((q) => q.id == rowData[col.field]);
          if (opt) {
            setValueByPath(
              rowData,
              col.displayField,
              col.funcGetLabel
                ? col.funcGetLabel(opt)
                : (<ObjectType>opt)[col.optionLabel]
            );
          }
        }
      }
    }
    if (this.dataSourceChain.fields.length > 0) {
      this.processDataSourceChain(this.dataSourceChain, rawData);
    }
    this.filteredDataSource.set([...rawData]);
  }

  processDataSourceChain(chain: DataSourceChain, dataSource: ObjectType[]) {
    const length = dataSource.length;
    for (let i = 0; i < length; i++) {
      const rowData = dataSource[i];
    }
  }

  processColumns() {
    const cols = this.columns();
    const newCols = this.flatColumns(cols);
    this.columnFlateds.set([...newCols.map((q) => q.clone())]);
    const length = newCols.length;
    const settingsPath = this.settingsVal.getSettingsPath();
    const customSettings: ColumnSetting[] = this.deserializeColumnSettings(
      this.storageService.read(settingsPath)
    );
    if (customSettings.length != length) customSettings.length = 0;
    const searchLabel = this.translateService.instant('search');

    const filters = [];
    const asyncDataSourceCols = [];
    for (let i = 0; i < length; i++) {
      const col = newCols[i];
      const userSetting = customSettings.find((q) => q.field == col.fieldPath);
      const visible = !userSetting ? !col.hiddenInList : userSetting.visible;
      col.hiddenInList = !visible;
      if (visible) {
        if (col.field != col.fieldPath) {
          col.displayField = <string>col.fieldPath;
        }
        const customSetting = (col.customSetting = new RunTimeSetting());
        const classes = [];
        switch (col.dataType) {
          case DataType.boolean:
          case DataType.date:
          case DataType.datetime:
            classes.push('text-center');
            break;
          case DataType.decimal:
          case DataType.int:
            classes.push('text-right');
            break;
        }
        if (classes.length > 0) {
          if (col.bodyClass) classes.push(col.bodyClass);
          col.bodyClass = classes.join(' ');
          classes.pop();
          if (col.headerClass) classes.push(col.headerClass);
          col.headerClass = classes.join(' ');
        }

        if (col.allowFilter) {
          if (!col.searchPlaceholder) {
            col.searchPlaceholder =
              col.placeholder = `${searchLabel} ${col.label}`;
          }
          switch (col.controlType) {
            case ControlType.combobox:
              customSetting.templateFilter = this.templateFilterDropdown;
              filters.push(
                Filter.buildFilter(<string>col.fieldPath, FilterOperator.in)
              );
              break;
            case ControlType.number:
              customSetting.templateFilter = this.templateFilterNumber;
              customSetting.removeFilterValue = (dicValue, col) => {
                dicValue[`${col.field}_from`] = dicValue[`${col.field}_to`] =
                  null;
                return [`${col.field}_from`, `${col.field}_to`];
              };
              filters.push(
                Filter.buildFilter(
                  `${col.fieldPath}_from`,
                  FilterOperator.greaterOrEqual
                )
              );
              filters.push(
                Filter.buildFilter(
                  `${col.fieldPath}_to`,
                  FilterOperator.lowerOrEqual
                )
              );
              break;
            case ControlType.checkbox:
              customSetting.templateFilter = this.templateFilterCheckbox;
              customSetting.needIconFilter = false;
              filters.push(
                Filter.buildFilter(<string>col.fieldPath, FilterOperator.isTrue)
              );
              break;
            default:
              customSetting.templateFilter = this.templateFilterText;
              filters.push(
                Filter.buildFilter(
                  <string>col.fieldPath,
                  FilterOperator.contains
                )
              );
              break;
          }
        }

        if (col.pipe) {
          const lastIndex = col.displayField.lastIndexOf('.');
          if (lastIndex == -1) col.displayField = `pipe_${col.field}`;
          else
            col.displayField = `${col.displayField.substring(
              0,
              lastIndex
            )}.pipe_${col.field}`;
          this.columnsHasPipe.push({
            field: col,
            pipe: col.pipe,
          });
        }

        switch (col.controlType) {
          case ControlType.combobox:
          case ControlType.radio: {
            const dataSourceCol = <DataSource>col;
            const lastIndex = col.displayField.lastIndexOf('.');
            if (lastIndex == -1)
              dataSourceCol.displayField = `str_${col.field}`;
            else
              dataSourceCol.displayField = `${col.displayField.substring(
                0,
                lastIndex
              )}.pipe_${col.field}`;
            if (dataSourceCol.baseService) {
              const length = dataSourceCol.parrentFields.length;
              if (length == 0) {
                this.dataSourceChain.fields.push(dataSourceCol);
                this.dataSourceChain.set.add(dataSourceCol.field);
              } else {
                asyncDataSourceCols.push(dataSourceCol);
              }
            } else {
              this.syncDataSourceCols.push(dataSourceCol);
            }
            break;
          }
          case ControlType.checkbox: {
            if (!col.cellTemplate) col.cellTemplate = this.cellTemplateCheckbox;
            customSetting.noPadding = true;
            customSetting.center = true;
            break;
          }
          case ControlType.date: {
            if (!col.cellTemplate) col.cellTemplate = this.cellTemplateDate;
            customSetting.noPadding = true;
            customSetting.center = true;
            break;
          }
          case ControlType.datetime: {
            if (!col.cellTemplate) col.cellTemplate = this.cellTemplateDatetime;
            customSetting.noPadding = true;
            customSetting.center = true;
            break;
          }
        }
      }
    }

    // Re-order columns
    if (customSettings.length > 1) {
      let userSetting = customSettings[length - 1];
      let colIndex = newCols.findIndex((q) => q.fieldPath == userSetting.field);
      newCols.push(newCols.splice(colIndex, 1)[0]);
      for (let i = length - 2; i >= 0; i--) {
        userSetting = customSettings[i];
        colIndex = newCols.findIndex((q) => q.fieldPath == userSetting.field);
        const col = newCols.splice(colIndex, 1)[0];
        colIndex = newCols.findIndex(
          (q) => q.fieldPath == customSettings[i + 1].field
        );
        newCols.splice(colIndex, 0, col);
      }
    }
    const asyncColCount = asyncDataSourceCols.length;
    if (asyncColCount > 0) {
      this.buildChain(this.dataSourceChain, asyncDataSourceCols);
    }
    this.templateFilters = filters;
    this.processedColumns.set(newCols);
  }

  flatColumns(
    cols: IFormField[],
    parentIndex?: number[],
    parentField?: string
  ): FormFieldBase[] {
    const newCols = [];
    const length = cols.length;
    for (let i = 0; i < length; i++) {
      const rawCol = <FormFieldBase>(<any>cols[i]);
      if (!rawCol.includeInList) continue;
      const col = rawCol.clone();
      col.rawIndex = parentIndex ? [...parentIndex, i] : [i];
      col.fieldPath =
        parentField === undefined ? col.field : `${parentField}.${col.field}`;
      switch (col.controlType) {
        case ControlType.table:
          continue;
        case ControlType.container:
          {
            const container: Container = <Container>col;
            const cs = this.flatColumns(
              container.fields,
              rawCol.rawIndex,
              col.fieldPath
            );
            newCols.push(...cs);
          }
          continue;
      }
      newCols.push(col);
    }
    return newCols;
  }

  buildChain(currentLevel: DataSourceChain, asyncDataSourceCols: DataSource[]) {
    let length = asyncDataSourceCols.length;
    if (length == 0) return;
    const currentLevelSet = new Set<string>();
    let added = false;
    for (let i = 0; i < length; i++) {
      const col = asyncDataSourceCols[i];
      const parentLength = col.parrentFields.length;
      let missingParent = false;
      for (let p = 0; p < parentLength; p++) {
        const parentField = col.parrentFields[p];
        console.log(`parentfield: ${parentField.field}`);
        if (!currentLevel.root.set.has(parentField.field)) {
          console.log('không có');
          missingParent = true;
          break;
        }
      }
      if (!missingParent) {
        added = true;
        currentLevel.fields.push(col);
        currentLevelSet.add(col.field);
        asyncDataSourceCols.splice(i, 1);
        i--;
        length--;
      }
    }
    if (added) {
      currentLevel.root.set = new Set([
        ...currentLevel.root.set,
        ...currentLevelSet,
      ]);
      const nextLevel = new DataSourceChain();
      currentLevel.next = nextLevel;
      this.buildChain(nextLevel, asyncDataSourceCols);
      if (nextLevel.fields.length == 0) {
        currentLevel.next = undefined;
      }
    }
  }

  handleRowSelect(evt: TableRowSelectEvent<ObjectType>) {
    this.check(evt.index, true);
    this.emitEvent('select-row', evt.data);
  }

  handleRowUnselect(evt: TableRowUnSelectEvent<ObjectType>) {
    this.check(evt.index, false);
  }

  check(index: number | undefined, checked: boolean) {
    if (!index) return;
    const dataSourceVal = this.listData().data;
    this.dicChecked[dataSourceVal[index][this.settingsVal.entityKey]] = checked;
    this.checkedCount += checked ? 1 : -1;
    this.checkedAll = this.checkedCount == dataSourceVal.length;
  }

  handleKeydownEnter(evt: KeyboardEvent, field: string) {
    if (evt.key == 'Enter') {
      this.handleSearch(field);
    }
  }

  handleFocusSearchDropDown(col: Dropdown, element: AeDropdownComponent) {
    this.handleFocusSearch(
      col.multipleSearch
        ? element.multiDropdown?.el?.nativeElement
        : element.dropdown?.el?.nativeElement,
      <string>col.fieldPath
    );
  }

  handleBlurSearchDropDown(col: Dropdown, element: AeDropdownComponent) {
    this.handleBlurSearch(
      col.multipleSearch
        ? element.multiDropdown?.el?.nativeElement
        : element.dropdown?.el?.nativeElement,
      <string>col.fieldPath,
      false
    );
  }

  handleSearchDropdown(col: Dropdown) {
    if (col.multipleSearch) return;
    this.correctSearchValueAndSearch(<string>col.fieldPath);
  }

  handleClickOutside: () => void = emptyHandle;
  handleFocusSearch(target: HTMLElement, field: string) {
    if (!target) return;
    this.#previousSearchValue = this.dicSearchValue[field];
    const parentNode = <HTMLElement>target.closest('.filter-container');
    const className = 'expanded-filter-box';
    if (parentNode.classList.contains(className)) return;
    const different = parentNode.offsetWidth - 250;
    if (different < 0) {
      const rect = parentNode.getBoundingClientRect();
      let left = rect.left;
      const right = rect.right - different;
      const tableBound = this.tableElement.getBoundingClientRect();
      const overRight = right - tableBound.right;
      if (overRight > 0) {
        left -= overRight;
      }
      parentNode.style.setProperty('--left', `${left}px`);
      parentNode.style.setProperty('--top', `${rect.top}px`);
      parentNode.classList.add(className);

      this.handleClickOutside = addClickOutside(parentNode, () => {
        const activeElement = document.activeElement;
        if (activeElement == target || target.contains(activeElement)) return;
        parentNode.classList.remove(className);
      });
    } else {
      parentNode.classList.remove(className);
    }
  }

  handleBlurSearch(
    target: HTMLElement,
    field: string,
    search = false,
    isStart: boolean | undefined = undefined
  ) {
    if (!target) return;
    if (isStart !== undefined) {
      field += isStart ? '_from' : '_to';
    }
    if (search) {
      this.correctSearchValueAndSearch(field);
    }
  }

  correctSearchValueAndSearch(field: string) {
    const currentSearchValue = this.dicSearchValue[field];
    if (
      currentSearchValue === null ||
      currentSearchValue === '' ||
      (Array.isArray(currentSearchValue) && currentSearchValue.length == 0)
    ) {
      this.dicSearchValue[field] = undefined;
    }
    if (this.#previousSearchValue !== currentSearchValue) {
      this.handleSearch(field);
      this.#previousSearchValue = currentSearchValue;
    }
  }

  handleBlurButtonFilter() {
    if (this.handleClickOutside != emptyHandle) {
      this.handleClickOutside();
      this.handleClickOutside = emptyHandle;
    }
  }

  handleTriCheckboxChange(col: FormFieldBase) {
    // const value = this.dicSearchValue[col.field];
    // if (value == null) {
    //   this.dicSearchValue[col.field] = true;
    // } else if (value === true) {
    //   this.dicSearchValue[col.field] = false;
    // } else {
    //   this.dicSearchValue[col.field] = undefined;
    // }
    if (this.dicSearchValue[col.field] === null)
      this.dicSearchValue[col.field] = undefined;
    this.handleSearch(col.field);
  }

  handleSearch(field: string) {
    const result: Filter[] = [];
    Filter.applyValue(
      this.templateFilters,
      new Set([field]),
      this.dicSearchValue,
      result
    );
    this.searchFilters = result;
    this.triggerSearch();
  }

  removeAllFilter = (col: FormFieldBase, button: Button) => {
    if (this.hasFilter) {
      this.dicSearchValue = {};
      Filter.removeValue(this.templateFilters);
      this.searchFilters = [];
      this.triggerSearch();
    } else {
      const firstFilterControl = button.el.nativeElement
        .closest('tr')
        .querySelector('.filter-container input[pinputtext]');
      if (firstFilterControl) {
        firstFilterControl.focus();
      }
    }
  };

  toggleFilter = (col: FormFieldBase, button: Button) => {
    switch (col.controlType) {
      case ControlType.number:
      case ControlType.numberRange: {
        if (
          this.dicSearchValue[col.field + this.fromPrefix] ||
          this.dicSearchValue[col.field + this.toPrefix]
        ) {
          this.removeFilter(col);
          return;
        }
        const container = <HTMLElement>(
          button.el.nativeElement.closest('.filter-container')
        );
        container.querySelector('input')?.focus();
        break;
      }
      case ControlType.textbox:
      case ControlType.textarea: {
        if (this.dicSearchValue[col.field]) {
          this.removeFilter(col);
          return;
        }
        const container = <HTMLElement>(
          button.el.nativeElement.closest('.filter-container')
        );
        container.querySelector('input')?.focus();
        break;
      }
      case ControlType.combobox: {
        if (this.dicSearchValue[col.field]) {
          this.removeFilter(col);
          return;
        }
        const container = <HTMLElement>(
          button.el.nativeElement.closest('.filter-container')
        );
        (<any>container.querySelector('.p-multiselect-dropdown'))?.click();
        break;
      }
    }
  };

  removeFilter = (col: FormFieldBase) => {
    const fields = (<RunTimeSetting>col.customSetting).removeFilterValue(
      this.dicSearchValue,
      col
    );
    const result: Filter[] = [];
    Filter.applyValue(
      this.templateFilters,
      new Set(fields),
      this.dicSearchValue,
      result
    );
    this.searchFilters = [];
    this.triggerSearch();
  };

  triggerSearch() {
    this.handleReload();
  }

  clientSearch() {
    const dataSource = this.listData().data;
    if (this.searchFilters && this.searchFilters.length > 0) {
      const length = dataSource.length;
      const result = [];
      for (let i = 0; i < length; i++) {
        const element = dataSource[i];
        if (this.match(this.searchFilters, element)) {
          result.push(element);
        }
      }
      this.filteredDataSource.set(result);
    } else {
      this.filteredDataSource.set([...dataSource]);
    }
    if (this.#previousSort) {
      this.#clientSearch = true;
    }
  }

  match(
    filters: Filter[],
    item: ObjectType,
    logic: 'and' | 'or' = 'and'
  ): boolean {
    const length = filters.length;
    let hasFalse = false;
    for (let i = 0; i < length; i++) {
      const filter = filters[i];
      if (filter.logic) {
        if (filter.filters) {
          if (this.match(filter.filters, item, filter.logic)) {
            if (logic == 'or') return true;
          } else {
            if (logic == 'and') return false;
            hasFalse = true;
          }
        }
      } else {
        if (filter.field) {
          let isMatch = false;
          const value = <string>filter.value;
          switch (filter.operator) {
            case FilterOperator.endsWith: {
              const itemValue = getValueByPath(item, filter.field);
              if (itemValue)
                isMatch =
                  itemValue
                    .toString()
                    .toLowerCase()
                    .endsWith(JSON.parse(value.toLowerCase())) > -1;
              break;
            }
            case FilterOperator.greaterOrEqual: {
              const sourceField = filter.field.slice(
                0,
                -this.fromPrefix.length
              );
              isMatch = getValueByPath(item, sourceField) >= JSON.parse(value);
              break;
            }
            case FilterOperator.lowerOrEqual: {
              const sourceField = filter.field.slice(0, -this.toPrefix.length);
              isMatch = getValueByPath(item, sourceField) <= JSON.parse(value);
              break;
            }
            case FilterOperator.in: {
              const arrValue = JSON.parse(value);
              isMatch =
                arrValue.indexOf(getValueByPath(item, filter.field)) > -1;
              break;
            }
            case FilterOperator.equal: {
              const boolValue = JSON.parse(value);
              isMatch = boolValue === getValueByPath(item, filter.field);
              break;
            }
            case FilterOperator.isTrue: {
              isMatch = true === getValueByPath(item, filter.field);
              break;
            }
            case FilterOperator.isFalse: {
              isMatch = false === getValueByPath(item, filter.field);
              break;
            }
            default: {
              const itemValue = getValueByPath(item, filter.field);
              if (itemValue)
                isMatch =
                  itemValue
                    .toString()
                    .toLowerCase()
                    .indexOf(JSON.parse(value.toLowerCase())) > -1;
              break;
            }
          }

          if (isMatch) {
            if (logic == 'or') return true;
          } else {
            if (logic == 'and') return false;
            hasFalse = true;
          }
        }
      }
    }
    return !hasFalse;
  }

  customSort(e: SortEvent) {
    if (!this.#clientSearch) {
      const multiSort = e.multiSortMeta;
      if (multiSort) {
        if (this.#previousSort) {
          const length = multiSort.length;
          const previousMultiSort = this.#previousSort.multiSortMeta;
          if (previousMultiSort && length == previousMultiSort.length) {
            let count = 0;
            for (let i = 0; i < length; i++) {
              if (multiSort[i].field == previousMultiSort[i].field) {
                if (multiSort[i].order != previousMultiSort[i].order) {
                  if (multiSort[i].order == 1) {
                    multiSort.splice(i, 1);
                  }
                  break;
                }
                count++;
              }
            }
            if (count == length) {
              // Sorts isn't changed.
              return;
            }
            if (multiSort.length == 0) {
              this.resetSort();
            }
          }
        }
      } else {
        if (this.#previousSort) {
          if (this.#previousSort.field == e.field) {
            if (e.order == this.#previousSort.order) {
              // Sorts isn't changed.
              return;
            }
            if (e.order == 1) {
              this.resetSort();
              return;
            }
          }
        }
      }
      this.triggerSort(e);
      this.#previousSort = {
        multiSortMeta: e.multiSortMeta?.map((q) => <SortMeta>{ ...q }),
        field: e.field,
        order: e.order,
      };
    } else {
      this.#clientSearch = false;
      this.triggerSort(e);
    }
  }

  resetSort() {
    this.table.reset();
    this.filteredDataSource.set([...this.filteredDataSource()]);
    this.#previousSort = undefined;
  }

  triggerSort(e: SortEvent) {
    const listEvent = this.getReloadEventData();
    if (this.offline()) {
      this.clientSort(e.data, listEvent.data.sorts);
      return;
    }
    this.execute.emit(new ListEventData('sort', listEvent));
  }

  clientSort(data: any[] | undefined, sortParams?: Sort[]) {
    if (data && sortParams) {
      if (data.length <= 1) return;
      data.sort(ArrayUtils.sort(sortParams));
    }
  }

  showColumnConfiguration() {
    const settingsPath = this.settingsVal.getSettingsPath();
    const customSettings: ColumnSetting[] = this.deserializeColumnSettings(
      this.storageService.read(settingsPath)
    );
    const dataSource: ColumnSetting[] = [];
    const cols = this.processedColumns();
    const colCount = cols.length;
    if (customSettings.length != colCount) customSettings.length = 0;
    for (let i = 0; i < colCount; i++) {
      const col = <FormFieldBase>cols[i];
      if (col.includeInList) {
        const customSetting = customSettings.find((q) => q.field == col.field);
        const row = {
          field: <string>col.fieldPath,
          label: col.label
            ? col.useLocalization
              ? this.translateService.instant(col.label)
              : col.label
            : '',
          visible: !col.hiddenInList,
        };
        if (customSetting) {
          row.visible = customSetting.visible;
        }
        dataSource.push(row);
      }
    }
    this.columnConfigurationDataSource.data = dataSource;
    this.columnConfigurationDataSource.total = dataSource.length;
    this.visibleDialog = DialogType.ColumnSetting;
  }

  handleResetColumnSetting() {
    const dataSource: ColumnSetting[] = [];
    const cols = this.columnFlateds();
    const colCount = cols.length;
    for (let i = 0; i < colCount; i++) {
      const col = <FormFieldBase>cols[i];
      const row = {
        field: <string>col.fieldPath,
        label: col.label
          ? col.useLocalization
            ? this.translateService.instant(col.label)
            : col.label
          : '',
        visible: !col.hiddenInList,
      };
      dataSource.push(row);
    }
    this.columnConfigurationDataSource.data = dataSource;
    this.columnConfigurationDataSource.total = dataSource.length;
  }

  handleSaveColumnSettings() {
    this.visibleDialog = DialogType.None;
    const jsData = this.serializeColumnSettings(
      this.columnConfigurationDataSource.data
    );
    this.storageService.write(this.settingsVal.getSettingsPath(), jsData);
    this.processColumns();
    this.processDataSource();
  }

  private deserializeColumnSettings(
    jsonSettings: string | null
  ): ColumnSetting[] {
    if (jsonSettings == null) return [];
    try {
      const result: ColumnSetting[] = [];
      const arrData = JSON.parse(jsonSettings);
      if (!isArray(arrData)) return result;
      const length = arrData.length;
      if (length == 0) return result;
      for (let i = 0; i < length; i += 2) {
        result.push({
          field: arrData[i],
          label: '',
          visible: arrData[i + 1],
        });
      }
      return result;
    } catch (ex) {
      return [];
    }
  }

  private serializeColumnSettings(settings: ColumnSetting[]): string {
    const data = [];
    const length = settings.length;
    for (let i = 0; i < length; i++) {
      const setting = settings[i];
      data.push(setting.field, setting.visible);
    }
    return JSON.stringify(data);
  }

  handleDialogVisible(visible: boolean) {
    if (!visible) this.visibleDialog = DialogType.None;
  }

  handleReady() {
    this.tableElement = <HTMLElement>(
      (<HTMLElement>this.table.el.nativeElement).querySelector('table')
    );
  }

  handleReload() {
    if (this.offline()) {
      this.clientSearch();
      return;
    }
    const listEvent = this.getReloadEventData();
    this.execute.emit(new ListEventData('reload', listEvent));
  }

  getReloadEventData() {
    const gridInfo = new GridInfo();
    gridInfo.filters = this.searchFilters;
    const sorts: Sort[] = [];
    const table = this.table;
    if (table.multiSortMeta) {
      if (table.multiSortMeta.length > 0) {
        const offline = this.offline();
        table.multiSortMeta.forEach((s) => {
          sorts.push({
            field: s.field,
            dir: s.order,
            keyIsPath: offline ? undefined : s.field.indexOf('.') > -1,
          });
        });
      }
    } else {
      if (table.sortField) {
        sorts.push({
          field: table.sortField,
          dir: table.sortOrder,
          keyIsPath: this.offline()
            ? undefined
            : table.sortField.indexOf('.') > -1,
        });
      }
    }
    gridInfo.sorts = sorts;
    const paginator = this.paginator;
    gridInfo.pageSize = paginator.rows;
    gridInfo.page = paginator.first
      ? paginator.first / gridInfo.pageSize + 1
      : 1;
    return new ListEvent(gridInfo);
  }

  emitEvent(eventName: ListEventType, data?: any) {
    this.execute.emit(new ListEventData(eventName, data));
  }
}

enum DialogType {
  None = 0,
  ColumnSetting,
}

type ListEventType =
  | 'reload'
  | 'sort'
  | 'add'
  | 'edit'
  | 'delete'
  | 'deletes'
  | 'import'
  | 'select-row';

class ColumnSetting {
  field: string;
  label?: string;
  visible: boolean;
  constructor(field: string, visible: boolean) {
    this.field = field;
    this.visible = visible;
  }
}

export class ListEventData {
  eventName: ListEventType;
  data?: ListEvent | ObjectType;
  handled = false;
  constructor(eventName: ListEventType, data?: any) {
    this.eventName = eventName;
    this.data = data;
  }
}

class ColumnHasPipe {
  field: FormFieldBase;
  pipe: PipeTransform;
  constructor(field: FormFieldBase, pipe: PipeTransform) {
    this.field = field;
    this.pipe = pipe;
  }
}

export class ListEvent {
  data: GridInfo;
  handled = false;
  constructor(data: GridInfo) {
    this.data = data;
  }
}

export class RunTimeSetting {
  sourceSchema?: IFormField;
  templateFilter: TemplateRef<any> | null = null;
  needIconFilter = true;
  noPadding = false;
  center = false;
  removeFilterValue: (dicValue: ObjectType, col: FormFieldBase) => string[] = (
    dicValue,
    col
  ) => {
    dicValue[col.field] = null;
    return [col.field];
  };
  cellTemplate: TemplateRef<any> | null = null;
  showFormLabel = true;
}

export class DataSourceChain {
  fields: DataSource[] = [];
  set: Set<string> = new Set();
  #next?: DataSourceChain;
  get next(): DataSourceChain | undefined {
    return this.#next;
  }
  set next(value: DataSourceChain | undefined) {
    if (value) {
      this.#next = value;
      value.root = this.root;
    } else {
      this.#next = undefined;
    }
  }
  root: DataSourceChain;
  constructor() {
    this.root = this;
  }
}
