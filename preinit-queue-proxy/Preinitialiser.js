import { EventEmitter } from "events";

/**
 * Adds a pre-initialization queue to any object.
 * $eventName - Event name to emit when object is initialised
 * $preinitMethods - Specify which method names of the object will use of the pre-init queue
 * $initMethod - Method name of the object that triggers the initialisation
 */
class Preinitialiser extends EventEmitter {
	constructor (targ, {
		eventName = 'started',
		preinitMethods,
		initMethod
	}) {
		super()
		this.eventName = eventName
		this.preinitMethods = preinitMethods
		this.initMethod = initMethod
		this.commandQueue = []
		this.initialised = false
		this.proxy = this.createProxy(targ)
	}

	createProxy(targ) {
		const _this = this
		return new Proxy(targ, {
			get (targ, prop) {

				let fnTraps = {}
				for (let meth of _this.preinitMethods) {
					Reflect.set(fnTraps, meth, (queryStr) => {
						return new Promise((resolve) => {
							if (!_this.initialised) {
								const command = () => {
									resolve(targ[prop](queryStr))
								}
								_this.commandQueue.push(command)
							} else {
								resolve(targ[prop](queryStr))
							}
						})
					})
				}

				Reflect.set(fnTraps, _this.initMethod, async () => {
					await targ[prop]()
					_this.initialised = true
					_this.emit(_this.eventName)
					_this.commandQueue.forEach(command => command())
					_this.commandQueue = []
				})

				return Reflect.get(fnTraps, prop) || Reflect.get(targ, prop)
			}
		})
	}
}

export default Preinitialiser