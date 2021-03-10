/**
 * Uses a JS Proxy to add a pre-initialization queue to any object.
 * Allow the proxy consumer to say which methods of the object will make use of the pre-init queue,
 * as well as the event & property to indicate if the object is initialised.
 */

const EventEmitter = require('events');
const promisify = require('util').promisify;
const delay = promisify(setTimeout)
class NewDb extends EventEmitter {
	constructor() {
		super()
	}

	async remoteCall(command) {
		console.log('...')
		await delay(1000)
		return `Ran ${command}`
	}

	/**
	 * Returns the result of running a remote db call
	 * @param {string} command
	 * @returns {Promise<string|object>} 
	 */
	query(command) {
		return this.remoteCall(command)
	}

	connect() {
		this.emit('connect')
	}
}

console.log('start')
const db = new NewDb()

const preinitQueue = (targ, options) => {
	let commandQueue = []
	let connected = false

	return new Proxy(targ, {
		get(targ, prop, receiver) {
			const traps = {
				query: (queryStr) => {
					return new Promise((resolve) => {
						if (!connected) {
							const command = () => {
								resolve(targ[prop](queryStr))
							}
							commandQueue.push(command)
						} else {
							resolve(targ[prop](queryStr))
						}
					})

				},
				connect: () => {
					connected = true
					targ[prop]()
					commandQueue.forEach(command => command())
					commandQueue = []
				}
			}

			return Reflect.get(traps, prop) || Reflect.get(targ, prop)
		}
	})
}

//  TODO dynamicize the methods to trap and the event name to emit
const dbProxy = preinitQueue(db, { hasInitEvent: 'initialised', methods: ['query'] })
// dbProxy.connect()
dbProxy.query('SELECT name FROM authors')
	.then((msg) => {
		console.log(msg)
	})

dbProxy.query('SELECT date FROM articles')
	.then((msg) => {
		console.log(msg)
	})

dbProxy.connect()