import test from "ava";
import { compress } from '../Compressor.js';
import fs from 'fs';
import { resolve } from "path";

test.before('Unlink temp files', async t =>  {
	const fileExts = ['br', 'de', 'gz'];
	const fileName = 'tmp';
	const proms = [];

	for (let ext of fileExts) {
		let filePath = resolve('fixtures', `${fileName}.${ext}`)
		proms.push(fs.promises.unlink(filePath))
	}

	await Promise.allSettled(proms)
})

test('compress', async (t) => {
	try {
		const dat = await compress('fixtures/input.txt')
		t.truthy(dat.duration.brotli && dat.duration.gzip && dat.duration.deflate)
		t.truthy(dat.efficiency.brotli && dat.efficiency.gzip && dat.efficiency.deflate)
		t.log(dat)
	} catch(er) {
		t.fail(er.message)
	}
})
