import { Component, computed, input, model, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBase } from '../../../classes/form-base';
import { ObjectType } from '../../../classes/model/common';
import { ListSetting } from '../../../classes/model/form-model';
import { AeScrollbarComponent } from '../../controls/ae-scrollbar/ae-scrollbar.component';
import { AeFormComponent } from '../ae-form/ae-form.component';

@Component({
  selector: 'ae-dialog-form',
  imports: [AeFormComponent, DialogModule, ButtonModule, AeScrollbarComponent],
  templateUrl: './ae-dialog-form.component.html',
  styleUrls: ['./ae-dialog-form.component.scss'],
  standalone: true
})
export class AeDialogFormComponent {
  // Using signals for reactive state management
  settings = input<ListSetting | undefined>(undefined);
  settingsVal = computed(() => this.settings());
  
  visible = signal(true);
  data = model<ObjectType>({});
  
  // Events
  visibleChanged = output<boolean>();
  changed = output<{field: string, value: any, schema: any}>();
  
  handleVisibleChanged(show: boolean) {
    this.visible.set(show);
    this.visibleChanged.emit(show);
  }
  
  handleFormChanged(event: {field: string, value: any, schema: any}) {
    this.changed.emit(event);
  }
}
