import test from 'ava'
import { createReadStream } from 'fs';
import { pipeline } from 'stream';
import { Analyser, didCrimeGoUp, mostCommonCrime, mostDangerousAreas } from '../Analyser.js';
import { resolve } from 'path';
import csvparse from "csv-parse";
import { promisify } from "util";
import Pumpify from 'pumpify';
const pipelinePm = promisify(pipeline)

// Aggregated data
let aggregates;

test.before('Aggregate data from the source', async () => {
	// Combine 2 streams as the source stream
	const inputStream = Pumpify.obj([
		createReadStream(resolve('big-data-analysis/tmp', 'london_crime_by_lsoa.csv')),
		csvparse({ fromLine: 2 })
	])

	const analyserStream = new Analyser({ objectMode: true })

	await pipelinePm( inputStream, analyserStream )

	aggregates = analyserStream.aggregates
})

test('Analysis: Did crime go up over the years?', t => {
	const crimesMap = aggregates.get('crimesPerYear')
	t.snapshot(crimesMap, 'No. of crimes')
	const verdict = didCrimeGoUp(crimesMap)
	t.false(verdict, 'Incorrect verdict')	
})

test('Analysis: What are the 10 most dangerous areas?', t => {
	const crimesMap = aggregates.get('crimesPerBorough')
	t.snapshot(crimesMap, 'No. of crimes')
	t.snapshot(mostDangerousAreas(crimesMap, 5), 'Most dangerous areas')
})

test('Analysis: What is the most common crime per area?', (t) => {
	const crimesMap = aggregates.get('crimesPerBorough_by_category')
	t.snapshot(mostCommonCrime(crimesMap, 1), 'Most common crimes per Borough')
})

test.skip('Analysis: What is the least common crime overall?', (t) => {
	t
})
