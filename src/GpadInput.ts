import * as gpad from './gpad'
import GameInput, {GameInputInfo} from './GameInput'

function clamp (n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max)
}

export abstract class GpadInput extends GameInput<'press' | 'release'> {
	gamepadId: string
	protected isPressed: boolean

	constructor (info: GpadInputButtonInfo | GpadInputAxisInfo) {
		super(info)
		this.gamepadId = info.gamepadId
		this.isPressed = false
	}

	pressed() {
		return this.isPressed
	}

	/** Must be polled to discover events */
	poll() {
		const p = this.value() > 0.75
		if (p === this.isPressed) return
		this.isPressed = p
		this.emit(p ? 'press' : 'release')
	}

	static create (info: GpadInputButtonInfo | GpadInputAxisInfo) {
		return info.type === 'axis'
			? new GpadInputAxis(info) : new GpadInputButton(info)
	}
}

export interface GpadInputButtonInfo extends GameInputInfo {
	type: 'button'
	gamepadId: string
	buttonId: number
}

export class GpadInputButton extends GpadInput {
	type: 'button'
	buttonId: number

	constructor (info: GpadInputButtonInfo) {
		super(info)
		this.type = 'button'
		this.buttonId = info.buttonId
	}

	value() {
		const gp = gpad.getGamepadById(this.gamepadId)
		return gp ? clamp(gp.buttons[this.buttonId].value, 0, 1) : 0
	}
}

export interface GpadInputAxisInfo extends GameInputInfo {
	type: 'axis'
	gamepadId: string
	axisId: number
	axisSign: -1 | 1
}

export class GpadInputAxis extends GpadInput {
	type: 'axis'
	axisId: number
	axisSign: -1 | 1

	constructor (info: GpadInputAxisInfo) {
		super(info)
		this.type = 'axis'
		this.axisId = info.axisId
		this.axisSign = info.axisSign
	}

	value() {
		const gp = gpad.getGamepadById(this.gamepadId)
		return gp ? clamp(gp.axes[this.axisId] * this.axisSign, 0, 1) : 0
	}
}
