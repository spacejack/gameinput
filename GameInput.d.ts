import InputEmitter from './InputEmitter';
export interface GameInputInfo {
    onPress?(): void;
    onRelease?(): void;
}
export default abstract class GameInput<T extends 'press' | 'release', U = void> extends InputEmitter<'press' | 'release'> {
    constructor(info?: GameInputInfo);
    abstract pressed(): boolean;
    abstract value(): number;
}
