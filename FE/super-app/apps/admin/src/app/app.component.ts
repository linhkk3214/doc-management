import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@super-app/auth';
import { AeScrollbarComponent, LanguageService, LayoutMenuComponent, MenuItem, StorageService } from '@super-app/shared';
import { MenuModule } from 'primeng/menu';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';


@Component({
  standalone: true,
  imports: [
    RouterModule, CommonModule, TranslateModule,
    ToggleSwitchModule, MenuModule, FormsModule,
    AeScrollbarComponent, LayoutMenuComponent, ToastModule,
    SelectButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  checked = true;
  title = 'admin';
  height = 0;
  isDark = false;
  static INJECTOR: Injector;
  user: { fullName: string } = { fullName: 'Đinh Hải Linh' };
  menus: MenuItem[] = [
    { name: 'Hồ sơ', url: 'ho-so', icon: 'user' },
    { name: 'Văn bản', url: 'van-ban', icon: 'bitcoin' },
  ];
  localizations = [
    { value: 'vi-VN', label: 'VN' },
    { value: 'en-us', label: 'EN' }
  ];
  locale = this.localizations[0].value;
  userMenus = [
    {
      label: 'Hi Linh',
      icon: 'pi pi-user',
      styleClass: 'user-menu-header text-center pointer-events-none cursor-default',
      disabled: true
    },
    {
      separator: true
    },
    {
      label: 'Details',
      icon: 'pi pi-id-card',
      styleClass: 'dark:text-white text-gray-900'
    },
    {
      label: 'Test dài dài dài',
      icon: 'pi pi-id-card'
    },
    {
      label: 'Log out',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _storageService = inject(StorageService);
  private _languageService = inject(LanguageService);
  private _translateService = inject(TranslateService);

  constructor(
    injector: Injector,
  ) {
    AppComponent.INJECTOR = injector;
  }

  ngOnInit(): void {
    const locale = this._storageService.read('locale');
    this.locale = locale ?? 'vi-VN';
    this._languageService.setLocale(this.locale);
    this._languageService.changed$.subscribe(q => {
      this.userMenus[0].label = `${this._translateService.instant('hello')} ${this.getLastName()}`;
    })

    this.isDark = this._storageService.read('theme_isDark') == '1';
    if (this.isDark) {
      this.toggleTheme();
    }

    this._authService.checkAuth().subscribe(({ isAuthenticated }) => {
      if (isAuthenticated) {
        const redirectUrl = this._storageService.read('redirect-url');
        if (redirectUrl) {
          this._storageService.remove('redirect-url');
          this._router.navigateByUrl(redirectUrl);
        }
      }
    });
  }

  getLastName() {
    return this.user.fullName.split(' ').pop();
  }

  goToHome(e: Event) {
    e.stopPropagation();
    this._router.navigate(['']);
  }

  handeClick() {
    this.height = this.height == 0 ? 300 : 0;
  }

  logout() {
    this._authService.logout();
  }

  toggleTheme() {
    const element = document.querySelector('html');
    this._storageService.write('theme_isDark', element?.classList.toggle('my-app-dark') ? '1' : '0');
  }

  handleChangeLocale() {
    this._storageService.write('locale', this.locale);
    window.location.reload();
  }
}
