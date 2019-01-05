import GameInput, {GameInputInfo} from './GameInput'

export interface ElementListenerSet {
	mousedown: EventListener
	//onmousemove: EventListener
	mouseup: EventListener
	touchstart: EventListener
	touchmove: EventListener
	touchend: EventListener
}

export interface ElementInputInfo extends GameInputInfo {
	element: Element
}

type Device = 0 | 1 | 2

const DEVICE_NONE  = 0
const DEVICE_MOUSE = 1
const DEVICE_TOUCH = 2

export default class ElementInput extends GameInput<'press' | 'release'> {
	element: Element
	protected isPressed: boolean
	protected device: Device
	protected devListeners: ElementListenerSet

	constructor (info: ElementInputInfo) {
		super(info)
		this.element = info.element
		this.isPressed = false
		this.device = DEVICE_NONE
		this.devListeners = {
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
			this.element.addEventListener(key, this.devListeners[key])
		}
	}

	pressed() {
		return this.isPressed
	}

	value() {
		return this.isPressed ? 1 : 0
	}

	/** Should call this when this input is destroyed */
	destroy() {
		for (const key of Object.keys(this.listeners) as (keyof ElementListenerSet)[]) {
			this.element.removeEventListener(key, this.devListeners[key])
		}
		unSnuffiOSEvents(this.element)
	}

	protected onPressElement (device: Device) {
		if (this.device !== DEVICE_NONE && this.device !== device) return
		this.device = device
		this.isPressed = true
		this.emit('press')
	}

	protected onReleaseElement (device: number) {
		if (this.device !== DEVICE_NONE && this.device !== device) return
		this.isPressed = false
		setTimeout(() => {
			// iOS will fire a delayed mouse event after touchend.
			// Delaying the device reset will ignore that mouse event.
			this.device = DEVICE_NONE
		}, 500)
		this.emit('release')
	}
}

const isIOS = !!navigator.userAgent.match(/iPhone|iPad|iPod/i)

/** iOS troublesome events to prevent */
const IOS_SNUFF_EVENTS = ['dblclick']

export const config = {
	/** Change this before creating ElementInputs to disable iOS special handling */
	iOSSpecial: true
}

/**
 * iOS fudge - prevents unwanted events on the given element
 */
function snuffiOSEvents (el: Element) {
	if (!isIOS || !config.iOSSpecial) return
	IOS_SNUFF_EVENTS.forEach(name => {
		el.addEventListener(name, eatEvent)
	})
}

/**
 * Cleaup iOS fudge
 */
function unSnuffiOSEvents (el: Element) {
	if (!isIOS || !config.iOSSpecial) return
	IOS_SNUFF_EVENTS.forEach(name => {
		el.removeEventListener(name, eatEvent)
	})
}

const eatEvent = (e: Event) => {
	e.preventDefault()
}
