/**
 * Angular.ts
 * @copyright Microsoft 2019
 */

import {
    IConfig, IPageViewTelemetry, IMetricTelemetry, IAppInsights, IEventTelemetry, IExceptionTelemetry
} from "@microsoft/applicationinsights-common";
import {
    IPlugin, IConfiguration, IAppInsightsCore,
    ITelemetryPlugin, BaseTelemetryPlugin, CoreUtils, ITelemetryItem, ITelemetryPluginChain,
    IProcessTelemetryContext, _InternalMessageId, LoggingSeverity, ICustomProperties
} from "@microsoft/applicationinsights-core-js";
import { IAngularExtensionConfig } from './Interfaces/IAngularExtensionConfig';

const NAVIGATIONEND = "NavigationEnd";

export default class AngularPlugin extends BaseTelemetryPlugin {
    public priority = 186;
    public identifier = 'AngularPlugin';

    private _analyticsPlugin: IAppInsights;

    initialize(config: IConfiguration & IConfig, core: IAppInsightsCore, extensions: IPlugin[], pluginChain?:ITelemetryPluginChain) {
        super.initialize(config, core, extensions, pluginChain);
        let ctx = this._getTelCtx();
        let extConfig = ctx.getExtCfg<IAngularExtensionConfig>(this.identifier, { router: null });
        CoreUtils.arrForEach(extensions, ext => {
            const identifier = (ext as ITelemetryPlugin).identifier;
            if (identifier === 'ApplicationInsightsAnalytics') {
                this._analyticsPlugin = (ext as any) as IAppInsights;
            }
        });
        if (extConfig.router) {
            let isPageInitialLoad = true;
            if (isPageInitialLoad) {
                const pageViewTelemetry: IPageViewTelemetry = {
                    uri: extConfig.router.url
                };
                this.trackPageView(pageViewTelemetry);
            }
            extConfig.router.events.subscribe(event => {
                if (event.constructor.name === NAVIGATIONEND) {
                    // for page initial load, do not call trackPageView twice
                    if (isPageInitialLoad) {
                        isPageInitialLoad = false;
                        return;
                    }
                    const pageViewTelemetry: IPageViewTelemetry = { uri: extConfig.router.url };
                    this.trackPageView(pageViewTelemetry);
                }
            });
        }
    }

    /**
     * Add Part A fields to the event
     * @param event The event that needs to be processed
     */
    processTelemetry(event: ITelemetryItem, itemCtx?: IProcessTelemetryContext) {
        this.processNext(event, itemCtx);
    }

    trackMetric(metric: IMetricTelemetry, customProperties: ICustomProperties) {
        if (this._analyticsPlugin) {
            this._analyticsPlugin.trackMetric(metric, customProperties);
        } else {
            this.diagLog().throwInternal(
                LoggingSeverity.CRITICAL, _InternalMessageId.TelemetryInitializerFailed, "Analytics plugin is not available, Angular plugin telemetry will not be sent: ");
        }
    }

    trackPageView(pageView: IPageViewTelemetry) {
        if (this._analyticsPlugin) {
            this._analyticsPlugin.trackPageView(pageView);
        } else {
            this.diagLog().throwInternal(
                LoggingSeverity.CRITICAL, _InternalMessageId.TelemetryInitializerFailed, "Analytics plugin is not available, Angular plugin telemetry will not be sent: ");
        }
    }

    trackEvent(event: IEventTelemetry, customProperties?: ICustomProperties) {
        if (this._analyticsPlugin) {
            this._analyticsPlugin.trackEvent(event, customProperties);
        } else {
            this.diagLog().throwInternal(
                LoggingSeverity.CRITICAL, _InternalMessageId.TelemetryInitializerFailed, "Analytics plugin is not available, React plugin telemetry will not be sent: ");
        }
    }

    // trackException(exception: IExceptionTelemetry, customProperties?: {
    //     [key: string]: any;
    // }) {
    //     if (this._analyticsPlugin) {
    //         this._analyticsPlugin.trackException(exception, customProperties);
    //     } else {
    //         this.diagLog().throwInternal(
    //             LoggingSeverity.CRITICAL, _InternalMessageId.TelemetryInitializerFailed, "Analytics plugin is not available, React plugin telemetry will not be sent: ");
    //     }
    // };
}
