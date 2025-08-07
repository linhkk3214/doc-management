import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, input } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

export declare class MenuItem {
  name: string;
  url: string;
  icon?: string
  title?: string;
  collapse?: boolean;
  items?: MenuItem[];
  active?: boolean;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-layout-menu',
  templateUrl: './layout-menu.component.html',
  styleUrls: ['./layout-menu.component.scss'],
  imports: [CommonModule],
  animations: [
    trigger('aniCollapse', [
      state('true', style({
        height: 0
      })),
      state('false', style({
        height: '*'
      })),
      transition('false <=> true',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      )
    ]),
  ]
})
export class LayoutMenuComponent {

  data = input<MenuItem[]>([]);
  get dataVal() {
    return computed(() => this.data())();
  }

  constructor(
    private _router: Router,
    private _cd: ChangeDetectorRef
  ) {
    this._router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        return;
      }
      if (e instanceof NavigationEnd) {
        this.onNavigated(e);
        return;
      }
    });
  }

  handleSelectMenu(e: Event, menu: MenuItem) {
    e.preventDefault();
    if (menu.items != null && !(e.target as HTMLElement).closest('.pi')) {
      this.toggleMenu(menu);
      return;
    }
    this._router.navigate([menu.url]);
  }

  toggleMenu(menu: MenuItem) {
    menu.collapse = !menu.collapse;
  }

  onNavigated(e: NavigationEnd) {
    const url = e.urlAfterRedirects.substring(1);
    this.loopActive(this.dataVal, url);
    this._cd.detectChanges();
  }

  loopActive(menus: MenuItem[] | undefined, url: string) {
    if (menus == null)
      return false;
    const length = menus.length;
    let active = false;
    for (let i = 0; i < length; i++) {
      if (menus[i].items == null) {
        if ((menus[i].active = menus[i].url == url))
          active = true;
      }
      else {
        if ((menus[i].active = this.loopActive(menus[i].items, url)))
          active = true;
      }
    }
    return active;
  }
}
