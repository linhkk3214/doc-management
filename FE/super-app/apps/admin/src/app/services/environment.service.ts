import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Environment } from '../../environments/environment.interface';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly env: Environment = environment;

  get production(): boolean {
    return this.env.production;
  }

  get apiUrl(): string {
    return this.env.apiUrl;
  }

  get appName(): string {
    return this.env.appName;
  }

  get enableDebugMode(): boolean {
    return this.env.enableDebugMode;
  }

  get enableDevTools(): boolean {
    return this.env.enableDevTools;
  }

  /**
   * Kiểm tra nếu đang ở development mode
   */
  get isDevelopment(): boolean {
    return !this.env.production;
  }

  /**
   * Kiểm tra nếu debug được bật
   */
  get isDebugEnabled(): boolean {
    return this.env.enableDebugMode;
  }

  /**
   * Log thông tin chỉ khi debug được bật
   */
  debugLog(message: string, ...optionalParams: unknown[]): void {
    if (this.enableDebugMode) {
      console.log(`[${this.appName}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Lấy toàn bộ environment object
   */
  getEnvironment(): Environment {
    return { ...this.env };
  }
}
