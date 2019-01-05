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

interface GameInputListenerDict {
	press: Record<string, GameInputEventListener[]>
	release: Record<string, GameInputEventListener[]>
}

export interface GameInputGroupInfo {
	name: string
	keyCodes?: ReadonlyArray<number>
	gamepadControls?: ReadonlyArray<GpadInputAxisInfo | GpadInputButtonInfo>
	elements?: ReadonlyArray<Element>
}

/** Summarizes all device inputs for a single named input */
class GameInputGroup extends GameInput<'press' | 'release'> {
	name: string
	keys: KeyInput[]
	gpCtrls: (GpadInputAxis | GpadInputButton)[]
	elements: ElementInput[]
	protected isPressed: boolean

	constructor (info: GameInputGroupInfo) {
		super()
		this.name = info.name
		this.isPressed = false
		this.keys = info.keyCodes
			? info.keyCodes.map(code => {
				const ki = KeyInput.create({
					code,
					onPress: this.onDevicePress,
					onRelease: this.onDeviceRelease
				})
				return ki
			})
			: []
		this.gpCtrls = info.gamepadControls
			? info.gamepadControls.map(i => GpadInput.create({
				...i,
				onPress: this.onDevicePress,
				onRelease: this.onDeviceRelease
			}))
			: []
		this.elements = info.elements
			? info.elements.map(el => new ElementInput({
				element: el,
				onPress: this.onDevicePress,
				onRelease: this.onDeviceRelease
			}))
			: []
	}

	value() {
		if (this.keys.some(k => k.pressed())) return 1
		if (this.elements.some(el => el.pressed())) return 1
		return this.gpCtrls.reduce((max, c) => Math.max(max, c.value()), 0)
	}

	pressed() {
		return this.isPressed
	}

	/** Scan for just this type of input */
	keyPressed() {
		return this.keys.some(k => k.pressed())
	}

	gpadCtrlPressed() {
		return this.gpCtrls.some(gc => gc.pressed())
	}

	elementPressed() {
		return this.elements.some(el => el.pressed())
	}

	/** Freshly computed value for isPressed */
	anyPressed() {
		return this.keyPressed() || this.gpadCtrlPressed() || this.elementPressed()
	}

	/**
	 * One of the devices for this input was pressed.
	 * Should we change the state of this input to pressed and alert listeners?
	 */
	protected onDevicePress = () => {
		if (this.isPressed) return
		this.isPressed = true
		// Notify any listeners of pressed event
		const listeners = inputListeners.press[this.name]
		if (!listeners) return
		for (const f of listeners) {
			f(this.name)
		}
	}

	/**
	 * One of the devices for this input was released.
	 * Should we change the state of this input to released and alert listeners
	 * or are there still other pressed devices...
	 */
	protected onDeviceRelease = () => {
		if (!this.isPressed) return
		// Check if any devices remain pressed
		if (this.anyPressed()) return
		// No - so this input is truly released
		this.isPressed = false
		// Notify any listeners of released event
		const listeners = inputListeners.release[this.name]
		if (!listeners) return
		for (const f of listeners) {
			f(this.name)
		}
	}
}

/** Dictionary of GameInputGroups indexed by name */
const inputs: {[name: string]: GameInputGroup} = Object.create(null)

/** Dictionary of GameInputGroup listeners */
const inputListeners: GameInputListenerDict = {
	press: Object.create(null),
	release: Object.create(null)
}

/** Get all input(s) with key controls having a specific keyCode */
function getInputsByKeyCode (code: number): GameInputGroup[] {
	return Object.keys(inputs).reduce<GameInputGroup[]>((inps, name) => {
		if (inputs[name].keys.some(key => key.code === code)) {
			inps.push(inputs[name])
		}
		return inps
	}, [])
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
	const input = new GameInputGroup(info)
	inputs[name] = input
}

/**
 * Destroys a GameInputGroup
 */
export function destroy (name: string): boolean {
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid name for input.")
	}
	const input = inputs[name]
	if (!input) {
		return false
	}
	for (const ei of input.elements) {
		ei.destroy()
	}
	for (const ki of input.keys) {
		KeyInput.destroy(ki)
	}
	delete inputs[name]
	return true
}

/** Must poll to detect (gamepad) input press/release changes */
export function poll() {
	const inputNames = Object.keys(inputs)
	for (const name of inputNames) {
		const input = inputs[name]
		for (const gp of input.gpCtrls) {
			gp.poll()
		}
	}
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
 * Add an input listener.
 */
export function on (
	name: string, type: GameInputEventType, listener: GameInputEventListener
) {
	// Be a helpful public API
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid input name.")
	}
	if (type !== 'press' && type !== 'release') {
		throw new Error("Invalid input event type.")
	}
	if (!inputs[name]) {
		console.warn(`Adding ${type} listener for input '${name}' which doesn't exist (yet?)`)
	}
	// Add to the listener dictionary
	let list = inputListeners[type][name]
	if (!list) {
		inputListeners[type][name] = list = []
	} else {
		if (list.some(l => l === listener)) {
			console.warn(`Already added this ${type} listener for input name: ${name}`)
			return
		}
	}
	list.push(listener)
}

/**
 * Remove an input listener.
 */
export function off (
	name: string, type: GameInputEventType, listener: GameInputEventListener
) {
	// Be a helpful public API
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid input name.")
	}
	if (type !== 'press' && type !== 'release') {
		throw new Error("Invalid input event type.")
	}
	// Remove from listener dictionary
	const list = inputListeners[type][name]
	if (!list) {
		console.warn(`${type} listener not found for input name: ${name}`)
		return
	}
	const i = list.indexOf(listener)
	if (i < 0) {
		console.warn(`${type} listener not found for input name: ${name}`)
		return
	}
	list.splice(i, 1)
}
