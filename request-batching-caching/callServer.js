import { get } from "http";

const startTime = Date.now();
const delay = 100

repeatCall('http://localhost:8000?product=book', 6)

function repeatCall(url, times) {
	get(url, (res) => {
		let rawData = '';
		res.on('data', (chunk) => { rawData += chunk; });
		res.on('end', () => {
			try {
				console.log(rawData);
				if (!times) {
					console.log(`Time to complete: ${Date.now() - startTime}ms`)
				}
			} catch (e) {
				console.error(e.message);
			}
		});
	})

	if (--times) {
		setTimeout(repeatCall.bind(null, url, times), delay)
	}
}