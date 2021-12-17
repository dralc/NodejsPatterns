import level from 'level'
import { EventEmitter } from 'events';

const db = level('./sales-db', { valueEncoding: 'json' })
/** @type {Map<string, ReadableStream>} */
let batches = new Map()
/** @type {Map<string, Number>} */
let cache = new Map()

/**
 * @param {string} product 
 * @returns {ReadableStream}
 */
function totalSales (product) {
	let total = 0
	const stream = db.createValueStream()
	stream.on('data', (value) => {
		if (value.product === product ) {
			total += value.amount
		}
	})

	stream.on('end', () => {
		stream.emit('totaldone', total)
		stream.destroy()
		batches.delete(product)
	})

	return stream
}


/**
 * @param {string} product
 * @returns {ReadableStream}
 */
function batchRequests(product) {
	console.log('Batching ...')
	let batch = batches.get(product)
	if (batch) return batch
	
	batch = totalSales(product)
	batches.set(product, batch)
	return batch
}

/**
 * 
 * @param {string} product 
 * @returns {EventEmitter}
 */
function cacheRequests(product) {
	console.log('Caching ...')
	
	// if still live
	// return cache.get(product)
	if ()
	new EventEmitter()

	const totalStream = totalSales(product)
	totalStream.on('totalDone', (total) => {
		cache.set(product, total)
		resolve(total)
		console.log('return cached result')
	})

}

/**
 * @param {string} product
 * @param {string} [type] Can be origin, batch, cache
 * @returns {ReadableStream}
 */
export function aggregate(product, type='batch') {
	const fns = {
		origin: totalSales,
		batch: batchRequests,
		cache: cacheRequests,
	}

	return fns[type](product)
}