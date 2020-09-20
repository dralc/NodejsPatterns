import test from "ava";
import { compress, table } from '../Compressor.js';

test('compress', async (t) => {
	try {
		await compress('file-compression-table/fixtures/input.txt');
		t.pass();
	} catch(er) {
		t.fail(er.message);
	}
});
