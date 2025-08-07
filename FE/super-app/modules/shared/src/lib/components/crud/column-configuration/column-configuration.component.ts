import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ListSetting } from '../../../classes/model/form-model';

@Component({
  standalone: true,
  imports: [
  ],
  selector: 'column-configuration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './column-configuration.component.html',
  styleUrls: ['./column-configuration.component.scss']
})
export class ColumnConfigurationComponent {
  @Input() settings: ListSetting | undefined;
}