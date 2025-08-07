import { AfterViewInit, ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'check-rendered',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './check-rendered.component.html',
  styleUrl: './check-rendered.component.css'
})
export class CheckRenderedComponent implements AfterViewInit {
  rendered = output();
  ngAfterViewInit(): void {
    this.rendered.emit();
  }
}
