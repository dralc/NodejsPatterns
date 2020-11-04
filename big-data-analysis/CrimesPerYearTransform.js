import { Transform } from "stream";

export class CrimesPerYearTransform extends Transform {
	constructor (opts) {
		super(opts)
		this._all_m = new Map();
		// <year, crimecount>
		this._crimesPerYr_m = new Map()
	}

	/**
	 * Aggregate data into Maps
	 * 
	 * @param {Array} chunk A record
	 */
	_transform(chunk, enc, cb) {
		const value = parseInt(chunk[4])
		const year = chunk[5]

		// Collect data for 'Did crime go up ?'
		let prevVal = this._crimesPerYr_m.get(year) ?? 0
		this._crimesPerYr_m.set(year, prevVal + value)

		cb()
	}

	_flush(cb) {
		this.push(this._crimesPerYr_m)
		cb()
	}

	/**
	 * A copy of all the aggregated data
	 * @returns {Map}
	 */
	get aggregates() {
		return new Map([...this._crimesPerYr_m])
	}
}

/**
 * Compares the value of the earliest yr to the latest yr
 * It's a simple conclusion to the question.
 * 
 * @param {Map} map 
 * 
 * @returns {Boolean}
 */
export function didCrimeGoUp(map) {
	const yearsAr = Array.from(map.keys())

	return map.get(`${Math.max(...yearsAr)}`) > map.get(`${Math.min(...yearsAr)}`)
}
