import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
@Injectable()
export class ComponentContextService {
    key: string;
    pathToRoot: string;
    parent: ComponentContextService;
    root: ComponentContextService;
    data = <any>{};

    _unSubscribeAll = new Subject<any>();
    subjects: { [name: string]: Subject<any> } = {};
    replaySubjects: { [name: string]: ReplaySubject<any> } = {};

    sub: any;

    constructor(
        private _commonService: CommonService
    ) {

    }

    private addSubject(name: string, subject?: Subject<any>): Subject<any> {
        const key = `${this.key}.${name}`;
        if (!this.subjects[key] || !this.subjects[key].observers) {
            if (!subject) {
                subject = new Subject<any>();
            }
            this.subjects[key] = subject;
        }

        return this.subjects[key];
    }

    private addReplaySubject(name: string, subject?: ReplaySubject<any>): ReplaySubject<any> {
        const key = `${this.key}.${name}`;
        if (!this.replaySubjects[key] || !this.replaySubjects[key].observers) {
            if (!subject) {
                subject = new ReplaySubject<any>();
            }
            this.replaySubjects[key] = subject;
        }

        return this.replaySubjects[key];
    }

    fireEvent(name: string, data?: any, cancelBubble: boolean = false) {
        const subject = this.addSubject(name);
        subject.next(data);
        if (!cancelBubble) {
            if (this.parent && this.parent !== this.root)
                this.parent.fireEvent(name, data);
            else if (!this.parent && this.root && this !== this.root) {
                this.root.fireEvent(name, data);
            }
        }
    }

    fireReplayEvent(name: string, data?: any, cancelBubble: boolean = false) {
        const subject = this.addReplaySubject(name);
        subject.next(data);
        if (!cancelBubble) {
            if (this.parent && this.parent !== this.root)
                this.parent.fireReplayEvent(name, data);
            else if (!this.parent && this.root && this !== this.root) {
                this.root.fireReplayEvent(name, data);
            }
        }
    }

    completeEvent(name) {
        const subject = this.addSubject(name);
        subject.next();
        subject.complete();
    }

    completeReplayEvent(name) {
        const subject = this.addReplaySubject(name);
        subject.next();
        subject.complete();
    }

    private completeSubject(name: string) {
        const key = `${this.key}.${name}`;
        if (this.subjects[key]) {
            this.subjects[key].complete();
            delete this.subjects[key];
        }
    }

    private completeReplaySubject(name: string) {
        const key = `${this.key}.${name}`;
        if (this.replaySubjects[key]) {
            this.replaySubjects[key].complete();
            delete this.replaySubjects[key];
        }
    }

    private getSubject(name: string) {
        const key = `${this.key}.${name}`;

        if (!this.subjects[key] || !this.subjects[key].observers) {
            this.subjects[key] = new Subject<any>();
        }

        return this.subjects[key];
    }

    private removeSubject(name: string) {
        const key = `${this.key}.${name}`;

        if (this.subjects[key]) {
            this.subjects[key].unsubscribe();
        }
    }

    private getReplaySubject(name: string) {
        const key = `${this.key}.${name}`;

        if (!this.replaySubjects[key] || !this.replaySubjects[key].observers) {
            this.replaySubjects[key] = new ReplaySubject<any>();
        }

        return this.replaySubjects[key];
    }

    private removeReplaySubject(name: string) {
        const key = `${this.key}.${name}`;

        if (this.replaySubjects[key]) {
            this.replaySubjects[key].unsubscribe();
        }
    }

    replaySubscribe(name: string, callBack: any) {
        return this.getReplaySubject(name)
            .pipe(takeUntil(this._unSubscribeAll))
            .subscribe((rs) => {
                try {
                    callBack(rs);
                }
                catch { };
            });
    }

    replaySubscribeOnce(name: string, callBack: any) {
        this.sub = this.getReplaySubject(name)
            .pipe(takeUntil(this._unSubscribeAll))
            .subscribe((rs) => {
                try {
                    callBack(rs);
                }
                catch { };
                if (this.sub) {
                    this.sub.unsubscribe();
                }
            });
        return this.sub;
    }

    subscribe(name: string, callBack: any) {
        return this.getSubject(name)
            .pipe(takeUntil(this._unSubscribeAll))
            .subscribe((rs) => {
                try {
                    callBack(rs);
                }
                catch { };
            });
    }

    subscribeOnce(name: string, callBack: any) {
        this.sub = this.getSubject(name)
            .pipe(takeUntil(this._unSubscribeAll))
            .subscribe((rs) => {
                try {
                    callBack(rs);
                }
                catch { };
                if (this.sub) {
                    this.sub.unsubscribe();
                }
            });
        return this.sub;
    }

    unSubscribe(name: string) {
        if (this.subjects[`${this.key}.${name}`]) {
            this.subjects[`${this.key}.${name}`].unsubscribe();
            delete this.subjects[`${this.key}.${name}`];
        }
    }

    unSubscribleReplay(name: string) {
        if (this.replaySubjects[`${this.key}.${name}`]) {
            this.replaySubjects[`${this.key}.${name}`].unsubscribe();
            delete this.replaySubjects[`${this.key}.${name}`];
        }
    }

    getRootData(keyPath?: string, defaultValueIfNull?: any): any {
        const root = this.root || this;
        return this.getDataInternal(root.data, keyPath, defaultValueIfNull);
    }

    getData(keyPath: string, defaultValueIfNull?: any): any {
        return this.getDataInternal(this.data, keyPath, defaultValueIfNull);
    }

    private getDataInternal(obj, keyPath: string, defaultValueIfNull?: any): any {
        const data = this._commonService.getValueByPath(obj, keyPath);

        if (defaultValueIfNull && !data) {
            this._commonService.setValueByPath(obj, keyPath, defaultValueIfNull);
        }
        return this._commonService.getValueByPath(obj, keyPath);
    }

    setRootData(keyPath: string, value: any) {
        const root = this.root || this;
        return this.setDataInternal(root.data, keyPath, value);
    }

    setData(keyPath: string, value: any) {
        return this.setDataInternal(this.data, keyPath, value);
    }

    setDataInternal(obj, keyPath: string, data: any): any {
        const root = this.root || this;
        this._commonService.setValueByPath(obj, keyPath, data);
    }

    destroyContext() {
        for (const key in this.subjects) {
            this.completeSubject(key);
        }

        for (const key in this.replaySubjects) {
            this.completeReplaySubject(key);
        }

        this._unSubscribeAll.next();
        this._unSubscribeAll.complete();

        this.data = {};
        this.root.fireEvent(ComCtxConstants.ROOT.DESTROY_COMPONENT, this);
    }

    addExportJob(job: ExportJob) {
        if (this.root.reportQueue) {
            this.root.reportQueue.addJob(job);
        }
    }
}