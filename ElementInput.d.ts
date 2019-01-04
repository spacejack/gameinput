import GameInput from './GameInput';
export interface ElementListenerSet {
    mousedown: EventListener;
    mouseup: EventListener;
    touchstart: EventListener;
    touchmove: EventListener;
    touchend: EventListener;
}
export interface ElementInputInfo {
    element: Element;
    onPress?(): void;
    onRelease?(): void;
}
declare type Device = 0 | 1 | 2;
export default class ElementInput extends GameInput {
    isPressed: boolean;
    device: Device;
    element: Element;
    callbacks: {
        onPress?(): void;
        onRelease?(): void;
    };
    listeners: ElementListenerSet;
    constructor(info: ElementInputInfo);
    onPressElement(device: Device): void;
    onReleaseElement(device: number): void;
    pressed(): boolean;
    value(): 1 | 0;
    /** Should call this when this input is destroyed */
    removeListeners(): void;
}
export declare const config: {
    iOSHacks: boolean;
};
/**
 * iOS Hack utility - prevents events on the given element
 */
export declare function snuffiOSEvents(el: Element): void;
export {};
