import { DecimalPipe, PercentPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AeCrudComponent, AeCrud, createCheckbox, createContainer, createDropdown, createNumberBox, createTextBox, CrudListSetting, DataType, ListSetting, createDatePicker, GridInfo, Filter, FilterOperator, ObjectType } from '@super-app/shared';
import { map } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
  ],
  selector: 'app-document-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss'],
  providers: [DecimalPipe]
})
export class DocumentFormComponent implements OnInit {
  @Input() settings?: CrudListSetting;

  constructor() {
  }

  ngOnInit(): void {
    
  }
}
