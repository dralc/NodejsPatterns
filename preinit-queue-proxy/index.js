/**
 * Uses a JS Proxy to add a pre-initialization queue to any object.
 * Allow the proxy consumer to say which methods of the object will make use of the pre-init queue,
 * as well as the event & property to indicate if the object is initialised.
 */

// const preinitQueueProxy = new Proxy()
const EventEmitter = require('events');
const promisify = require('util').promisify;
const delay = promisify(setTimeout)
const remoteCall = async (command) => {
	console.log('...')
	await delay(1000)
	return `Ran ${command}`
}

class NewDb extends EventEmitter {
	constructor () {
		super()
		this.commandQueue = []
		this.connected = false
	}

	/**
	 * Returns the result of running a remote db call
	 * 
	 * @param {string} command
	 * @returns {Promise<string|object>}
	 */
	query (command) {
		if (!this.connected) {
			return new Promise((resolve) => {
				// Queue the command
				const cmd = async () => {
					resolve(await remoteCall(command))
				}
				this.commandQueue.push(cmd)
			})
		} else {
			return remoteCall(command)
		}
	}

	connect () {
		this.connected = true
		this.emit('connect')
		this.commandQueue.forEach(command => command())
		this.commandQueue = []
	}
}

//  TODO NOW the pre-init queue logic in NewDb should be in a Proxy so that it can be added to any object without changing it's api


// const dbProxied = preinitQueueProxy(db)

// dbProxied([''],  'hasInitialsed')

console.log('start')
const db = new NewDb()
// db.connect()

db.query('SELECT name FROM authors')
	.then((msg) => {
		console.log(msg)
	})
db.query('SELECT articles FROM authors')
	.then((msg) => {
		console.log(msg)
	})

// Actually runs queue
db.connect()
