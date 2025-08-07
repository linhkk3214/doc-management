// streaming.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from '@super-app/shared';
import { buildApiUrl, API_CONSTANTS } from '../app/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class CitiesService extends BaseService {
  constructor() {
    super(buildApiUrl(API_CONSTANTS.ENDPOINTS.CITIES));
  }
}
