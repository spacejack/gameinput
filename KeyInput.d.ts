import GameInput from './GameInput';
export interface KeyInputListeners {
    keydown(e: KeyboardEvent): boolean | void;
    keyup(e: KeyboardEvent): boolean | void;
}
export default class KeyInput extends GameInput {
    code: number;
    isPressed: boolean;
    constructor(code: number);
    pressed(): boolean;
    value(): 1 | 0;
    /** State of all keys indexed by key code */
    static readonly keyboardState: boolean[];
    protected static listeners: Partial<KeyInputListeners>;
    protected static onKeyDown(e: KeyboardEvent): boolean | void;
    protected static onKeyUp(e: KeyboardEvent): boolean | void;
    /**
     * Add the global key event listeners.
     * Required to handle keyboard events.
     */
    static addKeyListeners(l: KeyInputListeners): void;
    /**
     * Remove the global key event listeners.
     */
    static removeKeyListeners(l: KeyInputListeners): void;
    static listeningKeys(): true | ((e: KeyboardEvent) => boolean | void) | undefined;
}
