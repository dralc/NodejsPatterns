import level from 'level'

const db = level('./sales-db', { valueEncoding: 'json' })
let batchedstream

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
		batchedstream = null
	})

	return stream
}


function batchRequests(product) {
	console.log('Batching ...')
	// TODO batched stream needs to be unique per product
	if (batchedstream) return batchedstream
	
	batchedstream = totalSales(product)

	return batchedstream
}

function cacheRequests(product) {

}

export function aggregate(product, opts = {}) {
	const { type = 'batch' } = { ...opts }
	const fns = {
		origin: totalSales,
		batch: batchRequests,
		cache: cacheRequests,
	}

	return fns[type](product)
}