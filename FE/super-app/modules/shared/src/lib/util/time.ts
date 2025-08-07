import { DatePipe } from '@angular/common';
import { inject } from '@angular/core';

export class TimeUtils {
    static #datePipe: DatePipe = inject(DatePipe);

    static addDays(date: Date, days: number): Date {
        const cloned = new Date(date);
        cloned.setDate(date.getDate() + days);
        return cloned;
    }

    static addWorkDays(date: Date, days: number): Date {
        const cloned = new Date(date);
        while (days > 0) {
            cloned.setDate(cloned.getDate() + 1);
            if (cloned.getDay() !== 0 && cloned.getDay() !== 6) {
                days -= 1;
            }
        }
        return cloned;
    }

    static addHours(date: Date, hours: number): Date {
        const cloned = new Date(date);
        cloned.setTime(cloned.getTime() + (hours * 60 * 60 * 1000));
        return cloned;
    }

    static compare(date1: string | Date | null, date2: string | Date | null): number {
        date1 = this.parseDate(date1);
        date2 = this.parseDate(date2);
        if (!date1 || !date2)
            return 0;
        return date1.getTime() - date2.getTime();
    }

    static parseDate(dateStr: string | Date | null): Date | null {
        if (dateStr instanceof Date) {
            return dateStr;
        } else {
            if (!dateStr || dateStr == '')
                return null;
            return new Date(dateStr);
        }
    }

    static renderDateTime(date: string | Date | null, format: 'normal' | 'fromNow' = 'fromNow') {
        if (!date) {
            return '';
        }
        if (typeof date === 'string') {
            date = new Date(date + '');
        }

        if (format === 'normal') {
            return this.#datePipe.transform(date, 'dd/MM/yyyy HH:mm');
        }

        const now: Date = new Date();
        let milisecond: number = now.getTime() - date.getTime();
        let suffix, dayPrefix;
        if (milisecond < 0) {
            milisecond *= -1;
            suffix = 'nữa';
            dayPrefix = 'Ngày mai';
        }
        else {
            suffix = 'trước';
            dayPrefix = 'Hôm qua';
        }

        if (milisecond < 30000) {
            // 30 giây
            return 'Vài giây ' + suffix;
        }
        if (milisecond < 90000) {
            // 30 giây - 90 giây
            return 'Một phút ' + suffix;
        }
        if (milisecond < 300000) {
            // 5 phút
            return 'Vài phút ' + suffix;
        }
        if (milisecond < 3600000) {
            // dưới 1 tiếng
            return Math.ceil(milisecond / 60000) + ' phút ' + suffix;
        }
        if (milisecond < 18000000) {
            // dưới 5 tiếng
            return 'Vài giờ ' + suffix;
        }
        if (milisecond < 86400000) {
            // dưới 1 ngày
            if (date.getDate() == now.getDate()) {
                return Math.ceil(milisecond / 3600000) + ' giờ ' + suffix;
            }
            else {
                return (
                    dayPrefix + ' lúc ' + this.#datePipe.transform(date, 'HH:mm')
                );
            }
        }
        if (
            date.getFullYear() == now.getFullYear()
            && date.getMonth() == now.getMonth()
            && date.getDate() == now.getDate() - 1
        ) {
            return (
                dayPrefix + ' lúc ' + this.#datePipe.transform(date, 'HH:mm')
            );
        }
        else {
            return this.#datePipe.transform(
                date,
                'dd/MM/yyyy HH:mm'
            );
        }
    }

    static renderDate(date: Date, format: 'normal' | 'fromNow' = 'normal') {
        if (!date) {
            return '';
        }

        if (typeof date === 'string') {
            date = new Date(date + '');
        }

        if (format === 'normal') {
            return this.#datePipe.transform(date, 'dd/MM/yyyy');
        }

        const now: Date = new Date();
        if (
            date.getMonth() == now.getMonth()
            && date.getFullYear() == now.getFullYear()
        ) {
            const days = date.getDate() - now.getDate();
            switch (days) {
                case 0:
                    return 'Hôm nay';
                case 1:
                    return 'Ngày mai';
                case -1:
                    return 'Hôm qua';
                case 2:
                    return 'Hai ngày nữa';
                case -2:
                    return 'Hai ngày trước';
                case 3:
                    return 'Ba ngày nữa';
                case -3:
                    return 'Ba ngày trước';
            }
        }
        return this.#datePipe.transform(date, 'dd/MM/yyyy');
    }

}