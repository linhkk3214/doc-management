import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, model, OnInit, output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { Select, SelectModule } from 'primeng/select';
import { createDropdown, Dropdown } from '../../../classes/model/form-model';

@Component({
  selector: 'ae-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, MultiSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ae-dropdown.component.html',
  styleUrl: './ae-dropdown.component.css'
})
export class AeDropdownComponent implements OnInit {
  @ViewChild('dropdown') dropdown?: Select;
  @ViewChild('multiDropdown') multiDropdown?: MultiSelect;
  multiple = input<boolean>(false);
  schema = input<Dropdown>(new Dropdown(createDropdown('id')));
  _value: any;
  value = model<any>();
  _previousValue: any;
  smartValueChange = output<any>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  focus = output();
  // eslint-disable-next-line @angular-eslint/no-output-native
  blur = output();
  // eslint-disable-next-line @angular-eslint/no-output-native
  show = output();
  // eslint-disable-next-line @angular-eslint/no-output-native
  hide = output();

  constructor() {
    effect(() => {
      this._value = this.value();
    });
  }

  ngOnInit(): void {
  }

  handleChanged() {
    this.value.set(this._value);
  }

  handlePanelShow() {
    this._previousValue = this._value;
    this.show.emit();
  }

  handlePanelHide() {
    if (this._previousValue != this._value) {
      this.smartValueChange.emit(this._previousValue);
    }
    this.hide.emit();
  }

  handleFocus() {
    this.focus.emit();
  }

  handleBlur() {
    this.blur.emit();
  }

  handleShow() {
    this.show.emit();
  }

  handleHide() {
    this.hide.emit();
  }
}
