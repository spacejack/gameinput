import { GpadInputAxisInfo, GpadInputButtonInfo } from './GpadInput';
export declare type GameInputEventType = 'press' | 'release';
export declare type GameInputEventListener = (name: string) => void;
export interface GameInputGroupInfo {
    name: string;
    keyCodes?: ReadonlyArray<number>;
    gamepadControls?: ReadonlyArray<GpadInputAxisInfo | GpadInputButtonInfo>;
    elements?: ReadonlyArray<Element>;
}
/** Must poll to detect (gamepad) input press/release changes */
export declare function poll(): void;
/**
 * Creates a GameInputGroup associated with key code(s), gamepad control(s) and element(s).
 * This function returns nothing but you may then query input state or add listeners for this name.
 * If an input already exists with this name it will be replaced.
 */
export declare function create(info: GameInputGroupInfo): void;
/**
 * Destroys a GameInputGroup
 */
export declare function destroy(name: string): boolean | undefined;
/**
 * Gets the pressed state of the named input
 */
export declare function pressed(name: string): boolean;
/**
 * Gets the current value of the named input
 */
export declare function value(name: string): number;
/**
 * Get pressed states for all input names in the provided object
 */
export declare function getPressed<T extends string>(obj: Record<T, boolean>): Record<T, boolean>;
/**
 * Get values for all input names in the provided object
 */
export declare function getValues<T extends string>(obj: Record<T, number>): Record<T, number>;
/**
 * Attach an input listener callback.
 */
export declare function on(name: string, type: GameInputEventType, callback: GameInputEventListener): void;
/**
 * Detach an input listener callback.
 */
export declare function off(name: string, type: GameInputEventType, callback: GameInputEventListener): void;
