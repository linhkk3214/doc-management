import { Directive, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Tooltip } from 'primeng/tooltip';

@Directive({
    selector: '[aeTranslateTooltip]',
    standalone: true,
})
export class AeTranslateTooltipDirective implements OnInit {
    _value: string | undefined;
    @Input('aeTranslateTooltip')
    set key(value: string | undefined) {
        this._value = value;
        if (this.initialized)
            this.setTranslation();
    }
    initialized = false;

    constructor(
        private tooltip: Tooltip,
        private translate: TranslateService
    ) { }

    ngOnInit(): void {
        this.initialized = true;
        this.setTranslation();
    }

    private setTranslation() {
        if (this._value) {
            this.translate.get(this._value).subscribe(translated => {
                this.tooltip._tooltipOptions.tooltipLabel = translated;
            });
        }
        else {
            this.tooltip._tooltipOptions.tooltipLabel = '';
        }
    }
}
