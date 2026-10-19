import { spawnSync } from "node:child_process";
import { closeSync, existsSync, openSync, readSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const VIDEOS_DIR = "public/videos";
const MAX_HEIGHT = 1080;
const MAX_SIZE_MB = 50;

const errors = [];

// Recorre los átomos de nivel superior del MP4: `moov` debe ir antes de `mdat` (faststart).
function hasFaststart(path) {
	const fd = openSync(path, "r");
	const size = statSync(path).size;
	const header = Buffer.alloc(16);
	let offset = 0;

	try {
		while (offset + 8 <= size) {
			readSync(fd, header, 0, 16, offset);
			let atomSize = header.readUInt32BE(0);
			const type = header.toString("latin1", 4, 8);

			if (type === "moov") return true;
			if (type === "mdat") return false;
			if (atomSize === 1) atomSize = Number(header.readBigUInt64BE(8));
			if (atomSize < 8) return false;
			offset += atomSize;
		}
	} finally {
		closeSync(fd);
	}

	return false;
}

function probe(path) {
	const result = spawnSync("ffprobe", [
		"-v",
		"error",
		"-show_entries",
		"stream=codec_type,codec_name,pix_fmt,height",
		"-of",
		"json",
		path,
	]);

	if (result.error || result.status !== 0) return null;
	return JSON.parse(result.stdout.toString()).streams ?? [];
}

const files = existsSync(VIDEOS_DIR)
	? readdirSync(VIDEOS_DIR).filter((file) => !file.startsWith("."))
	: [];

for (const file of files) {
	const path = join(VIDEOS_DIR, file);
	const hint = "Déjalo en videos-src/ y corre `pnpm optimize:videos`.";

	if (extname(file).toLowerCase() !== ".mp4") {
		errors.push(`${path}: debe ser .mp4. ${hint}`);
		continue;
	}

	const streams = probe(path);

	if (!streams) {
		errors.push(`${path}: no se pudo leer con ffprobe (¿está instalado?).`);
		continue;
	}

	const video = streams.find((s) => s.codec_type === "video");
	const audio = streams.find((s) => s.codec_type === "audio");

	if (video?.codec_name !== "h264" || video?.pix_fmt !== "yuv420p") {
		errors.push(`${path}: el video debe ser H.264 yuv420p. ${hint}`);
	}
	if (audio && audio.codec_name !== "aac") {
		errors.push(`${path}: el audio debe ser AAC. ${hint}`);
	}
	if (video && video.height > MAX_HEIGHT) {
		errors.push(`${path}: altura ${video.height}px > ${MAX_HEIGHT}px. ${hint}`);
	}
	if (!hasFaststart(path)) {
		errors.push(`${path}: falta faststart (moov al inicio). ${hint}`);
	}
	if (statSync(path).size > MAX_SIZE_MB * 1024 * 1024) {
		errors.push(`${path}: pesa más de ${MAX_SIZE_MB} MB. ${hint}`);
	}
}

if (errors.length > 0) {
	console.error("Errores de validación de videos:");
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}

console.log(`Videos válidos: ${files.length}`);
