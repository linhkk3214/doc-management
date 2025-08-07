// streaming.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
    id: number;
    name: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class StreamingService {
    private readonly API_URL = 'https://ocr-app-api.csharpp.com/cities/stream2';
    constructor(private http: HttpClient) { }

    getStream(): Observable<User> {
        return new Observable<User>(observer => {
            const url = this.API_URL; // URL của API stream
            const eventSource = new EventSource(url);

            eventSource.onmessage = (event: MessageEvent) => {
                try {
                    const user: User = JSON.parse(event.data); // Parse dữ liệu JSON từ server
                    observer.next(user); // Gửi đối tượng User cho subscriber
                } catch (error) {
                    console.error('Lỗi khi parse dữ liệu JSON:', error);
                }
            };

            eventSource.onerror = (error) => {
                observer.error(error); // Nếu có lỗi xảy ra, gửi lỗi cho subscriber
            };

            // Khi Observable bị hủy, đóng EventSource
            return () => {
                eventSource.close();
            };
        });
    }

    getStream2(): Observable<User> {
        return new Observable<User>(observer => {
            const url = 'https://ocr-app-api.csharpp.com/cities/stream'; // URL của API stream
            const options = {
                headers: new HttpHeaders({
                    'Accept': 'application/json' // Yêu cầu dữ liệu dưới dạng JSON
                }),
                responseType: 'text' as 'json', // Định dạng trả về là văn bản (string)
            };

            const stream = this.http.get(url, options);

            stream.subscribe({
                next: (chunk: object) => {
                    // Parse chuỗi JSON thành đối tượng User và phát ra cho client
                    try {
                        //const user: User = JSON.parse(chunk);
                        console.log(chunk);
                        //observer.next(undefined); // Gửi đối tượng User đến subscriber
                    } catch (error) {
                        console.error('Lỗi khi parse dữ liệu JSON:', error);
                    }
                },
                complete: () => observer.complete(),
                error: (err) => observer.error(err)
            });
        });
    }

    getStream3(): Observable<User> {
        return new Observable<User>(observer => {
            const url = 'https://ocr-app-api.csharpp.com/cities/stream'; // URL của API stream

            // Sử dụng fetch API để stream dữ liệu
            fetch(url)
                .then(response => {
                    const reader = response.body?.getReader(); // Lấy reader để đọc stream
                    const decoder = new TextDecoder(); // Để chuyển từ byte array thành string
                    let buffer = '';

                    // Đọc từng chunk từ stream
                    reader?.read().then(function processText({ done, value }) {
                        if (done) {
                            observer.complete(); // Kết thúc khi không còn dữ liệu
                            return;
                        }

                        buffer += decoder.decode(value, { stream: true }); // Dữ liệu được nối vào buffer

                        // Kiểm tra nếu buffer chứa đủ 1 đối tượng JSON
                        let boundary = buffer.indexOf('\n'); // Giả sử mỗi đối tượng JSON kết thúc với ký tự '\n'
                        while (boundary !== -1) {
                            const chunk = buffer.slice(0, boundary); // Lấy phần JSON trong buffer
                            try {
                                const user: User = JSON.parse(chunk); // Chuyển chuỗi JSON thành đối tượng User
                                observer.next(user); // Gửi đối tượng User đến subscriber
                            } catch (error) {
                                console.error('Lỗi khi parse dữ liệu JSON:', error);
                            }
                            buffer = buffer.slice(boundary + 1); // Xóa phần đã xử lý trong buffer
                            boundary = buffer.indexOf('\n'); // Tìm tiếp phần kế tiếp
                        }

                        // Đọc tiếp các chunk dữ liệu
                        reader.read().then(processText);
                    });
                })
                .catch(error => observer.error(error)); // Xử lý lỗi nếu có
        });
    }
}
