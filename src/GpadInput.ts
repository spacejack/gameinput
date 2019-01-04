import * as gpad from './gpad'
import GameInput from './GameInput'

function clamp (n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max)
}

export abstract class GpadInput extends GameInput {
	gamepadId: string

	constructor (info: GpadInputButtonInfo | GpadInputAxisInfo) {
		super()
		this.gamepadId = info.gamepadId
	}

	pressed() {
		return this.value() > 0.75
	}

	static create(info: GpadInputButtonInfo | GpadInputAxisInfo) {
		return info.type === 'axis'
			? new GpadInputAxis(info) : new GpadInputButton(info)
	}
}

export interface GpadInputButtonInfo {
	type: 'button'
	gamepadId: string
	buttonId: number
}

export class GpadInputButton extends GpadInput implements GpadInputButtonInfo {
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

export interface GpadInputAxisInfo {
	type: 'axis'
	gamepadId: string
	axisId: number
	axisSign: -1 | 1
}

export class GpadInputAxis extends GpadInput implements GpadInputAxisInfo {
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
