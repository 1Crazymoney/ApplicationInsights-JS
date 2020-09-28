/**
 * Utils.ts
 * @author Ram Thiru (ramthi) Hector Hernandez (hectorh) Krishna Yalamanchili(kryalama)
 * @copyright Microsoft 2018
 * File containing utility functions.
 */

import { CoreUtils, getWindow, getDocument, _InternalMessageId } from "@microsoft/applicationinsights-core-js";
import {
    IClickAnalyticsConfiguration, IRectangle
} from '../Interfaces/Datamodel';


const Prototype = 'prototype';

export const _ExtendedInternalMessageId = {
    ..._InternalMessageId,
    AuthHandShakeError: 501,
    AuthRedirectFail: 502,
    BrowserCannotReadLocalStorage: 503,
    BrowserCannotWriteLocalStorage: 504,
    BrowserDoesNotSupportLocalStorage: 505,
    CannotParseBiBlobValue: 506,
    CannotParseDataAttribute: 507,
    CVPluginNotAvailable: 508,
    DroppedEvent: 509,
    ErrorParsingAISessionCookie: 510,
    ErrorProvidedChannels: 511,
    FailedToGetCookies: 512,
    FailedToInitializeCorrelationVector: 513,
    FailedToInitializeSDK: 514,
    InvalidContentBlob: 515,
    InvalidCorrelationValue: 516,
    SessionRenewalDateIsZero: 517,
    SendPostOnCompleteFailure: 518,
    PostResponseHandler: 519
};

/**
 * Checks if document object is available
 */
export var isDocumentObjectAvailable: boolean = Boolean(getDocument());

/**
 * Checks if window object is available
 */
export var isWindowObjectAvailable: boolean = Boolean(getWindow());

/**
 * Finds attributes in overrideConfig which are invalid or should be objects
 * and deletes them. useful in override config
 * @param overrideConfig - override config object
 * @param attributeNamesExpectedObjects - attributes that should be objects in override config object
 */
export function _removeNonObjectsAndInvalidElements(overrideConfig: IClickAnalyticsConfiguration, attributeNamesExpectedObjects: Array<string>): void {
    _removeInvalidElements(overrideConfig);
    for (var i in attributeNamesExpectedObjects) {
        if (attributeNamesExpectedObjects.hasOwnProperty(i)) {
            var objectName = attributeNamesExpectedObjects[i];
            if (typeof overrideConfig[objectName] === 'object') {
                _removeInvalidElements(overrideConfig[objectName]);
            } else {
                delete overrideConfig[objectName];
            }
        }
    }
}

/**
 * Gets intersection area of two rectangles
 * and deletes them. useful in override config
 * @param  rect1 - object containing top, left, right, and bottom numbers
 * @param  rect2 - object containing top, left, right, and bottom numbers
 * @returns Intersection area in px^2
 */
export function _getIntersectionArea(rect1: IRectangle, rect2: IRectangle): number {
    var x11 = rect1.left,
        y11 = rect1.top,
        x12 = rect1.right,
        y12 = rect1.bottom,
        x21 = rect2.left,
        y21 = rect2.top,
        x22 = rect2.right,
        y22 = rect2.bottom;

    var x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
    var y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));

    return x_overlap * y_overlap;
} 

/**
 * Determines if an element is currently visible to the user
 * @param element - element to check for visibility
 * @param viewportBoundingRect - Viewport bounding rectangle
 * @returns true if element is truly visible
 */
export function _isElementTrulyVisible(element: Element, viewportBoundingRect: IRectangle) {
    

    var rect = element.getBoundingClientRect();

    var intersectionArea = _getIntersectionArea(rect, viewportBoundingRect);

    if (intersectionArea > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Finds attributes in object which are invalid 
 * and deletes them. useful in override config
 * @param object Input object
 */
export function _removeInvalidElements(object: Object): void {
    /// Because the config object 'callback' contains only functions, 
    /// when it is stringified it returns the empty object. This explains
    /// the workaround regarding 'callback'
    for (var property in object) {
        if (!isValueAssigned(object[property]) ||
            (JSON.stringify(object[property]) === '{}' && (property !== 'callback'))) {
            delete object[property];
        }
    }
}

/**
 * Checks if value is assigned to the given param.
 * @param value - The token from which the tenant id is to be extracted.
 * @returns True/false denoting if value is assigned to the param.
 */
export function isValueAssigned(value: any) {
    /// <summary> takes a value and checks for undefined, null and empty string </summary>
    /// <param type="any"> value to be tested </param>
    /// <returns> true if value is null undefined or emptyString </returns>
    return !(CoreUtils.isNullOrUndefined(value) || value === '');
}

/**
 * Determines whether an event is a right click or not 
 * @param evt - Mouse event 
 * @returns true if the event is a right click 
 */
export function _isRightClick(evt: any): boolean {
    if ('which' in evt) { // Chrome, FF, ...
        return (evt.which === 3);
    } else if ('button' in evt) { // IE, ...
        return (evt.button === 2);
    }
}

/**
 * Determines whether an event is a left click or not 
 * @param evt - Mouse event 
 * @returns true if the event is a left click 
 */
export function _isLeftClick(evt: any): boolean {
    if ('which' in evt) { // Chrome, FF, ...
        return (evt.which === 1);
    } else if ('button' in evt) { // IE, ...
        return (evt.button === 1);
    }
}

/**
 * Determines whether an event is a middle click or not 
 * @param evt - Mouse event 
 * @returns true if the event is a middle click 
 */
export function _isMiddleClick(evt: any): boolean {
    if ('which' in evt) { // Chrome, FF, ...
        return (evt.which === 2);
    } else if ('button' in evt) { // IE, ...
        return (evt.button === 4);
    }
}

/**
 *  Determines whether an event is a keyboard enter or not
 * @param evt - Keyboard event 
 * @returns true if the event is a keyboard enter
 */
export function _isKeyboardEnter(evt: KeyboardEvent): boolean {
    if ('keyCode' in evt) { // Chrome, FF, ...
        return (evt.keyCode === 13);
    }
}

/**
 *  Determines whether an event is a keyboard space or not
 * @param evt - Keyboard event 
 * @returns true if the event is a space enter
 */
export function _isKeyboardSpace(evt: KeyboardEvent) {
    if ('keyCode' in evt) { // Chrome, FF, ...
        return (evt.keyCode === 32);
    }
}

/**
 *  Determines whether the elemt have a DNT(Do Not Track) tag
 * @param element - DOM element
 * @param doNotTrackFieldName - DOM element
 * @returns true if the element must not be tarcked
 */
export function _isElementDnt(element: Element, doNotTrackFieldName: string): boolean {
    var dntElement = _findClosestByAttribute(element, doNotTrackFieldName);
    if (!isValueAssigned(dntElement)) {
        return false;
    }
    return true;
}

/**
 * Walks up DOM tree to find element with attribute 
 * @param el - DOM element
 * @param attribute - Attribute name 
 * @returns Dom element which contains attribute
 */
export function _findClosestByAttribute(el: Element, attribute: string): Element {
    return _walkUpDomChainWithElementValidation(el, _isAttributeInElement, attribute);
}

/**
 * checks if attribute is in element.
 * method checks for empty string, in case the attribute is set but no value is assigned to it
 * @param element - DOM element
 * @param attributeToLookFor - Attribute name 
 * @returns true if attribute is in element, even if empty string
 */
export function _isAttributeInElement(element: Element, attributeToLookFor: string): Boolean {
    var value = element.getAttribute(attributeToLookFor);
    return isValueAssigned(value) || value === '';
}

/**
 * Walks up DOM tree to find element which matches validationMethod
 * @param el - DOM element
 * @param validationMethod - DOM element validation method
 * @param validationMethodParam - DOM element validation method parameters
 * @returns Dom element which is an anchor
 */
export function _walkUpDomChainWithElementValidation(el: Element, validationMethod: Function, validationMethodParam?: any): Element {
    var element = el;
    if (element) {
        while (!validationMethod(element, validationMethodParam)) {
            element = <Element>element.parentNode;
            if (!element || !(element.getAttribute)) {
                return null;
            }
        }
        return element;
    }
}

/**
 * Determine if DOM element is an anchor
 * @param element - DOM element
 * @returns Is element an anchor
 */
export function _isElementAnAnchor(element: Element): boolean {
    return element.nodeName === 'A';
}

/**
 * Walks up DOM tree to find anchor element 
 * @param element - DOM element
 * @returns Dom element which is an anchor
 */
export function _findClosestAnchor(element: Element): Element {
    /// <summary> Walks up DOM tree to find anchor element </summary>
    /// <param type='object'> DOM element </param>
    /// <returns> Dom element which is an anchor</returns>

    return _walkUpDomChainWithElementValidation(element, _isElementAnAnchor);
}

/**
 * Returns the specified field and also removes the property from the object if exists.
 * @param obj - Input object
 * @param fieldName - >Name of the field/property to be extracted
 * @returns Value of the specified tag
 */
export function _extractFieldFromObject(obj: Object, fieldName: string): string {
    var fieldValue: any;
    if (obj && obj[fieldName]) {
        fieldValue = obj[fieldName];
        delete obj[fieldName];
    }

    return fieldValue;
}

/**
 *  Adds surrounding square brackets to the passed in text
 * @param str - Input string
 * @returns String with surrounding brackets
 */
export function _bracketIt(str: string): string {
    /// <summary>
    ///  Adds surrounding square brackets to the passed in text
    /// </summary>
    return '[' + str + ']';
}

/**
 * Pass in the objects to merge as arguments.
 * @param obj1 - object to merge.  Set this argument to 'true' for a deep extend.
 * @param obj2 - object to merge.
 * @param obj3 - object to merge.
 * @param obj4 - object to merge.
 * @param obj5 - object to merge.
 * @returns The extended object.
 */
export function extend(obj?: any, obj2?: any, obj3?: any, obj4?: any, obj5?: any): any {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    var objProto = Object[Prototype];
    var theArgs = arguments;

    // Check if a deep merge
    if (objProto.toString.call(theArgs[0]) === '[object Boolean]') {
        deep = theArgs[0];
        i++;
    }

    // Merge the object into the extended object
    var merge = function (obj: Object) {
        for (var prop in obj) {
            if (CoreUtils.hasOwnProperty(obj, prop)) {
                // If deep merge and property is an object, merge properties
                if (deep && objProto.toString.call(obj[prop]) === '[object Object]') {
                    extended[prop] = extend(true, extended[prop], obj[prop]);
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for (; i < length; i++) {
        var obj = theArgs[i];
        merge(obj);
    }

    return extended;

}

/**
 *  Get viewport bounding dimensions
 * @param viewportDimensions Dimensions of the viewport
 * @returns Returns viewport bounding rect
 */
export function _getViewportBoundingRect(viewportDimensions: any): IRectangle {
    var viewportBoundingRect: IRectangle = {
        top: 0,
        bottom: viewportDimensions.h,
        left: 0,
        right: viewportDimensions.w
    };
    return viewportBoundingRect;
}

/**
 * Use window dimensions if available before reaching into DOM.
 * Accessing DOM frequently causes layout to reflow and impacts perf.
 * @returns Returns a Viewport object that contains dimensions of the current viewport
 * @description When this is executed from within an iFrame, the dimensions would be that of the iFrame and not the browser window.
 */
export function _getViewportDimensions() {
    var viewport = { h: 0, w: 0 };
    let win = getWindow();
    let doc = getDocument();
    if (win && doc && win.screen) {
        let body:HTMLElement = doc.body || <HTMLElement>{};
        let docElem:HTMLElement = doc.documentElement || <HTMLElement>{};
        viewport.h = win.innerHeight || body.clientHeight || docElem.clientHeight;
        viewport.w = win.innerWidth || body.clientWidth || docElem.clientWidth;
    }

    return viewport;
}