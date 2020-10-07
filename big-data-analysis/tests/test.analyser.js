import test from 'ava'
import { createReadStream } from 'fs';
import { PassThrough, pipeline } from 'stream';
import { Analyser, didCrimeGoUp } from '../Analyser.js';
import { resolve } from 'path';
import csvparse from "csv-parse";
import { promisify } from "util";
const pipelinePm = promisify(pipeline)

test('Analysis: Did crime go up over the years?', async t => {
	
	const logStream = new PassThrough({ objectMode: true });
	
	/** @type {Map} */
	let crimeDat
	logStream.on('data', chunk => crimeDat = chunk)

	// const inputFileName = 'london_crime_by_lsoa.csv';
	const inputFileName = 'portion.csv';

	await pipelinePm(
		// TODO Reuse these 2 streams as the source pipeline for a fork
		createReadStream(resolve('big-data-analysis/tmp', inputFileName)),
		csvparse({ fromLine: 2 }),

		new Analyser({ objectMode: true }),
		logStream
	)

	t.log('No. of crimes:', crimeDat)
	const verdict = didCrimeGoUp(crimeDat)
	t.log('Verdict: ', verdict)
	t.true(verdict, 'Verdict should be true')
})

test.skip('Analysis: What are the 10 most dangerous areas?', (t) => {
	t
	// - sum up the `value` for each `borough` : Map<borough, crimeCount>
	// - Sort by descending order of crimeCount	

})

test.skip('Analysis: What is the most common crime per area?', (t) => {
	t
})

test.skip('Analysis: What is the least common crime overall?', (t) => {
	t
})
