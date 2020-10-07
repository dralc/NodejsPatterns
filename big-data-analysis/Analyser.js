import { Transform } from "stream";

export class Analyser extends Transform {
	constructor (opts) {
		super(opts)
		this.crimesPerYr_m = new Map()
	}

	/**
	 * Sum up the `value` for each year and store in a map: Map<year, crimeCount>
	 * 
	 * @param {Array} chunk A record
	 */
	_transform(chunk, enc, cb) {
		const value = parseInt(chunk[4])
		const year = chunk[5]
		let prevVal = this.crimesPerYr_m.get(year) ?? 0
		this.crimesPerYr_m.set(year, prevVal + value)

		cb()
	}

	_flush(cb) {
		this.push(this.crimesPerYr_m)
		cb()
	}
}

/**
 * Compares the value of the earliest yr to the latest yr
 * It's a simple conclusion to the question.
 * 
 * @param {Map} map 
 */
export function didCrimeGoUp(map) {
	const yearsAr = Array.from(map.keys())

	return map.get(`${Math.max(...yearsAr)}`) > map.get(`${Math.min(...yearsAr)}`)
}
