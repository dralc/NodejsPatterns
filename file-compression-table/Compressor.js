import { createReadStream, createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { createGzip, createBrotliCompress, createDeflate } from "zlib";

const pipelinePr = promisify(pipeline);

// Single input stream fork to all 3 compression algos
export async function compress(inputFilePath) {
	const writeFilePathDir = dirname(inputFilePath)
	const readStream = createReadStream(resolve(inputFilePath))

	const proms = [
		pipelinePr(
			readStream,
			createBrotliCompress(),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.br`))
		),
		pipelinePr(
			readStream,
			createGzip(),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.gz`))
		),
		pipelinePr(
			readStream,
			createDeflate(),
			createWriteStream(resolve(`${writeFilePathDir}/tmp.de`))
		)
	]

	return Promise.all(proms);
}

export function table() {
	return '| | |';
}