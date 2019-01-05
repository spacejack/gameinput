import GameInput, { GameInputInfo } from './GameInput';
export declare abstract class GpadInput extends GameInput<'press' | 'release'> {
    gamepadId: string;
    protected isPressed: boolean;
    constructor(info: GpadInputButtonInfo | GpadInputAxisInfo);
    pressed(): boolean;
    /** Must be polled to discover events */
    poll(): void;
    static create(info: GpadInputButtonInfo | GpadInputAxisInfo): GpadInputAxis | GpadInputButton;
}
export interface GpadInputButtonInfo extends GameInputInfo {
    type: 'button';
    gamepadId: string;
    buttonId: number;
}
export declare class GpadInputButton extends GpadInput {
    type: 'button';
    buttonId: number;
    constructor(info: GpadInputButtonInfo);
    value(): number;
}
export interface GpadInputAxisInfo extends GameInputInfo {
    type: 'axis';
    gamepadId: string;
    axisId: number;
    axisSign: -1 | 1;
}
export declare class GpadInputAxis extends GpadInput {
    type: 'axis';
    axisId: number;
    axisSign: -1 | 1;
    constructor(info: GpadInputAxisInfo);
    value(): number;
}
