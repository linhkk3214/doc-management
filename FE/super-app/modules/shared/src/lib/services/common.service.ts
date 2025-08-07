import { Injectable } from '@angular/core';

enum DeviceType {
    Mobile = 1,
    Tablet = 2,
    Desktop = 3
}

@Injectable({
    providedIn: 'root',
})
export class CommonService {
    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 640)
            return DeviceType.Mobile;
        if (width <= 1024)
            return DeviceType.Tablet;
        return DeviceType.Desktop;
    }
}