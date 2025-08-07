import { Directive, OnInit, ViewChild } from '@angular/core';
import { AeCrudComponent } from '../components/crud/ae-crud/ae-crud.component';
import { ListEventData } from '../components/crud/ae-list/ae-list.component';
import { CrudListSetting } from './model/form-model';

@Directive()
export abstract class AeCrud implements OnInit {
  @ViewChild(AeCrudComponent, { static: true }) aeCrud!: AeCrudComponent;
  settings: CrudListSetting;
  overrideSettings: IAeMethod;
  showEditForm = false;

  constructor(settings: CrudListSetting, overrideSettings: IAeMethod) {
    this.settings = settings;
    this.overrideSettings = overrideSettings;
  }

  ngOnInit() {
    this.aeCrud.settings = this.settings;
    if (this.settings.baseService) {
      this.settings.paginator = false;
    } else {
      if (this.settings.dataSource)
        this.aeCrud.dataSource = this.settings.dataSource;
    }
  }

  handleListEvent(eventData: ListEventData) {
    if (
      this.overrideSettings.handleListEvent &&
      this.overrideSettings.handleListEvent(eventData)
    )
      return;
    switch (eventData.eventName) {
      case 'reload':
        break;
      case 'edit':
        this.showEditForm = true;
        break;
      case 'delete':
        break;
    }
  }

  handleFormEvent() {}

  reload() {
    this.aeCrud.loadData();
  }
}

export interface IAeMethod {
  handleListEvent?: (eventData: ListEventData) => boolean;
}
