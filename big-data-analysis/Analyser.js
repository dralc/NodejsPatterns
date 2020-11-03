import { Transform } from "stream";

export class Analyser extends Transform {
	constructor (opts) {
		super(opts)
		this._all_m = new Map();
		// <year, crimecount>
		this._crimesPerYr_m = new Map()
		// <borough, crimecount>
		this._crimesPerBorough_m = new Map()
		// <borough, <category, crimecount>>
		this._crimesPerBorough_by_category_m = new Map()
		// <category, crimeCount>
		this._crimesPerCategory_m = new Map()
	}

	/**
	 * Aggregate data into Maps
	 * 
	 * @param {Array} chunk A record
	 */
	_transform(chunk, enc, cb) {
		const borough = chunk[1]
		const major_category = chunk[2]
		const minor_category = chunk[3]
		const value = parseInt(chunk[4])
		const year = chunk[5]

		// Collect data for 'Did crime go up ?'
		let prevVal = this._crimesPerYr_m.get(year) ?? 0
		this._crimesPerYr_m.set(year, prevVal + value)

		// Collect data for 'Most dangerous areas'
		prevVal = this._crimesPerBorough_m.get(borough) ?? 0
		this._crimesPerBorough_m.set(borough, prevVal + value)

		// Collect data for 'Most common crime per area'
		let crimesByCat_m = this._crimesPerBorough_by_category_m.get(borough)
		if ( !crimesByCat_m ) {
			crimesByCat_m = new Map()
			this._crimesPerBorough_by_category_m.set(borough, crimesByCat_m)
		}
		crimesByCat_m.set(`${major_category}:${minor_category}`, value)

		// Collect data for 'Crimes overall'
		const category = `${major_category}:${minor_category}`
		prevVal = this._crimesPerCategory_m.get(category) ?? 0
		this._crimesPerCategory_m.set(category, prevVal + value)
		
		cb()
	}

	_flush(cb) {
		// Aggregate data
		this._all_m.set('crimesPerYear', this._crimesPerYr_m)
		this._all_m.set('crimesPerBorough', this._crimesPerBorough_m)
		this._all_m.set('crimesPerBorough_by_category', this._crimesPerBorough_by_category_m)
		this._all_m.set('crimesPerCategory', this._crimesPerCategory_m)
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
 * Orders the entries in a map by their values
 * 
 * @param {Map} map 
 * @param {string} order Can be 'asc' or 'desc'. Defaults to descending order
 */
export function sortMap(map, order='desc') {
	const ar = Array.from(map).sort((a, b) => {
		if (a[1] > b[1]) {
			return order === 'desc' ? -1 : 1
		}
		else if (a[1] < b[1]) {
			return order === 'asc' ? -1 : 1
		}
		return 0;
	});

	return new Map(ar)
}

/**
 * Sorts the map by descending order of values, then returns the keys
 * 
 * @param {Map<String, Number>} map A map of <borough, crimeCount>
 * @param {number} limit Limit the no. of returned keys
 * 
 * @returns {Array<String>} Returns the sorted keys of the map
 */
export function mostDangerousAreas(map, limit) {
	const _limit = !isNaN(parseInt(limit)) ? parseInt(limit) : map.size + 1
	const keys_a = [ ...sortMap(map).keys() ]
	
	return keys_a.slice(0, _limit)
}

/**
 * Returns the <map> with the sub map sorted by highest 'crimecount'
 * 
 * @param {Map} map <borough, <category, crimecount>>
 * @param {number} limit
 * 
 * @returns {Map}
 */
export function mostCommonCrime(map, limit) {
	let _limit = parseInt(limit)
	_limit = !isNaN(_limit) ? _limit : map.size + 1

	for (let [borough, crimesByCat_m] of map) {
		// Sort by biggest crime count
		const ar = Array.from(sortMap(crimesByCat_m)).slice(0, _limit)
		map.set(borough, new Map(ar))
	}

	return map;
}
