import {compress} from './Compressor.js';

compress('file-compression-table/fixtures/input.txt')
	.then(() => {
		console.log('done ok');
	})
	.catch(er => {
		console.error(er);
	})