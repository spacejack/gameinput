import GameInput from './GameInput'

export interface KeyInputListeners {
	keydown(e: KeyboardEvent): boolean | void
	keyup(e: KeyboardEvent): boolean | void
}

export default class KeyInput extends GameInput {
	code: number
	isPressed: boolean

	constructor (code: number) {
		super()
		this.code = code
		this.isPressed = false
	}

	pressed() {
		return this.isPressed
	}

	value() {
		return this.pressed() ? 1 : 0
	}

	/** State of all keys indexed by key code */
	static readonly keyboardState = new Array<boolean>(256).fill(false)

	protected static listeners: Partial<KeyInputListeners> = {
		keydown: undefined,
		keyup: undefined
	}

	protected static onKeyDown (e: KeyboardEvent) {
		const code = e.keyCode
		if (!KeyInput.keyboardState[code]) {
			// this key state changed
			KeyInput.keyboardState[code] = true
			if (KeyInput.listeners.keydown) {
				return KeyInput.listeners.keydown(e)
			}
		}
	}

	protected static onKeyUp (e: KeyboardEvent) {
		const code = e.keyCode
		if (KeyInput.keyboardState[code]) {
			KeyInput.keyboardState[code] = false
			if (KeyInput.listeners.keyup) {
				return KeyInput.listeners.keyup(e)
			}
		}
	}

	/**
	 * Add the global key event listeners.
	 * Required to handle keyboard events.
	 */
	static addKeyListeners (l: KeyInputListeners) {
		if (KeyInput.listeners.keydown || KeyInput.listeners.keyup) {
			console.warn("Key listeners already added.")
			return
		}
		KeyInput.listeners.keydown = l.keydown
		KeyInput.listeners.keyup = l.keyup
		document.addEventListener('keydown', KeyInput.onKeyDown, true)
		document.addEventListener('keyup', KeyInput.onKeyUp, true)
	}

	/**
	 * Remove the global key event listeners.
	 */
	static removeKeyListeners (l: KeyInputListeners) {
		if (!KeyInput.listeners.keydown) {
			console.warn("Key listeners were not yet added.")
			return
		}
		document.removeEventListener('keyup', KeyInput.onKeyUp, true)
		document.removeEventListener('keydown', KeyInput.onKeyDown, true)
		KeyInput.listeners.keyup = undefined
		KeyInput.listeners.keydown = undefined
	}

	static listeningKeys() {
		return !!KeyInput.listeners.keydown || KeyInput.listeners.keyup
	}
}
