export declare const supported: boolean;
/**
 * Search for connected Gamepads.
 * This will update the `gamepads` and `connectedGamepads` arrays.
 */
export declare function searchGamepads(): ReadonlyArray<Gamepad | null>;
/** Throttled getGamepads, and returns a real array */
export declare function getGamepads(): ReadonlyArray<Gamepad | null>;
/**
 * Returns Gamepad list from the last poll
 */
export declare function getConnectedGamepads(): ReadonlyArray<Gamepad>;
/** Get a Gamepad by ID */
export declare function getGamepadById(id: string): Gamepad | undefined;
/** Get a Gamepad by index */
export declare function getGamepadByIndex(index: number): Gamepad | undefined;
/** Get the first Gamepad found */
export declare function getFirstGamepad(): Gamepad | undefined;
/** Listen for a gamepad event */
export declare function on(eventName: 'connectchange', fn: (gamepads: ReadonlyArray<Gamepad>) => void): boolean;
/** Stop listening for a gamepad event */
export declare function off(eventName: 'connectchange', fn: (gamepads: ReadonlyArray<Gamepad>) => void): boolean;
/**
 * Enable/disable constant listening for connect changes.
 * Pass no argument to get listening state.
 */
export declare function listen(enable?: boolean): boolean;
