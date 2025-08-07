import { Pipe, PipeTransform } from '@angular/core';
import { getValueByPath } from '../util/object';

@Pipe({ name: 'valueByPath' })
export class ValueByPathPipe implements PipeTransform {
    transform(obj: any, path: string): any {
        return getValueByPath(obj, path);
    }
}
