// streaming.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from '@super-app/shared';

@Injectable({
  providedIn: 'root'
})
export class CitiesService extends BaseService {
  constructor() {
    super('http://localhost:5001/cities');
  }
}
