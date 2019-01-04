import GameInput from './GameInput';
export declare abstract class GpadInput extends GameInput {
    gamepadId: string;
    constructor(info: GpadInputButtonInfo | GpadInputAxisInfo);
    pressed(): boolean;
    static create(info: GpadInputButtonInfo | GpadInputAxisInfo): GpadInputAxis | GpadInputButton;
}
export interface GpadInputButtonInfo {
    type: 'button';
    gamepadId: string;
    buttonId: number;
}
export declare class GpadInputButton extends GpadInput implements GpadInputButtonInfo {
    type: 'button';
    buttonId: number;
    constructor(info: GpadInputButtonInfo);
    value(): number;
}
export interface GpadInputAxisInfo {
    type: 'axis';
    gamepadId: string;
    axisId: number;
    axisSign: -1 | 1;
}
export declare class GpadInputAxis extends GpadInput implements GpadInputAxisInfo {
    type: 'axis';
    axisId: number;
    axisSign: -1 | 1;
    constructor(info: GpadInputAxisInfo);
    value(): number;
}
