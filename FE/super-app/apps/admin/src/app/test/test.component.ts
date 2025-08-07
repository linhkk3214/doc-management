import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthComponent } from '@super-app/client-shared';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class TestComponent extends AuthComponent implements OnInit {

  ngOnInit() {
    console.log('te');
  }
}
