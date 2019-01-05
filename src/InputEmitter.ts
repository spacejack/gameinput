/** Simple custom event emitter */
export default class InputEmitter<T extends string, U = unknown> {
	protected listeners: Record<T, ((data?: U) => void)[]>

	constructor() {
		this.listeners = Object.create(null)
	}

	on (id: T, cb: (data?: U) => void) {
		if (!id || typeof id !== 'string' || typeof cb !== 'function') {
			throw new Error('Invalid params')
		}
		let cbs = this.listeners[id]
		if (!cbs) {
			cbs = [cb]
			this.listeners[id] = cbs
		} else {
			if (cbs.indexOf(cb) < 0) {
				cbs.push(cb)
			}
		}
	}

	once (id: T, cb: (data?: U) => void) {
		if (typeof cb !== 'function') {
			throw new Error('Invalid callback')
		}
		const f = (data?: U) => {
			this.off(id, f)
			cb(data)
		}
		this.on(id, f)
	}

	off (id: T, cb: (data?: U) => void) {
		if (!id || typeof id !== 'string' || typeof cb !== 'function') {
			throw new Error('Invalid params')
		}
		const cbs = this.listeners[id]
		if (!cbs) {
			return
		}
		const i = cbs.indexOf(cb)
		if (i < 0) {
			return
		}
		if (cbs.length < 2) {
			delete this.listeners[id]
			return
		}
		cbs.splice(i, 1)
	}

	emit (id: T, data?: U) {
		const cbs = this.listeners[id]
		if (!cbs) {
			return
		}
		for (const cb of this.listeners[id]) {
			cb(data)
		}
	}
}
