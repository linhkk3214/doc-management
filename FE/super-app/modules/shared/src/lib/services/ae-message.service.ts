import { inject, Injectable } from '@angular/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';
@Injectable({
    providedIn: 'root',
})
export class AeMessageService {
    private messageService = inject(MessageService);
    error(message: ToastMessageOptions) {
        message.severity = 'error';
        this.messageService.add(message);
    }
    success(message: ToastMessageOptions) {
        message.severity = 'success';
        this.messageService.add(message);
    }
    warn(message: ToastMessageOptions) {
        message.severity = 'warn';
        this.messageService.add(message);
    }
}