import { CommonModule, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
  @Input() formComponent!: Type<FormBase>;
  @Input() set settings(value: CrudListSetting) {
    if (value) {
      if (!value.title) value.title = `Danh sách ${value.objectName}`;
      this.cacheFields(value);
      this.settingsSignal.set(value);
    }
  }
  get settings() {
    return this.settingsSignal();
  }
  settingsSignal = signal<CrudListSetting>(new CrudListSetting());
  @Input() set dataSource(value: ObjectType[]) {
    if (value) {
      this.dataSourceSignal.set(new ListData<ObjectType>(value, value.length));
    }
  }
  dataSourceSignal = signal<ListData<ObjectType>>(new ListData([], 0));
  loading = signal<boolean>(false);
  showForm = false;
  #cachedFields = '';
  selectedRowItem: ObjectType | undefined = {};

  @ContentChild('buttonTop', { static: true }) buttonTopTemplate?: TemplateRef<any>;

  @Output() import = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();

  ngOnInit(): void {
    if (this.settingsSignal().baseService) {
      this.loadData();
    }
  }

  loadData() {
    const gridInfo = new GridInfo();
    gridInfo.page = 1;
    gridInfo.pageSize = this.settings.pageSetting.pageSize;
    this._getData(gridInfo);
  }

  private _getData(gridInfo: GridInfo) {
    this.loading.set(true);
    const service = <BaseService>this.settings.baseService;
    gridInfo.fields = this.#cachedFields;
    if (this.settings.modifyGridInfo) this.settings.modifyGridInfo(gridInfo);
    service.getData(gridInfo).subscribe((res) => {
      const listData = new ListData(res.data ?? [], res.total);
      this.settings.afterGetData(listData).subscribe(() => {
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
    switch (eventData.eventName) {
      case 'reload':
      case 'sort':
        if (this.settings?.baseService) {
          const listEvent = eventData.data as ListEvent;
          listEvent.handled = true;
          this._getData(listEvent.data);
        }
        break;
      case 'add':
        this.selectedRowItem = undefined;
        this.showForm = true;
        break;
      case 'edit':
        if (this.settings?.onEdit) {
          this.settings?.onEdit(eventData);
          return;
        }
        if (this.settings?.baseService) {
          this.selectedRowItem = <ObjectType>eventData.data;
        } else {
          this.selectedRowItem = <ObjectType>deepClone(eventData.data);
        }
        this.showForm = true;
        break;
      case 'delete':
        break;
      case 'import':
        this.import.emit();
        break;
    }
  }

  handleFormEvent() {}
}
