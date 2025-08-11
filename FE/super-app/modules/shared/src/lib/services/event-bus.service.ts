import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface EventBusMessage<T = unknown> {
  type: string;
  payload?: T;
  source?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<EventBusMessage>();

  /**
   * Phát sự kiện với loại và dữ liệu tùy chọn
   * @param type Loại sự kiện
   * @param payload Dữ liệu kèm theo (tùy chọn)
   * @param source Nguồn phát sự kiện (tùy chọn)
   */
  emit<T = unknown>(type: string, payload?: T, source?: unknown): void {
    this.eventSubject.next({ type, payload, source });
  }

  /**
   * Lắng nghe sự kiện theo loại cụ thể
   * @param eventType Loại sự kiện cần lắng nghe
   * @returns Observable của payload sự kiện
   */
  on<T = unknown>(eventType: string): Observable<T> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === eventType),
      map(event => event.payload as T)
    );
  }

  /**
   * Lắng nghe sự kiện với thông tin đầy đủ (bao gồm source)
   * @param eventType Loại sự kiện cần lắng nghe
   * @returns Observable của EventBusMessage
   */
  onFull<T = unknown>(eventType: string): Observable<EventBusMessage<T>> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === eventType)
    ) as Observable<EventBusMessage<T>>;
  }

  /**
   * Lắng nghe tất cả sự kiện
   * @returns Observable của tất cả EventBusMessage
   */
  onAll(): Observable<EventBusMessage> {
    return this.eventSubject.asObservable();
  }
}
