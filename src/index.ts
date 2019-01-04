// Module to handle keyboard, mouse, touch events.
// Useful for games.

import GameInput from './GameInput'
import KeyInput from './KeyInput'
import {
	GpadInput, GpadInputAxis, GpadInputButton,
	GpadInputAxisInfo, GpadInputButtonInfo
} from './GpadInput'
import ElementInput from './ElementInput'

export type GameInputEventType = 'press' | 'release'

export type GameInputEventListener = (name: string) => void

interface GameInputListener {
	type: GameInputEventType, callback: GameInputEventListener
}

export interface GameInputGroupInfo {
	name: string
	keyCodes?: ReadonlyArray<number>
	gamepadControls?: ReadonlyArray<GpadInputAxisInfo | GpadInputButtonInfo>
	elements?: ReadonlyArray<Element>
}

/** Summarizes all device inputs for a single named input */
class GameInputGroup extends GameInput {
	name: string
	isPressed: boolean
	keys: KeyInput[]
	gpCtrls: (GpadInputAxis | GpadInputButton)[]
	elements: ElementInput[]
	listeners: Record<GameInputEventType, GameInputListener[]>

	constructor (info: GameInputGroupInfo) {
		super()
		this.name = name
		this.isPressed = false
		this.keys = info.keyCodes
			? info.keyCodes.map(code => new KeyInput(code))
			: []
		this.gpCtrls = info.gamepadControls
			? info.gamepadControls.map(i => GpadInput.create(i))
			: []
		this.elements = info.elements
			? info.elements.map(el => new ElementInput({
				element: el,
				onPress: this.onDevicePress,
				onRelease: this.onDeviceRelease
			}))
			: []
		this.listeners = {
			press: [],
			release: []
		}
	}

	value() {
		for (const key of this.keys) {
			if (KeyInput.keyboardState[key.code]) return 1
		}
		for (const el of this.elements) {
			if (el.pressed()) return 1
		}
		let v = 0
		for (const gpc of this.gpCtrls) {
			v = Math.max(v, gpc.value())
		}
		return v
	}

	pressed() {
		return this.isPressed
	}

	/** Find if a key associated with this input is pressed */
	keyPressed() {
		return this.keys.some(k => KeyInput.keyboardState[k.code])
	}

	gpadCtrlPressed() {
		return this.gpCtrls.some(gc => gc.pressed())
	}

	elementPressed() {
		return this.elements.some(el => el.pressed())
	}

	/**
	 * One of the devices for this input was pressed.
	 * Should we change the state of this input to pressed and alert listeners?
	 */
	onDevicePress = () => {
		if (this.isPressed) return
		this.isPressed = true
		for (const l of this.listeners.press) {
			l.callback(this.name)
		}
	}

	/**
	 * One of the devices for this input was released.
	 * Should we change the state of this input to released and alert listeners
	 * or are there still other pressed devices...
	 */
	onDeviceRelease = () => {
		if (!this.isPressed) return
		// Check if any other keys are down
		if (this.keyPressed()) return
		// Check if any elements are pressed
		if (this.elementPressed()) return
		// Or any gamepad controls are pressed
		if (this.gpadCtrlPressed()) return
		// No - so this input is truly released
		this.isPressed = false
		for (const l of this.listeners.release) {
			l.callback(this.name)
		}
	}
}

/** Dictionary of GameInputs indexed by name */
const inputs: {[name: string]: GameInputGroup} = Object.create(null)

function onKeyDown (e: KeyboardEvent) {
	for (const input of getInputsByKeyCode(e.keyCode)) {
		input.onDevicePress()
	}
}

function onKeyUp (e: KeyboardEvent) {
	for (const input of getInputsByKeyCode(e.keyCode)) {
		input.onDeviceRelease()
	}
}

/** Get all input(s) with key controls having a specific keyCode */
function getInputsByKeyCode (code: number): GameInputGroup[] {
	const inps: GameInputGroup[] = []
	for (const name of Object.keys(inputs)) {
		const input = inputs[name]
		const kcs = input.keys
		for (let j = 0; j < kcs.length; ++j) {
			if (kcs[j].code === code) {
				inps.push(input)
				break
			}
		}
	}
	return inps
}

/** Must poll to detect (gamepad) input press/release changes */
export function poll() {
	const inputNames = Object.keys(inputs)
	for (const name of inputNames) {
		const input = inputs[name]
		if (input.gpCtrls.some(gc => gc.pressed())) {
			input.onDevicePress()
		} else {
			input.onDeviceRelease()
		}
	}
}

/**
 * Creates a GameInputGroup associated with key code(s), gamepad control(s) and element(s).
 * This function returns nothing but you may then query input state or add listeners for this name.
 * If an input already exists with this name it will be replaced.
 */
export function create (info: GameInputGroupInfo) {
	const name = info.name
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid name for input.")
	}
	if (inputs[name]) {
		console.log(`Replacing input '${name}'`)
		destroy(name)
	}
	if (!KeyInput.listeningKeys() && info.keyCodes && info.keyCodes.length > 0) {
		KeyInput.addKeyListeners({
			keydown: onKeyDown,
			keyup: onKeyUp
		})
	}
	const input = new GameInputGroup(info)
	inputs[name] = input
}

/**
 * Destroys a GameInputGroup
 */
export function destroy (name: string) {
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid name for input.")
	}
	const input = inputs[name]
	if (!input) {
		return false
	}
	for (const ei of input.elements) {
		ei.removeListeners()
	}
	delete inputs[name]
	// If we've removed all inputs with keys, we can disable key listeners
	if (!KeyInput.listeningKeys()) {
		return // Not listening to keys, so exit
	}
	for (const n of Object.keys(inputs)) {
		const i = inputs[n]
		if (i.keys.length > 0) return
	}
	KeyInput.removeKeyListeners({
		keydown: onKeyDown, keyup: onKeyUp
	})
	return true
}

/**
 * Gets the pressed state of the named input
 */
export function pressed (name: string) {
	const i = inputs[name]
	return i ? i.pressed() : false
}

/**
 * Gets the current value of the named input
 */
export function value (name: string) {
	const i = inputs[name]
	return i ? i.value() : 0
}

/**
 * Get pressed states for all input names in the provided object
 */
export function getPressed<T extends string>(obj: Record<T, boolean>) {
	for (const name of Object.keys(obj) as T[]) {
		obj[name] = pressed(name)
	}
	return obj
}

/**
 * Get values for all input names in the provided object
 */
export function getValues<T extends string>(obj: Record<T, number>) {
	for (const name of Object.keys(obj) as T[]) {
		obj[name] = value(name)
	}
	return obj
}

/**
 * Attach an input listener callback.
 */
export function on (
	name: string, type: GameInputEventType, callback: GameInputEventListener
) {
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid input name.")
	}
	if (type !== 'press' && type !== 'release') {
		throw new Error("Invalid input event type.")
	}
	const input = inputs[name]
	if (!input) {
		throw new Error(`Input with name '${name}' not found.`)
	}
	if (input.listeners[type].some(l => l.type === type && l.callback === callback)) {
		console.warn("Already added this listener.")
		return
	}
	input.listeners[type].push({type, callback})
}

/**
 * Detach an input listener callback.
 */
export function off (
	name: string, type: GameInputEventType, callback: GameInputEventListener
) {
	const input = inputs[name]
	if (!input) {
		console.warn(`Input not found with name ${name}`)
	}
	const ls = input.listeners[type]
	for (let i = ls.length - 1; i >= 0; --i) {
		const l = ls[i]
		if (l.callback === callback) {
			ls.splice(i, 1)
			return
		}
	}
	console.warn(`Listener not found for input '${name}' with type ${type}, cannot remove.`)
}
