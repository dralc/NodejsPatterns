import test from "ava";
import { compress, table } from '../Compressor.js';
import fs from 'fs';
import { resolve } from "path";

test.before('Unlink temp files', async t =>  {
	const fileExts = ['br', 'de', 'gz'];
	const fileName = 'tmp';
	const proms = [];

	for (let ext of fileExts) {
		let filePath = resolve('file-compression-table/fixtures', `${fileName}.${ext}`)
		proms.push(fs.promises.unlink(filePath))
	}

	await Promise.allSettled(proms)
})

test('compress', async (t) => {
	try {
		await compress('file-compression-table/fixtures/input.txt');
		t.pass();
	} catch(er) {
		t.fail(er.message);
	}
})
