import { Transform } from "stream";
import { sortMap } from "./utils.js";

export class CrimesPerAreaTransform extends Transform {
	constructor (opts) {
		super(opts)
		this._all_m = new Map();
		// <borough, crimecount>
		this._crimesPerBorough_m = new Map()
		// <borough, <category, crimecount>>
		this._crimesPerBorough_by_category_m = new Map()
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

		// Collect data for 'Most dangerous areas'
		const prevVal = this._crimesPerBorough_m.get(borough) ?? 0
		this._crimesPerBorough_m.set(borough, prevVal + value)

		// Collect data for 'Most common crime per area'
		let crimesByCat_m = this._crimesPerBorough_by_category_m.get(borough)
		if ( !crimesByCat_m ) {
			crimesByCat_m = new Map()
			this._crimesPerBorough_by_category_m.set(borough, crimesByCat_m)
		}
		crimesByCat_m.set(`${major_category}:${minor_category}`, value)

		cb()
	}

	_flush(cb) {
		this._all_m = new Map([
			['crimesPerBorough', this._crimesPerBorough_m],
			['crimesPerBorough_by_category', this._crimesPerBorough_by_category_m]
		]);
		this.push(this._all_m)
		cb()
	}

	/**
	 * A copy of all the aggregated data
	 * @returns {Map}
	 */
	get aggregates() {
		return this._all_m
	}
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
