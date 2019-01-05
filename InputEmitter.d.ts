/** Simple custom event emitter */
export default class InputEmitter<T extends string, U = unknown> {
    protected listeners: Record<T, ((data?: U) => void)[]>;
    constructor();
    on(id: T, cb: (data?: U) => void): void;
    once(id: T, cb: (data?: U) => void): void;
    off(id: T, cb: (data?: U) => void): void;
    emit(id: T, data?: U): void;
}
