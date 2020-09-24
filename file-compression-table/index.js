import {compress, table} from './Compressor.js';

compress('file-compression-table/fixtures/input.txt')
	.then((dat) => {
		process.stdout.write(table(dat))
	})
	.catch(er => {
		console.error(er);
	})