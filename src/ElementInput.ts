import GameInput from './GameInput'

export interface ElementListenerSet {
	mousedown: EventListener
	//onmousemove: EventListener
	mouseup: EventListener
	touchstart: EventListener
	touchmove: EventListener
	touchend: EventListener
}

export interface ElementInputInfo {
	element: Element
	onPress?(): void
	onRelease?(): void
}

type Device = 0 | 1 | 2

const DEVICE_NONE  = 0
const DEVICE_MOUSE = 1
const DEVICE_TOUCH = 2

export default class ElementInput extends GameInput {
	isPressed: boolean
	device: Device
	element: Element
	callbacks: {
		onPress?(): void
		onRelease?(): void
	}
	listeners: ElementListenerSet

	constructor (info: ElementInputInfo) {
		super()
		this.isPressed = false
		this.device = DEVICE_NONE
		this.element = info.element
		this.callbacks = {
			onPress: info.onPress,
			onRelease: info.onRelease
		}
		this.listeners = {
			mousedown: () => {
				this.onPressElement(DEVICE_MOUSE)
			},
			mouseup: () => {
				this.onReleaseElement(DEVICE_MOUSE)
			},
			touchstart: () => {
				this.onPressElement(DEVICE_TOUCH)
			},
			touchend: () => {
				this.onReleaseElement(DEVICE_TOUCH)
			},
			touchmove: e => {
				// Prevent dragging of this element
				e.preventDefault()
			}
		}
		// Prevent unwanted iOS events
		snuffiOSEvents(this.element)
		// Add the mouse/touch listeners to the element
		for (const key of Object.keys(this.listeners) as (keyof ElementListenerSet)[]) {
			this.element.addEventListener(key, this.listeners[key])
		}
	}

	onPressElement (device: Device) {
		if (this.device !== DEVICE_NONE && this.device !== device) return
		this.device = device
		this.isPressed = true
		this.callbacks.onPress && this.callbacks.onPress()
	}

	onReleaseElement (device: number) {
		if (this.device !== DEVICE_NONE && this.device !== device) return
		this.isPressed = false
		setTimeout(() => {
			// iOS will fire a delayed mouse event after touchend.
			// Delaying the device reset will ignore that mouse event.
			this.device = DEVICE_NONE
		}, 500)
		this.callbacks.onRelease && this.callbacks.onRelease()
	}

	pressed() {
		return this.isPressed
	}

	value() {
		return this.isPressed ? 1.0 : 0
	}

	/** Should call this when this input is destroyed */
	removeListeners() {
		for (const key of Object.keys(this.listeners) as (keyof ElementListenerSet)[]) {
			this.element.removeEventListener(key, this.listeners[key])
		}
	}
}

const isIOS = !!navigator.userAgent.match(/iPhone|iPad|iPod/i)

/** iOS troublesome events to prevent */
const IOS_SNUFF_EVENTS = ['dblclick']

export const config = {
	iOSHacks: true
}

/**
 * iOS Hack utility - prevents events on the given element
 */
export function snuffiOSEvents (el: Element) {
	if (!isIOS || !config.iOSHacks) return
	IOS_SNUFF_EVENTS.forEach(name => {
		el.addEventListener(name, e => {e.preventDefault()})
	})
}
