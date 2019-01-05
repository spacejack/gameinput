import GameInput, {GameInputInfo} from './GameInput'

export interface KeyInputInfo extends GameInputInfo {
	code: number
}

export default class KeyInput extends GameInput<'press' | 'release', KeyboardEvent> {
	code: number
	protected isPressed: boolean

	protected constructor (info: KeyInputInfo) {
		super(info)
		this.code = info.code
		this.isPressed = false
	}

	pressed() {
		return this.isPressed
	}

	value() {
		return this.pressed() ? 1 : 0
	}

	// override for types
	on (id: 'press' | 'release', cb: (event: KeyboardEvent) => void) {
		super.on(id, cb as any)
	}

	off (id: 'press' | 'release', cb: (event: KeyboardEvent) => void) {
		super.off(id, cb as any)
	}

	protected onKeyPress(e: KeyboardEvent) {
		if (this.isPressed) return
		this.isPressed = true
		this.emit('press', e)
	}

	protected onKeyRelease(e: KeyboardEvent) {
		if (!this.isPressed) return
		this.isPressed = false
		this.emit('release', e)
	}

	/** State of all keys indexed by key code */
	static readonly keyboardState = new Array<boolean>(256).fill(false)

	protected static keyInputs: KeyInput[] = []

	protected static onKeyDown (e: KeyboardEvent) {
		const code = e.keyCode
		if (!KeyInput.keyboardState[code]) {
			// this key state changed
			KeyInput.keyboardState[code] = true
			for (const ki of KeyInput.keyInputs) {
				if (ki.code === code) {
					ki.onKeyPress(e)
				}
			}
		}
	}

	protected static onKeyUp (e: KeyboardEvent) {
		const code = e.keyCode
		if (KeyInput.keyboardState[code]) {
			// this key state changed
			KeyInput.keyboardState[code] = false
			for (const ki of KeyInput.keyInputs) {
				if (ki.code === code) {
					ki.onKeyRelease(e)
				}
			}
		}
	}

	/**
	 * Add the global key event listeners.
	 */
	protected static addKeyListeners() {
		document.addEventListener('keydown', KeyInput.onKeyDown, true)
		document.addEventListener('keyup', KeyInput.onKeyUp, true)
	}

	/**
	 * Remove the global key event listeners.
	 */
	protected static removeKeyListeners() {
		document.removeEventListener('keyup', KeyInput.onKeyUp, true)
		document.removeEventListener('keydown', KeyInput.onKeyDown, true)
	}

	static listeningKeys() {
		return KeyInput.keyInputs.length > 0
	}

	static create (info: KeyInputInfo) {
		const ki = new KeyInput(info)
		KeyInput.keyInputs.push(ki)
		if (KeyInput.keyInputs.length === 1) {
			// First key being listened for, add global listeners
			KeyInput.addKeyListeners()
		}
		return ki
	}

	/** Cleanup this key listener */
	static destroy (ki: KeyInput) {
		const i = KeyInput.keyInputs.indexOf(ki)
		if (i < 0) {
			console.warn('KeyInput not found')
			return
		}
		KeyInput.keyInputs.splice(i, 1)
		if (KeyInput.keyInputs.length < 1) {
			// No more keys to listen for, remove global listeners
			KeyInput.removeKeyListeners()
		}
	}
}
