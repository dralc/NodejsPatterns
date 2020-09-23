import { createReadStream, createWriteStream, stat } from "fs";
import { resolve, dirname } from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { createGzip, createBrotliCompress, createDeflate } from "zlib";
import { PerfMonitor } from "./PerfMonitor.js";

const pipelinePr = promisify(pipeline);

// Single input stream fork to all 3 compression algos
export async function compress(inputFilePath) {
	const writeFilePathDir = dirname(inputFilePath)
	const readStream = createReadStream(resolve(inputFilePath))

	const proms = [
		pipelinePr(
			readStream,
			createGzip(),
			new PerfMonitor({ label: 'gzip' }),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.gz`))
		),
		pipelinePr(
			readStream,
			createDeflate(),
			new PerfMonitor({ label: 'deflate' }),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.de`))
		),
		pipelinePr(
			readStream,
			createBrotliCompress(),
			new PerfMonitor({ label: 'brotli' }),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.br`))
		),
	]

	return Promise.all(proms);
}

export function table(obj) {
	return `
	Algorithm | Time taken (ms) | Efficiency (%)
	--------- | --------------- | --------------
	brotli    | ${obj.times.brotli}  | ${obj.efficiency.brotli}
	deflate   | ${obj.times.deflate} | ${obj.times.deflate}
	gzip      | ${obj.times.gzip}    | ${obj.times.gzip}
	`;
}