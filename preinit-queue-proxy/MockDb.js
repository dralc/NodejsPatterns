import { promisify } from 'util';
const delay = promisify(setTimeout)

class MockDb {
	constructor () {
		this.initialised = false;
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
	async query(command) {
		if (this.initialised) {
			return this.remoteCall(command)
		}

		throw Error('not connected')
	}

	async connect() {
		await this.remoteCall('connect')
		this.initialised = true;
	}
}

export default MockDb;