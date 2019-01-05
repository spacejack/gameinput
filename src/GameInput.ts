import InputEmitter from './InputEmitter'

export interface GameInputInfo {
	onPress?(): void
	onRelease?(): void
}

export default abstract class GameInput<T extends 'press' | 'release', U = void> extends InputEmitter<'press' | 'release'> {
	constructor (info: GameInputInfo = {}) {
		super()
		if (info.onPress) {
			this.on('press', info.onPress)
		}
		if (info.onRelease) {
			this.on('release', info.onRelease)
		}
	}
	abstract pressed(): boolean
	abstract value(): number
}
