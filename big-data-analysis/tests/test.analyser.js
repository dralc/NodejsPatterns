import test from 'ava'
import { createReadStream } from 'fs';
import { pipeline } from 'stream';
import { resolve } from 'path';
import csvparse from "csv-parse";
import { promisify } from "util";
import Pumpify from 'pumpify';
import { sortSubMap, sortMap } from '../utils.js';
import { CrimesPerYearTransform, didCrimeGoUp } from '../CrimesPerYearTransform.js';
import { CrimesPerAreaTransform, mostDangerousAreas } from "../CrimesPerAreaTransform.js";
import { CrimesPerCategoryTransform } from '../CrimesPerCategoryTransform.js';
const pipelinePm = promisify(pipeline)

test.before('Aggregate data from the source', async (t) => {
	// Combine 2 streams as the source stream
	t.context.inputStream = Pumpify.obj([
		createReadStream(resolve('tmp', 'london_crime_by_lsoa.csv')),
		csvparse({ fromLine: 2 })
	])
})

test('Analysis: Did crime go up over the years?', async t => {
	const transStream = new CrimesPerYearTransform({ objectMode: true })
	await pipelinePm( t.context.inputStream, transStream )
	t.snapshot(transStream.aggregates, 'No. of crimes')
	const verdict = didCrimeGoUp(transStream.aggregates)
	t.false(verdict, 'Incorrect verdict')	
})

test('Analysis: Crimes within Areas', async t => {
	const transStream = new CrimesPerAreaTransform({ objectMode: true })
	await pipelinePm( t.context.inputStream, transStream )
	t.snapshot(transStream.aggregates.get('crimesPerBorough'), 'No. of crimes')
	t.snapshot(mostDangerousAreas(transStream.aggregates.get('crimesPerBorough'), 10), 'What are the 10 most dangerous areas?')
	t.snapshot(sortSubMap(transStream.aggregates.get('crimesPerBorough_by_category'), 1), 'What is the most common crime per area?')
})

test('Analysis: What is the least common crime overall?', async t => {
	const transStream = new CrimesPerCategoryTransform({ objectMode: true})
	await pipelinePm( t.context.inputStream, transStream )
	const crimesPerCat = sortMap(transStream.aggregates, 'asc')
	t.snapshot(crimesPerCat, 'Crimes per category')
	t.is(crimesPerCat.keys().next().value, 'Sexual Offences:Rape')
})
