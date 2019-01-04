export default abstract class GameInput {
	abstract pressed(): boolean
	abstract value(): number
}
