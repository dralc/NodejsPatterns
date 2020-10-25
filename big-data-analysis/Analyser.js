import { Transform } from "stream";

export class Analyser extends Transform {
	constructor (opts) {
		super(opts)
		this._all_m = new Map();
		// <year, crimecount>
		this._crimesPerYr_m = new Map()
		// <borough, crimecount>
		this._crimesPerBorough_m = new Map()
	}

	/**
	 * Sum up the `value` for each year and store in a map: Map<year, crimeCount>
	 * 
	 * @param {Array} chunk A record
	 */
	_transform(chunk, enc, cb) {
		const borough = chunk[1]
		const value = parseInt(chunk[4])
		const year = chunk[5]

		// Collect data for 'Did crime go up ?'
		let prevVal = this._crimesPerYr_m.get(year) ?? 0
		this._crimesPerYr_m.set(year, prevVal + value)

		// Collect data for 'Most dangerous areas'
		prevVal = this._crimesPerBorough_m.get(borough) ?? 0
		this._crimesPerBorough_m.set(borough, prevVal + value)
		
		cb()
	}

	_flush(cb) {
		// Aggregate data
		this._all_m.set('crimesPerYear', this._crimesPerYr_m)
		this._all_m.set('crimesPerBorough', this._crimesPerBorough_m)
		this.push(this._all_m)
		cb()
	}

	/**
	 * A copy of all the aggregated data
	 * @returns {Map}
	 */
	get aggregates() {
		return new Map([...this._all_m])
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

/**
 * Sorts the map by descending order of values, then returns the keys
 * 
 * @param {Map<String, Number>} map A map of <borough, crimeCount>
 * @param {number} limit Limit the no. of returned keys
 * 
 * @returns {Array<String>} Returns the sorted keys of the map
 */
export function mostDangerousAreas(map, limit=10) {
	const _limit = parseInt(limit) ?? null
	if (!_limit) throw Error('"limit" needs to be an int.')

	const ar = Array.from(map).sort((a, b) => {
		if (a[1] > b[1]) {
			return -1
		} else if (a[1] < b[1]) {
			return 1
		}
		return 0;
	});

	const sorted_m = new Map(ar)
	const keys_a = [ ...sorted_m.keys() ]
	
	return keys_a.slice(0, _limit)
}