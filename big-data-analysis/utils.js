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
 * Returns the <map> with the sub map sorted by the highest <value>
 * 
 * @param {Map} map <keyA, <keyB, value>>
 * @param {number} limit Limits the no. of entries in the sub map
 * 
 * @returns {Map}
 */
export function sortSubMap(map, limit) {
	let _limit = parseInt(limit)
	_limit = !isNaN(_limit) ? _limit : map.size + 1

	for (let [keyA, subMap] of map) {
		// Sort by biggest crime count
		const ar = Array.from(sortMap(subMap)).slice(0, _limit)
		map.set(keyA, new Map(ar))
	}

	return map;
}
