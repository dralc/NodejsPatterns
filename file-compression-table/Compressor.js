import { createReadStream, createWriteStream, promises as fsp } from "fs";
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
	const duration = {}

	const proms = [
		pipelinePr(
			readStream,
			createGzip(),
			new PerfMonitor({ label: 'gzip', duration }),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.gz`))
		),
		pipelinePr(
			readStream,
			createDeflate(),
			new PerfMonitor({ label: 'deflate', duration }),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.de`))
		),
		pipelinePr(
			readStream,
			createBrotliCompress(),
			new PerfMonitor({ label: 'brotli', duration }),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.br`))
		),
	]

	await Promise.all(proms)

	const efficiency = await calcEfficiency(inputFilePath, writeFilePathDir)

	return {
		duration,
		efficiency
	}
}

async function calcEfficiency(inputFilePath, writeFilePathDir) {
	const efficiency = {};
	const fileSize = (await fsp.stat(resolve(inputFilePath))).size

	for (let type of [['brotli', 'br'], ['gzip', 'gz'], ['deflate', 'de']]) {
		let newFileSize = (await fsp.stat(resolve(`${writeFilePathDir}/tmp.${type[1]}`))).size
		efficiency[type[0]] = newFileSize / fileSize
	}

	return efficiency
}

export function table(obj) {
	return `
	Algorithm | Time taken (ms) | Efficiency (%)
	--------- | --------------- | --------------
	brotli    | ${obj.duration.brotli}  | ${obj.efficiency.brotli * 100}
	deflate   | ${obj.duration.deflate} | ${obj.efficiency.deflate * 100}
	gzip      | ${obj.duration.gzip}    | ${obj.efficiency.gzip * 100}
	`;
}