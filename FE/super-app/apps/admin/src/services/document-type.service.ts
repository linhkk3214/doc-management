// streaming.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from '@super-app/shared';

@Injectable({
  providedIn: 'root'
})
export class DocumentTypeService extends BaseService {
  constructor() {
    super('https://ocr-app-api.csharpp.com/dmLoaiVanBan');
  }
}
