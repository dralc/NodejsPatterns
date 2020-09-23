import { promises as fsp } from 'fs';
import { PassThrough } from 'stream';

export class PerfMonitor extends PassThrough {
	constructor (opts) {
		super(opts);

		// Setup listeners to track duration
		this.once('data', () => {
			console.time(opts.label)
		})

		this.on('finish', async () => {
			console.timeEnd(opts.label)
		})
	}
}