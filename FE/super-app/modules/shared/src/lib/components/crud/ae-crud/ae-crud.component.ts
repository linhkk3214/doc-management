import { CommonModule, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  effect,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
  Type,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBase } from '../../../classes/form-base';
import { ObjectType } from '../../../classes/model/common';
import { GridInfo } from '../../../classes/model/crud';
import { CrudListSetting } from '../../../classes/model/form-model';
import { BaseService } from '../../../services/base.service';
import { deepClone } from '../../../util/object';
import { AeScrollbarComponent } from '../../controls/ae-scrollbar/ae-scrollbar.component';
import { AeFormComponent } from '../../form/ae-form/ae-form.component';
import {
  AeListComponent,
  ListEvent,
  ListEventData,
} from '../ae-list/ae-list.component';
import { ListData } from '../../../interfaces/i-list-base';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    AeScrollbarComponent,
    AeListComponent,
    AeFormComponent,
  ],
  selector: 'ae-crud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ae-crud.component.html',
  styleUrls: ['./ae-crud.component.scss'],
  providers: [DecimalPipe],
})
export class AeCrudComponent implements OnInit {
  // Using signals for inputs
  formComponent = input<Type<FormBase>>();
  settings = input<CrudListSetting>();
  dataSource = input<ObjectType[]>();
  
  // Internal signals
  dataSourceSignal = signal<ListData<ObjectType>>(new ListData([], 0));
  loading = signal<boolean>(false);
  showForm = signal<boolean>(false);
  selectedRowItem = signal<ObjectType | undefined>({});
  
  #cachedFields = '';

  @ContentChild('buttonTop', { static: true }) buttonTopTemplate?: TemplateRef<any>;

  // Using output signals
  import = output<any>();
  edit = output<any>();
  formChanged = output<{field: string, value: any, schema: any}>();

  constructor() {
    // Effect to handle settings changes
    effect(() => {
      const settings = this.settings();
      if (settings) {
        if (!settings.title) settings.title = `Danh sách ${settings.objectName}`;
        this.cacheFields(settings);
      }
    });
    
    // Effect to handle dataSource changes
    effect(() => {
      const dataSource = this.dataSource();
      if (dataSource) {
        this.dataSourceSignal.set(new ListData<ObjectType>(dataSource, dataSource.length));
      }
    });
  }

  ngOnInit(): void {
    const settings = this.settings();
    if (settings?.baseService) {
      this.loadData();
    }
  }

  loadData() {
    const settings = this.settings();
    if (!settings) return;
    
    const gridInfo = new GridInfo();
    gridInfo.page = 1;
    gridInfo.pageSize = settings.pageSetting.pageSize;
    this._getData(gridInfo);
  }

  private _getData(gridInfo: GridInfo) {
    const settings = this.settings();
    if (!settings) return;
    
    this.loading.set(true);
    const service = <BaseService>settings.baseService;
    gridInfo.fields = this.#cachedFields;
    if (settings.modifyGridInfo) settings.modifyGridInfo(gridInfo);
    service.getData(gridInfo).subscribe((res) => {
      const listData = new ListData(res.data ?? [], res.total);
      settings.afterGetData(listData).subscribe(() => {
        this.dataSourceSignal.set(listData);
        this.loading.set(false);
      });
    });
  }

  cacheFields(settings: CrudListSetting) {
    const fields = this._getCustomFields(settings.fields);
    const length = settings.schemas.length;
    for (let i = 0; i < length; i++) {
      const schema = settings.schemas[i];
      if (!schema.includeInList) continue;
      fields.push(schema.field);
    }
    if (!fields.includes('id')) fields.unshift('id');
    this.#cachedFields = fields.join(',');
  }

  private _getCustomFields(fields?: string) {
    if (!fields) return [];
    const result = fields.split(',');
    let length = result.length;
    for (let i = 0; i < length; i++) {
      result[i] = result[i].trim();
      if (!result[i]) {
        result.splice(i, 1);
        i--;
        length--;
      }
    }
    return result;
  }

  handleListEvent(eventData: ListEventData) {
    const settings = this.settings();
    
    switch (eventData.eventName) {
      case 'reload':
      case 'sort':
        if (settings?.baseService) {
          const listEvent = eventData.data as ListEvent;
          listEvent.handled = true;
          this._getData(listEvent.data);
        }
        break;
      case 'add':
        this.selectedRowItem.set(undefined);
        this.showForm.set(true);
        break;
      case 'edit':
        if (settings?.onEdit) {
          settings?.onEdit(eventData);
          return;
        }
        if (settings?.baseService) {
          this.selectedRowItem.set(<ObjectType>eventData.data);
        } else {
          this.selectedRowItem.set(<ObjectType>deepClone(eventData.data));
        }
        this.showForm.set(true);
        break;
      case 'delete':
        break;
      case 'import':
        this.import.emit(eventData);
        break;
    }
  }

  handleFormChanged(event: {field: string, value: any, schema: any}) {
    this.formChanged.emit(event);
  }
}
