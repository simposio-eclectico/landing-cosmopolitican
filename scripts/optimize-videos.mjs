import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { basename, extname, join } from "node:path";

// Todo video del sitio entra por acá: originales en videos-src/ → public/videos/*.mp4
const SOURCE_DIR = "videos-src";
const OUTPUT_DIR = "public/videos";
const SOURCE_EXTENSIONS = new Set([
	".mp4",
	".m4v",
	".mov",
	".mkv",
	".avi",
	".webm",
]);
const MAX_HEIGHT = 1080;
const CRF = "23";

const force = process.argv.includes("--force");

function slugify(name) {
	return name
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

if (spawnSync("ffmpeg", ["-version"]).error) {
	console.error("ffmpeg no está instalado (brew install ffmpeg).");
	process.exit(1);
}

if (!existsSync(SOURCE_DIR)) {
	mkdirSync(SOURCE_DIR, { recursive: true });
	console.log(`Creada ${SOURCE_DIR}/. Deja ahí los videos originales.`);
	process.exit(0);
}

const sources = readdirSync(SOURCE_DIR).filter((file) =>
	SOURCE_EXTENSIONS.has(extname(file).toLowerCase()),
);

if (sources.length === 0) {
	console.log(`No hay videos en ${SOURCE_DIR}/.`);
	process.exit(0);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
let failed = false;

for (const file of sources) {
	const slug = slugify(basename(file, extname(file)));
	const output = join(OUTPUT_DIR, `${slug}.mp4`);

	if (existsSync(output) && !force) {
		console.log(`= ${file} → ${output} (ya existe, usa --force para rehacer)`);
		continue;
	}

	const tmp = join(OUTPUT_DIR, `.${slug}.tmp.mp4`);
	console.log(`→ ${file} → ${output}`);

	// H.264 High + yuv420p + AAC + faststart: máxima compatibilidad y reproducción progresiva.
	const result = spawnSync(
		"ffmpeg",
		[
			"-hide_banner",
			"-loglevel",
			"warning",
			"-y",
			"-i",
			join(SOURCE_DIR, file),
			"-map",
			"0:v:0",
			"-map",
			"0:a:0?",
			"-vf",
			`scale=-2:'min(${MAX_HEIGHT},ih)'`,
			"-c:v",
			"libx264",
			"-profile:v",
			"high",
			"-pix_fmt",
			"yuv420p",
			"-preset",
			"slow",
			"-crf",
			CRF,
			"-c:a",
			"aac",
			"-b:a",
			"128k",
			"-movflags",
			"+faststart",
			"-map_metadata",
			"-1",
			tmp,
		],
		{ stdio: ["ignore", "ignore", "inherit"] },
	);

	if (result.status !== 0) {
		rmSync(tmp, { force: true });
		console.error(`✗ Falló la optimización de ${file}`);
		failed = true;
		continue;
	}

	renameSync(tmp, output);
}

process.exit(failed ? 1 : 0);
