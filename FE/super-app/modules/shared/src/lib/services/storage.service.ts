import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
    read(key: string) {
        return window.localStorage.getItem(key);
    }

    write(key: string, value: any): void {
        window.localStorage.setItem(key, value);
    }

    remove(key: string): void {
        window.localStorage.removeItem(key);
    }

    clear(): void {
        window.localStorage.clear();
    }
}