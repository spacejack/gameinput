// Helper/wrapper for browser Gamepad API

export const supported = typeof navigator !== 'undefined' && !!navigator.getGamepads //|| !!navigator['webkitGetGamepads']

let gamepads: (Gamepad | null)[] = []
let connectedGamepads: Gamepad[] = []

/** Counter/flag to throttle getGamepads to once/RAF */
let numSearches = 0

/** Only warn unsupported once */
let unsupportedWarningLogged = false

/** List of event listeners */
const connectListeners: ((gamepads: ReadonlyArray<Gamepad>) => void)[] = []
/** Used for internal listener */
let connectListener: ((gamepads: ReadonlyArray<Gamepad>) => void) | undefined

/**
 * Search for connected Gamepads.
 * This will update the `gamepads` and `connectedGamepads` arrays.
 */
export function searchGamepads(): ReadonlyArray<Gamepad | null> {
	if (supported) {
		gamepads = Array.from(navigator.getGamepads()) //.filter(gp => !!gp) as Gamepad[]
		connectedGamepads = gamepads.filter(gp => gp != null) as Gamepad[]
	} else {
		if (!unsupportedWarningLogged) {
			console.warn("Gamepad unsupported")
			unsupportedWarningLogged = true
		}
		gamepads = []
		connectedGamepads = []
	}

	//  Gamepad API not found
	return gamepads
}

/** Throttled getGamepads, and returns a real array */
export function getGamepads(): ReadonlyArray<Gamepad | null> {
	if (numSearches > 0) {
		// Already searched this frame
		return gamepads
	}
	searchGamepads()
	numSearches = 1
	Promise.resolve().then(() => {numSearches = 0})
	return gamepads
}

/**
 * Returns Gamepad list from the last poll
 */
export function getConnectedGamepads(): ReadonlyArray<Gamepad> {
	if (numSearches > 0) {
		// Already searched this frame
		return connectedGamepads
	}
	searchGamepads()
	numSearches = 1
	Promise.resolve().then(() => {numSearches = 0})
	return connectedGamepads
}

/** Get a Gamepad by ID */
export function getGamepadById (id: string) {
	return getConnectedGamepads().find(gp => gp.id === id)
}

/** Get a Gamepad by index */
export function getGamepadByIndex (index: number) {
	getConnectedGamepads()
	return gamepads[index] || undefined
}

/** Get the first Gamepad found */
export function getFirstGamepad(): Gamepad | undefined {
	return getConnectedGamepads()[0] || undefined
}

function onGamepadConnectChange (e: GamepadEvent) {
	searchGamepads()
	for (const cb of connectListeners) {
		cb(connectedGamepads)
	}
}

/** Listen for a gamepad event */
export function on (
	eventName: 'connectchange', fn: (gamepads: ReadonlyArray<Gamepad>) => void
) {
	const i = connectListeners.indexOf(fn)
	if (i >= 0) return false
	connectListeners.push(fn)
	if (connectListeners.length === 1) {
		// Starting new list - add global listeners
		window.addEventListener('gamepadconnected', onGamepadConnectChange as EventListener)
		window.addEventListener('gamepaddisconnected', onGamepadConnectChange as EventListener)
	}
	return true
}

/** Stop listening for a gamepad event */
export function off (
	eventName: 'connectchange', fn: (gamepads: ReadonlyArray<Gamepad>) => void
) {
	const i = connectListeners.indexOf(fn)
	if (i < 0) return false
	connectListeners.splice(i, 1)
	if (connectListeners.length === 0) {
		// List is now empty, remove global listeners
		window.removeEventListener('gamepadconnected', onGamepadConnectChange as EventListener)
		window.removeEventListener('gamepaddisconnected', onGamepadConnectChange as EventListener)
	}
	return true
}

/**
 * Enable/disable constant listening for connect changes.
 * Pass no argument to get listening state.
 */
export function listen (enable?: boolean) {
	if (enable == null || enable === !!connectListener) {
		return !!connectListener
	}
	if (connectListener) {
		off('connectchange', connectListener)
		connectListener = undefined
	} else {
		connectListener = () => {}
		on('connectchange', connectListener)
	}
	return !!connectListener
}
