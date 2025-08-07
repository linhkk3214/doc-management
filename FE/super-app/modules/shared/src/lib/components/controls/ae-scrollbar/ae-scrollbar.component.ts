import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, Output, ViewChild, computed, input, output } from '@angular/core';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import { NgScrollReached } from 'ngx-scrollbar/reached-event';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ae-scrollbar',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, NgScrollReached],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ae-scrollbar.component.html',
  styleUrl: './ae-scrollbar.component.css'
})
export class AeScrollbarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollbar') scrollbar?: NgScrollbar;
  scrolled = output();
  reachedTop = output();
  reachedBottom = output();

  height = input(0);
  styledHeight = computed(() => this.height() > 0 ? this.height() + 'px' : null);
  // Unsubscriber for elementScrolled stream.
  scrollSubscription? = Subscription.EMPTY;

  ngAfterViewInit(): void {
    const a = this.scrollbar;
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

  onReachedBottom() {
    console.log(1);
    this.reachedBottom.emit();
  }

  onReachedTop() {
    console.log(2);
    this.reachedTop.emit();
  }

  handleUpdated() {
    console.log(1);
  }
}
