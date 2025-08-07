import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private _locale$ = new BehaviorSubject<string>('vi-VN');
    locale$ = this._locale$.asObservable();
    _translateService = inject(TranslateService);
    private _changed$ = new BehaviorSubject<string>('vi');
    changed$ = this._changed$.asObservable();

    get currentLocale() {
        return this._locale$.value;
    }

    setLocale(locale: string) {
        this._locale$.next(locale);
        const language = locale.split('-')[0];
        this._translateService.use(language).subscribe(() => {
            this._changed$.next(language);
        });
    }
}