
export class ObjectApp {
    [key: string]: any;
    code?: string;
    column?: number;
    defaultRedirect?: string;
    url?: string;
    icon?: string;
    title?: string;
    longTitle?: string;
    visibile?: boolean;
    allowAnonymous?: boolean;

    useLocal?: boolean; // use for development environment
    localEndpoint?: string; // use for development environment
    constructor(init?: ObjectApp) {
        if (!init)
            return;
        for (const key in init) {
            this[key] = init[key];
        }
    }
}
export interface EnvironmentSchema {
    [key: string]: any;
    production: boolean;
    appMetadata: {
        avatarFemale: string;
        avatarMale: string;
        favicon: string;
        logo: string;
        owner: string;
        title: string;
        openNewTab: boolean;

        expertName: string;
        expertPhoneNummber: string;
        expertEmail: string;
        logoCompany: string;

        baseHref: string;
        gateway: string;
        gatewaySubpath: string;
        appGateway: string;
    };
    services: {
        [key: string]: {
            code: string;
            useLocal: boolean;
        };
    };
    apps: {
        [key: string]: ObjectApp;
    };

    authenticationSettings: {
        authenType: string[];
        clientId: string;
        issuer: string;
        scope: string;
        requireHttps: boolean;
        customRedirectUri: string;
        logoutOnUnauthorized: boolean;
        isForceLogoutIf401: boolean;
        disabled: boolean;
    };

    showErrorMessageInToast: boolean;
    showWarningMessageInToast: boolean;
    useAdminRole: boolean;
}
