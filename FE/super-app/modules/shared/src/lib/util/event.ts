

import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

export function emptyHandle() { }

export function addClickOutsideRx(
    element: HTMLElement,
    onOutsideClick: (element: HTMLElement) => void
) {
    const destroy$ = new Subject<void>();

    fromEvent<MouseEvent>(document, 'click')
        .pipe(
            filter(event => {
                const target = event.target as HTMLElement;
                return target && !element.contains(target);
            }),
            takeUntil(destroy$),
            tap(() => {
                onOutsideClick(element);
                destroy$.next();
                destroy$.complete();
            })
        )
        .subscribe();

    return () => {
        onOutsideClick(element);
        destroy$.next();
        destroy$.complete();
    };
}

export function addClickOutside(element: HTMLElement, onOutsideClick: (e: HTMLElement) => void) {
    const controller = new AbortController();
    const signal = controller.signal;
    document.addEventListener('click', (e) => {
        if (!e.target)
            return;
        if (!element.contains(<any>e.target)) {
            controller.abort();
            onOutsideClick(element);
        }
    }, { signal });
    return () => {
        onOutsideClick(element);
        controller.abort();
    };
}