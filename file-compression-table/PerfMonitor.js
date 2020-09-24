import { performance } from 'perf_hooks';
import { PassThrough } from 'stream';

export class PerfMonitor extends PassThrough {
	constructor (opts) {
		super(opts);
		this.startTime;

		// Setup listeners to track duration
		this.once('data', () => {
			this.startTime = performance.now()
		})

		this.on('finish', async () => {
			opts.duration[opts.label] = performance.now() - this.startTime
		})
	}
}