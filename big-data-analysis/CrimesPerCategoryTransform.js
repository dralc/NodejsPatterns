import { Transform } from "stream";

export class CrimesPerCategoryTransform extends Transform {
	constructor (opts) {
		super(opts)
		// <category, crimeCount>
		this._crimesPerCategory_m = new Map()
	}

	/**
	 * Aggregate data into Maps
	 * 
	 * @param {Array} chunk A record
	 */
	_transform(chunk, enc, cb) {
		const major_category = chunk[2]
		const minor_category = chunk[3]
		const value = parseInt(chunk[4])

		// Collect data for 'Crimes overall'
		const category = `${major_category}:${minor_category}`
		const prevVal = this._crimesPerCategory_m.get(category) ?? 0
		this._crimesPerCategory_m.set(category, prevVal + value)
		
		cb()
	}

	_flush(cb) {
		this.push(this._crimesPerCategory_m)
		cb()
	}

	/**
	 * A copy of all the aggregated data
	 * @returns {Map}
	 */
	get aggregates() {
		return new Map([...this._crimesPerCategory_m])
	}
}
