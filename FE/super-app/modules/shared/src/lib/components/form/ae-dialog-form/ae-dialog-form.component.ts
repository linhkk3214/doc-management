import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBase } from '../../../classes/form-base';
import { AeScrollbarComponent } from '../../controls/ae-scrollbar/ae-scrollbar.component';
import { AeFormComponent } from '../ae-form/ae-form.component';

@Component({
  selector: 'ae-dialog-form',
  imports: [AeFormComponent, DialogModule, ButtonModule, AeScrollbarComponent],
  templateUrl: './ae-dialog-form.component.html',
  styleUrls: ['./ae-dialog-form.component.scss'],
  standalone: true
})
export class AeDialogFormComponent extends FormBase {

}
