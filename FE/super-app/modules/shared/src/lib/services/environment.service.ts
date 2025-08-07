import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { AuthConfig } from 'angular-oauth2-oidc';
// import { SignalRConfiguration } from 'ng2-signalr';
import { EnvironmentSchema, ObjectApp } from '../classes/environment-schema';
import { ModuleConfig } from '../configs/module-config';

export function moduleConfigFunc() {
    return new InjectionToken<ModuleConfig>('');
}

@Injectable({
    providedIn: 'root'
})
export class EnvironmentService {
    environment: EnvironmentSchema;
    private appCode: string;

    constructor(
        @Optional() @Inject(moduleConfigFunc)
        moduleConfigVal: any = null
    ) {
        if (!moduleConfigVal) {
            // get from session storage
            const data = sessionStorage.getItem('moduleConfigVal');
            if (data) {
                this.environment = JSON.parse(data);
            }
            else {
                console.error('cannot find moduleConfigVal');
            }
        }
        else {
            const objModuleConfigVal = moduleConfigVal();
            this.environment = objModuleConfigVal.environment;
            this.appCode = objModuleConfigVal.appCode;
            sessionStorage.setItem('moduleConfigVal', JSON.stringify(this.environment));
        }
    }

    getSignalRConfig() {
        const c = {
            hubName: '',
            qs: { key: '' },
            url: '',
            logging: true,
            executeEventsInZone: true,
            executeErrorsInZone: false,
            executeStatusChangeInZone: true,
        };
        c.hubName = 'tnclient';
        c.qs = { key: 'webapp' };

        if (this.environment.signalr.useSSL) {
            c.url = `${this.environment.signalr.endpointSSL}`;
        }
        else {
            c.url = `${this.environment.signalr.endpoint}`;
        }

        c.logging = this.environment.signalr.showLog;

        c.executeEventsInZone = true;
        c.executeErrorsInZone = false;
        c.executeStatusChangeInZone = true;

        return c;
    }

    getAuthConfig(): AuthConfig {
        let scope = 'openid profile email';
        if (this.environment.authenticationSettings.scope) {
            scope = this.environment.authenticationSettings.scope;
        }
        return <AuthConfig>{
            issuer: `${this.environment.authenticationSettings.issuer}`,
            clientId: `${this.environment.authenticationSettings.clientId}`,
            redirectUri: this.environment.authenticationSettings.customRedirectUri || window.location.origin,
            postLogoutRedirectUri: window.location.origin,
            silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
            requireHttps: this.environment.authenticationSettings.requireHttps ? this.environment.authenticationSettings.requireHttps : false,
            scope,
            showDebugInformation: false,
            requestAccessToken: true,
            useSilentRefresh: false,
            clearHashAfterLogin: true
        };
    }

    private getServiceEndpointByServiceInfo(serviceInfo: any): string {
        let endpoint = '';
        if (serviceInfo.uselocalendpoint) {
            endpoint = serviceInfo.localhttpendpoint;
        }
        else {
            const gateway = this.environment.appMetadata.gateway;
            endpoint = `${gateway}/${serviceInfo.code}`;
        }
        return endpoint;
    }

    private getServiceEndpointWithVersionByServiceInfo(serviceInfo: any): string {
        const endpoint = this.getServiceEndpointByServiceInfo(serviceInfo);
        let apiVersion = this.environment.majorApiVersion;
        if (serviceInfo.apiVersion) {
            apiVersion = serviceInfo.apiVersion;
        }
        const result = `${endpoint}/v${apiVersion}`;
        return result;
    }

    private _getHttpServiceEndpoint(serviceCode: string, includeVersion: boolean = false) {
        serviceCode = serviceCode.toLowerCase();
        const serviceInfo = Object.values(this.environment.services).find(q => q.code.toLowerCase() == serviceCode);
        if (!serviceInfo) {
            console.error(`Không tìm thấy endpoint của service ${serviceCode} trong cấu hình`);
            return '';
        }
        if (!includeVersion) {
            return this.getServiceEndpointByServiceInfo(serviceInfo);
        }
        return this.getServiceEndpointWithVersionByServiceInfo(serviceInfo);
    }

    getHttpServiceEndpoint(serviceCode: string): string {
        return this._getHttpServiceEndpoint(serviceCode, false);
    }

    getHttpServiceEndpointWithVersion(serviceCode): string {
        return this._getHttpServiceEndpoint(serviceCode, true);
    }

    getHttpServiceEndpointOld(serviceCode: string): string {
        serviceCode = serviceCode.toLowerCase();
        const serviceInfo = Object.values(this.environment.services).find(q => q.code == serviceCode);
        if (!serviceInfo) {
            console.error(`Không tìm thấy endpoint của service ${serviceCode} trong cấu hình`);
            return '';
        }
        let endpoint = '';
        if (serviceInfo.useLocal) {
            endpoint = serviceInfo.localHttpEndpointOld;
        }
        else {
            const gateway = this.environment.appMetadata.gatewayOld;
            endpoint = `${gateway}/${serviceCode}`;
        }
        return endpoint;
    }

    getUserSettingConfig() {
        return this.environment.userSettingConfig;
    }

    getUsersHasPermissionResetPassword() {
        return this.environment.userHasPermissionResetPassword;
    }

    getHttpClientEndpoint(serviceCode: string): string {
        return '';
    }

    isUseOldService(serviceCode: string): boolean {
        const serviceInfo = Object.values(this.environment.services).find(q => q.code == serviceCode);
        if (!serviceInfo) {
            console.error(`Không tìm thấy endpoint của service ${serviceCode} trong cấu hình`);
            return false;
        }
        return serviceInfo.useOldVersion;
    }

    getEnableHub() {
        let objEnableHubs = this.environment.signalRConfig.enableHubs;
        if (!objEnableHubs) objEnableHubs = {};
        Object.keys(objEnableHubs).forEach(key => {
            if ((objEnableHubs[key] as any) === 'true' || objEnableHubs[key] === true) {
                objEnableHubs[key] = true;
            }
            else {
                objEnableHubs[key] = false;
            }
        });
        return objEnableHubs;
    }

    getDefaultMaleAvatar() {
        return this.environment.appMetadata.main.defaultMaleAvatar;
    }

    getDefaultFemaleAvatar() {
        return this.environment.appMetadata.main.defaultFemaleAvatar;
    }

    private isTrue(value: any) {
        return value === true || value === 'true';
    }

    getLogoutOnUnauthorized() {
        return this.isTrue(this.environment.authenticationSettings.logoutOnUnauthorized);
    }

    getListApp(): any[] {
        return Object.values(this.environment.apps);
    }

    getObjectApp(module: string) {
        const appObject = Object.values(this.environment.apps).find(q => q.code === module.toLowerCase());
        this.checkKeysAndAddValue(appObject, ObjectApp.KeysNeedReCheck);
        return appObject;
    }


    /**
     * Check cac property co the bi lech case cua object
     * @date 10/20/2022 - 9:00:11 AM
     *
     * @private
     * @param {Object} object
     * @param {string[]} keys cac property can check
     */
    private checkKeysAndAddValue(object: Object, keys: string[]) {
        for (const key of keys) {
            this.checkKeyAndAddValue(object, key);
        }
    }

    /**
     * Check property co the bi lech case cua object
     * @date 10/20/2022 - 9:00:11 AM
     *
     * @private
     * @param {Object} object
     * @param {string} key
     */
    private checkKeyAndAddValue(object: Object, key: string) {
        const lowerCaseKey = key.toLowerCase();
        if (object[key] == null && object[lowerCaseKey] != null) {
            object[key] = object[lowerCaseKey];
        }
    }

    getModuleName(module: string) {
        const objApp = this.getObjectApp(module);
        return objApp?.title;
    }

    getLongModuleName(module: string) {
        const objApp = this.getObjectApp(module);
        return objApp?.longTitle;
    }

    getShowWarningMessageInToast() {
        return this.isTrue(this.environment.showWarningMessageInToast);
    }

    getShowErrorMessageInToast() {
        return this.isTrue(this.environment.showErrorMessageInToast);
    }

    getIsIgnoreAdmin() {
        return this.isTrue(this.environment.isIgnoreAdmin);
    }

    getAppCode() {
        return this.appCode;
    }

    getListAppCode(): string[] {
        return Object.values(this.environment.apps).map(q => q.code);
    }

    getListApiDomain(): string[] {
        const result = [];
        Object.values(this.environment.services).forEach(service => {
            result.push(this.getServiceEndpointByServiceInfo(service));
        });
        return result;
    }

    getStorage() {
        return this.environment.storage;
    }

    getEnableTnClient() {
        return this.isTrue(this.environment.enableTnClient);
    }

    getIsForceLogoutIf401() {
        return this.isTrue(this.environment.authenticationSettings.isForceLogoutIf401);
    }

    getDisableAuthentication() {
        return this.isTrue(this.environment.authenticationSettings.disabled);
    }

    getAuthenticationType(): string[] {
        return this.environment.authenticationSettings.authenType;
    }

    getEnablePopulateLog() {
        return this.isTrue(this.environment.enablePopulateLog);
    }

    getShowDefaultSetting() {
        const app = this.getObjectApp(this.appCode);
        return this.isTrue(app?.showdefaultsetting);
    }

    getConfigDefaultSetting() {
        const app = this.getObjectApp(this.appCode);
        return app?.configdefaultsetting?.column ?? [];
    }

    getDisableNotification() {
        return this.isTrue(this.environment.disableNotification);
    }

    getHelpConfig_ExpertName() {
        return this.environment.helpConfig.expertName;
    }

    getHelpConfig_ExpertPhoneNummber() {
        return this.environment.helpConfig.expertPhoneNummber;
    }

    getHelpConfig_ExpertEmail() {
        return this.environment.helpConfig.expertEmail;
    }

    getHelpConfig_LogoCompany() {
        return this.environment.helpConfig.logoCompany;
    }

    getHelpConfig_Documents(): any[] {
        return this.environment.helpConfig.documents;
    }

    getSplashScreen() {
        return this.environment.splashScreen;
    }

    getUnderconstruction() {
        return this.environment.underconstruction;
    }

    getSignalr_ClientKey() {
        return this.environment.signalr.clientKey;
    }

    getApiGateway() {
        return this.environment.appMetadata.gateway;
    }

    getGatewaySubpath() {
        return this.environment.appMetadata.gatewaySubpath;
    }

    getDocumentServer() {
        return this.environment.appMetadata.documentServer;
    }

    getUsingInternalFileEndpointForView() {
        return !!this.environment.internalFileEndpoint;
    }

    getInternalFileEndpoint() {
        return this.environment.internalFileEndpoint;
    }

    getKySoSim_TsaUrl() {
        return this.environment.defaultValue?.kySoSim?.tsaUrl;
    }

    getButtonPermissions() {
        return this.environment.buttonPermissions ?? [];
    }

    getFieldsInDefaultSetting() {
        return this.environment.fieldsInDefaultSetting;
    }

    getKeyPressPermissionUtils() {
        return this.environment.keyPressPermissionUtils;
    }

    getCustomizeUi() {
        return this.environment.customizeUi;
    }

    getTitle() {
        return this.environment.appMetadata.main.title;
    }

    getLogo() {
        return this.environment.appMetadata.main.logo;
    }

    getOwner() {
        return this.environment.appMetadata.main.owner;
    }

    getOpenNewTab() {
        return this.environment.appMetadata.main.openNewTab;
    }

    getEnableBaseHref() {
        return this.environment.enableBaseHref;
    }

    getAuthorizationPrivateKey() {
        if (!this.getIsProduction()) {
            return 'testkey';
        }
        return this.environment.authorizationPrivateKey;
    }

    getDefaultRedirect() {
        return this.environment.clientDomain?.defaultRedirect;
    }

    getIsProduction() {
        return this.isTrue(this.environment.production);
    }

    getLinkDownloadClientApp() {
        return this.environment.signalr.linkDownloadClientApp;
    }

    getCustomConfig(key: string) {
        if (!this.environment.customConfig) return null;
        return this.environment.customConfig[key];
    }

    getListDonViQuanLyNganh() {
        return [];
    }

    getListDonViQuanLyHocPhan() {
        return [];
    }

    checkUseVersion(tableName: string): boolean {
        let versioningTables = this.environment.versioningTable;
        if (!versioningTables) versioningTables = '';
        versioningTables = versioningTables.toLowerCase();
        tableName = tableName.toLowerCase();
        return `;${versioningTables};`.indexOf(`;${tableName};`) > -1;
    }
}
