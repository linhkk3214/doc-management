import { Directive, Input, output } from '@angular/core';
import { ObjectType } from './model/common';
import { ListSetting } from './model/form-model';

@Directive()
export abstract class FormBase {
    // settings = input<ListSetting | undefined>(undefined);
    // settingsVal = computed(() => this.settings());
    @Input() settings: ListSetting | undefined;
    visibleChanged = output<boolean>();

    visible = true;
    model: ObjectType = {};
    handleVisibleChanged(show: boolean) {
        this.visibleChanged.emit(show);
    }
}