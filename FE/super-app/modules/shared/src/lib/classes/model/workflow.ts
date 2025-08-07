export enum EnumWFNhomTrangThai {
    BAT_DAU = 0,
    XU_LY = 1,
    KET_THUC = 2,
    TU_CHOI = 3,
    HUY = 4
}

export const LabelWFNhomTrangThai = {
    [EnumWFNhomTrangThai.BAT_DAU]: 'Bắt đầu',
    [EnumWFNhomTrangThai.XU_LY]: 'Xử lý',
    [EnumWFNhomTrangThai.KET_THUC]: 'Kết thúc',
    [EnumWFNhomTrangThai.TU_CHOI]: 'Từ chối',
    [EnumWFNhomTrangThai.HUY]: 'Hủy',
};

export enum EnumActionType {
    TIEN = 1,
    LUI = 2,
    THOAT_VONG_LAP = 3
}

export enum DeadlineType {
    KHONG_CO = -1,
    GIO = 1,
    NGAY = 2,
    TUAN = 3,
    THANG = 4
}

export enum ManagerType {
    CAP_TREN = 2,
    NGUOI_CUOI_CUNG = 4,
    NGUOI_TAO = 5,
}

export class WorkflowSetting {
    [key: string]: any;
    statuses: Status[] = [];
    statusActions: StatusAction[] = [];
    constructor(init?: WorkflowSetting) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class Status {
    [key: string]: any;
    ma?: string;
    ten?: string;
    trangThaiContainer: TrangThaiMasterData = new TrangThaiMasterData();
    type: EnumWFNhomTrangThai = EnumWFNhomTrangThai.BAT_DAU;
    options: StatusOption = new StatusOption();
    userInfo: StatusUser = new StatusUser();
    groupInfo: StatusGroup = new StatusGroup();
    orgInfo: StatusOrg = new StatusOrg();
    constructor(init?: Status) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class TrangThaiMasterData {
    ma?: string;
    ten?: string;
}

export class StatusOption {
    choPhepSua: boolean;
    public: boolean;
    isLoop: boolean;
}

export class StatusUser {
    userIds: string[];
    managerTypes: ManagerType[];
    userViewIds: string[];
    // userChangeStatusAt: string;
}

export class StatusGroup {
    groupIds: string[];
    groupViewIds: string[];
}

export class StatusOrg {
    orgIds: string[];
    orgViewIds: string[];
}

export class StatusAction {
    sourceStatus: string;
    actions: Action[];
    constructor(init?: StatusAction) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class Action {
    ma: string;
    icon: string;
    ten?: string;
    type?: EnumActionType;
    tenContainer: TenContainer;
    actionOptions: {
        batBuocDinhKem: boolean;
        openDialog: boolean;
        batBuocChonDonVi: boolean;
    }
    trangThaiSauXuLy: string;
    targetStatus: string;
    deadline: Deadline;
    constructor(init?: Action) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}

export class TenContainer {
    ten: string;
    actionType: EnumActionType;
}

export class Deadline {
    type: DeadlineType = DeadlineType.KHONG_CO;
    time: number;
    constructor(init?: Deadline) {
        for (const key in init) {
            this[key] = init[key];
        }
    }
}


export class WorkflowSettingNew {
    createTaskInstead: boolean;
    autoNextStep: boolean;
    autoStartTask: boolean;
    taskInsideBusinessForm: boolean;
    templateTaskName: string;
    idLoaiCongViecDefault: string;
    workflowCodes: string[];
    workflowCode: string;
    workflows: WfItem[];
}

export class WfItem {
    code: string;
    data: WfSchema;
    title: string;
}

export class WfSchema {
    machines: WfMachine[];
    connections: WfAction[];
    actions?: { [key: string]: WfAction[] };
}

export class WfMachine {
    id: string;
    code: string;
    name: string;
    type: EnumStateType;
    location: number[];
    editing: boolean;
    description: string;
    data: any;
}
export class WfAction {
    soThuTu: number;
    code: string;
    data: any;
    editing: boolean = false;
    icon: string;
    name: string;
    openPopup: boolean;
    openNewTab: boolean;
    domainNewTab: string;
    linkNewTab: string;
    source: string;
    sourceAnchor: string;
    target: string;
    targetAnchor: string;
    targetsAllowModify: number[];
}

export class WorkflowTargetDefaultValue {
    lstUserId: string[];
    lstUserViewId: string[];
    lstDonViId: string[];
    lstDonViViewId: string[];
    lstGroupId: string[];
    lstGroupViewId: string[];
    lstRoleId: string[];
    lstRoleViewId: string[];
    lstUserIdInWorkflow: string[];
    lstDonViIdInWorkflow: string[];
    lstGroupIdInWorkflow: string[];
}