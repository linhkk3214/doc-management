import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  EventEmitter,
  Input,
  input,
  model,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ObjectType } from '../../../classes/model/common';
import { Container, FormFieldBase } from '../../../classes/model/form-model';
import { ControlType } from '../../../enum/form';
import { IFormField } from '../../../interfaces/i-form-model';
import { AeDropdownComponent } from '../../controls/ae-dropdown/ae-dropdown.component';

@Component({
  selector: 'ae-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    CheckboxModule,
    AeDropdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ae-form.component.html',
  styleUrl: './ae-form.component.css',
})
export class AeFormComponent implements OnInit, AfterViewInit {
  @ViewChild('container', { static: true })
  templateContainer!: TemplateRef<any>;
  @ViewChild('textbox', { static: true }) templateTextbox!: TemplateRef<any>;
  @ViewChild('numericBox', { static: true })
  templateNumericBox!: TemplateRef<any>;
  @ViewChild('checkbox', { static: true }) templateCheckbox!: TemplateRef<any>;
  @ViewChild('baseControl', { static: true })
  templateBaseControl!: TemplateRef<any>;
  @ViewChild('combobox', { static: true }) templateCombobox!: TemplateRef<any>;
  @ViewChild('datetime', { static: true }) templateDatetime!: TemplateRef<any>;
  @Input() compactLayout = true;
  schemas = input<IFormField[]>();
  schemasValComputed = computed(() => {
    const schemasVal = this.schemas();
    if (schemasVal) {
      this.processSchema(schemasVal, undefined);
      return schemasVal;
    }
    return [];
  });
  _oldData: ObjectType | undefined;
  data = model<ObjectType | undefined>({});
  modelComputed = computed(() => {
    const model = this.data();
    if (!model) return {};
    return model;
  });
  get modelValue() {
    return this.modelComputed();
  }

  @Output() changed = new EventEmitter<any>();

  constructor() {
    effect(() => {
      this._oldData = this.data();
    });
  }

  ngOnInit(): void {
    console.log(3);
  }

  private processSchema(
    schemasVal: IFormField[],
    parentPath: string | undefined
  ) {
    const length = schemasVal.length;
    for (let i = 0; i < length; i++) {
      const schema = <FormFieldBase>(<any>schemasVal[i]);
      schema.fieldPath =
        parentPath === undefined
          ? schema.field
          : `${parentPath}.${schema.field}`;
      if (schema.hiddenInForm) continue;
      if (!schema.template) {
        schema.template = this.templateBaseControl;
        switch (schema.controlType) {
          case ControlType.textbox:
            schema.subTemplate = this.templateTextbox;
            break;
          case ControlType.number:
            schema.subTemplate = this.templateNumericBox;
            break;
          case ControlType.checkbox:
            schema.subTemplate = this.templateCheckbox;
            schema.customSetting.showFormLabel = false;
            break;
          case ControlType.combobox:
            schema.subTemplate = this.templateCombobox;
            break;
          case ControlType.date:
          case ControlType.datetime:
            schema.subTemplate = this.templateDatetime;
            break;
          case ControlType.container:
            schema.template = this.templateContainer;
            this.processSchema((<Container>schema).fields, schema.fieldPath);
            break;
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.focusFirstControl();
  }

  focusFirstControl() {
    const containers = document.querySelectorAll('.f-control-container');
    const length = containers.length;
    for (let i = 0; i < length; i++) {
      const container = containers[i];
      let firstControl: HTMLElement | null = container.querySelector(
        'input:not([type=file]):not([type=hidden])'
      );
      if (firstControl && !(<HTMLInputElement>firstControl).disabled) {
        firstControl.focus();
        return;
      }
      firstControl = container.querySelector('textarea');
      if (firstControl && !(<HTMLTextAreaElement>firstControl).disabled) {
        firstControl.focus();
        return;
      }
    }
  }

  handleBlur(e: any) {
    console.log(document.activeElement);
  }

  handleChanged(field: string) {
    if (this._oldData && this._oldData[field] != this.modelValue[field]) {
      //this._dirty = true;
    }
  }

  emitEvent(eventName: string, schema: IFormField) {
    this.changed.emit(schema);
  }
}
