import GameInput, { GameInputInfo } from './GameInput';
export interface KeyInputInfo extends GameInputInfo {
    code: number;
}
export default class KeyInput extends GameInput<'press' | 'release', KeyboardEvent> {
    code: number;
    protected isPressed: boolean;
    protected constructor(info: KeyInputInfo);
    pressed(): boolean;
    value(): 1 | 0;
    on(id: 'press' | 'release', cb: (event: KeyboardEvent) => void): void;
    off(id: 'press' | 'release', cb: (event: KeyboardEvent) => void): void;
    protected onKeyPress(e: KeyboardEvent): void;
    protected onKeyRelease(e: KeyboardEvent): void;
    /** State of all keys indexed by key code */
    static readonly keyboardState: boolean[];
    protected static keyInputs: KeyInput[];
    protected static onKeyDown(e: KeyboardEvent): void;
    protected static onKeyUp(e: KeyboardEvent): void;
    /**
     * Add the global key event listeners.
     */
    protected static addKeyListeners(): void;
    /**
     * Remove the global key event listeners.
     */
    protected static removeKeyListeners(): void;
    static listeningKeys(): boolean;
    static create(info: KeyInputInfo): KeyInput;
    /** Cleanup this key listener */
    static destroy(ki: KeyInput): void;
}
