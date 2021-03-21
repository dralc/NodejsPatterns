// Implement batching and caching for the totalSales API examples using only
// callbacks, streams, and events (without using promises or async/await).
// Hint: Pay attention to Zalgo when returning cached values!

// √ 1. populate local level db
// √ 2. server to make requests
// √ 3. load server with lots of requests, try using 2 different processes
// 4i batch request (callbacks, streams only)
// 4ii cache request

import { createServer } from "http";
import level from 'level'

createServer((req, res) => {
	const url = new URL(req.url, 'http://localhost')
	const product = url.searchParams.get('product')
	if (!product) {
		res.end('no product specified');
	}

	console.log('Request for: ', product)
	const streamTotal = batchRequests(product)

	streamTotal.on('totaldone', (total) => {
		res.end(JSON.stringify({ product, total }))
	})
}).listen(8000, () => console.log('server listening'))




// query db for data
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
	if (batchedstream) return batchedstream
	
	batchedstream = totalSales(product)

	return batchedstream
}