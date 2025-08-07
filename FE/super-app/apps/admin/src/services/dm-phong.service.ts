// streaming.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from '@super-app/shared';

@Injectable({
  providedIn: 'root'
})
export class DMPhongService extends BaseService {
  constructor() {
    super('https://ocr-app-api.csharpp.com/DMPhong');
  }
}
