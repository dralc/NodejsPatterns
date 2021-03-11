import MockDb from './MockDb.js';
import Preinitialiser from './Preinitialiser.js';

console.log('start')
const db = new MockDb()

const preinitialiser = new Preinitialiser(db, {
	eventName: 'initialised',
	preinitMethods: ['query'],
	initMethod: 'connect'
})
const dbProxy = preinitialiser.proxy;

// Early connect
// dbProxy.connect()

if (!preinitialiser.initialised) {
	preinitialiser.on('initialised', () => {
		console.log('event initialised')
	})
} else {
	console.log('event initialised')
}

dbProxy.query('SELECT name FROM authors')
	.then((msg) => {
		console.log(msg)
	}).catch((er) => {
		er
	})

dbProxy.query('SELECT date FROM articles')
	.then((msg) => {
		console.log(msg)
	}).catch((er) => {
		er
	})

// Late connect
dbProxy.connect()
