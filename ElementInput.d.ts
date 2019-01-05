import GameInput, { GameInputInfo } from './GameInput';
export interface ElementListenerSet {
    mousedown: EventListener;
    mouseup: EventListener;
    touchstart: EventListener;
    touchmove: EventListener;
    touchend: EventListener;
}
export interface ElementInputInfo extends GameInputInfo {
    element: Element;
}
declare type Device = 0 | 1 | 2;
export default class ElementInput extends GameInput<'press' | 'release'> {
    element: Element;
    protected isPressed: boolean;
    protected device: Device;
    protected devListeners: ElementListenerSet;
    constructor(info: ElementInputInfo);
    pressed(): boolean;
    value(): 1 | 0;
    /** Should call this when this input is destroyed */
    destroy(): void;
    protected onPressElement(device: Device): void;
    protected onReleaseElement(device: number): void;
}
export declare const config: {
    /** Change this before creating ElementInputs to disable iOS special handling */
    iOSSpecial: boolean;
};
export {};
