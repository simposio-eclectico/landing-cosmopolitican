#!/usr/bin/env node
/**
 * Genera una entrada de horóscopo (src/content/revista/columnas/horoscopo-{mes}.mdx)
 * a partir de un texto plano o markdown con el pronóstico de cada signo.
 *
 * Uso:
 *   node .cursor/skills/import-horoscopo/scripts/import-horoscopo.mjs \
 *     --source "~/Downloads/horoscopo-agosto.txt" \
 *     --month Agosto \
 *     --pubDate 2026-08-17 \
 *     [--slug horoscopo-ago] \
 *     [--author "Simposio Ecléctico"] \
 *     [--summary "..."] \
 *     [--image "~/Downloads/portada.png" --imageAlt "..." --imageCaption "..."] \
 *     [--dry-run]
 */

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { homedir } from "node:os";

const CONTENT_DIR = join("src", "content", "revista", "columnas");
const ASSETS_DIR = join("src", "assets", "revista", "imagenes", "horoscopo");

const MONTH_ABBR = {
	enero: "ene",
	febrero: "feb",
	marzo: "mar",
	abril: "abr",
	mayo: "may",
	junio: "jun",
	julio: "jul",
	agosto: "ago",
	septiembre: "sep",
	setiembre: "sep",
	octubre: "oct",
	noviembre: "nov",
	diciembre: "dic",
};

// Orden canónico + variantes de escritura aceptadas en el texto de origen.
const ZODIAC_SIGNS = [
	{ sign: "aries", label: "Aries", aliases: ["aries"] },
	{ sign: "tauro", label: "Tauro", aliases: ["tauro"] },
	{
		sign: "geminis",
		label: "Géminis",
		aliases: ["geminis", "géminis"],
	},
	{ sign: "cancer", label: "Cáncer", aliases: ["cancer", "cáncer"] },
	{ sign: "leo", label: "Leo", aliases: ["leo"] },
	{ sign: "virgo", label: "Virgo", aliases: ["virgo"] },
	{ sign: "libra", label: "Libra", aliases: ["libra"] },
	{
		sign: "escorpio",
		label: "Escorpio",
		aliases: ["escorpio", "escorpión", "escorpion"],
	},
	{ sign: "sagitario", label: "Sagitario", aliases: ["sagitario"] },
	{
		sign: "capricornio",
		label: "Capricornio",
		aliases: ["capricornio"],
	},
	{ sign: "acuario", label: "Acuario", aliases: ["acuario"] },
	{ sign: "piscis", label: "Piscis", aliases: ["piscis"] },
];

function expandHome(path) {
	if (path?.startsWith("~/")) {
		return join(homedir(), path.slice(2));
	}
	return path;
}

function parseArgs(argv) {
	const options = {
		source: "",
		project: process.cwd(),
		month: "",
		pubDate: "",
		slug: "",
		author: "Simposio Ecléctico",
		summary:
			"Un servicio de utilidad pública: el pronóstico de su semana con pincelazos del mes para usted y toda su familia.",
		image: "",
		imageAlt: "",
		imageCaption: "",
		imageCredit: "",
		dryRun: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		const next = () => argv[++i];

		if (arg === "--source") options.source = expandHome(next());
		else if (arg === "--project") options.project = expandHome(next());
		else if (arg === "--month") options.month = next();
		else if (arg === "--pubDate") options.pubDate = next();
		else if (arg === "--slug") options.slug = next();
		else if (arg === "--author") options.author = next();
		else if (arg === "--summary") options.summary = next();
		else if (arg === "--image") options.image = expandHome(next());
		else if (arg === "--imageAlt") options.imageAlt = next();
		else if (arg === "--imageCaption") options.imageCaption = next();
		else if (arg === "--imageCredit") options.imageCredit = next();
		else if (arg === "--dry-run") options.dryRun = true;
	}

	return options;
}

function normalize(str) {
	return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function monthAbbr(month) {
	const key = normalize(month);
	const abbr = MONTH_ABBR[key];
	if (!abbr) {
		throw new Error(
			`Mes no reconocido: "${month}". Usa un mes en español (ej. "Agosto").`,
		);
	}
	return abbr;
}

/**
 * Parte el texto de origen en { intro, entries } donde entries es un arreglo
 * ordenado [{ sign, label, body }] para los 12 signos encontrados.
 * Cada signo debe aparecer como línea propia (con o sin #, **, : al final).
 */
function splitBySign(rawText) {
	const lines = rawText.replace(/\r\n/g, "\n").split("\n");

	const aliasToSign = new Map();
	for (const { sign, label, aliases } of ZODIAC_SIGNS) {
		for (const alias of aliases) {
			aliasToSign.set(alias, { sign, label });
		}
	}

	const matches = [];

	lines.forEach((line, index) => {
		const stripped = normalize(
			line.replace(/^[#*\s]+/, "").replace(/[:*\s]+$/, ""),
		);
		if (aliasToSign.has(stripped)) {
			matches.push({ index, ...aliasToSign.get(stripped) });
		}
	});

	if (matches.length === 0) {
		throw new Error(
			"No se encontró ningún signo zodiacal en el texto de origen. " +
				"Cada signo debe estar en su propia línea (ej. 'Aries' o '## Aries').",
		);
	}

	const introLines = lines.slice(0, matches[0].index);
	const intro = introLines.join("\n").trim();

	const entries = matches.map((match, i) => {
		const start = match.index + 1;
		const end = matches[i + 1]?.index ?? lines.length;
		const body = lines.slice(start, end).join("\n").trim();
		return { sign: match.sign, label: match.label, body };
	});

	const missing = ZODIAC_SIGNS.filter(
		({ sign }) => !entries.some((e) => e.sign === sign),
	);
	if (missing.length > 0) {
		console.warn(
			`⚠ Faltan signos en el texto de origen: ${missing
				.map((m) => m.label)
				.join(", ")}`,
		);
	}

	const emptyBodies = entries.filter((e) => e.body.length === 0);
	if (emptyBodies.length > 0) {
		console.warn(
			`⚠ Signos sin texto de pronóstico: ${emptyBodies
				.map((e) => e.label)
				.join(", ")}`,
		);
	}

	// Reordenar siempre en el orden canónico del zodíaco, sin importar el
	// orden en que vinieron en el texto de origen.
	const ordered = ZODIAC_SIGNS.map(({ sign }) =>
		entries.find((e) => e.sign === sign),
	).filter(Boolean);

	return { intro, entries: ordered };
}

function buildBody({ intro, entries }) {
	const parts = [];
	if (intro) parts.push(intro);

	for (const { sign, label, body } of entries) {
		parts.push(`<h3><ZodiacIcon sign="${sign}" /> ${label}</h3>\n${body}`);
	}

	return parts.join("\n\n");
}

function yamlString(value) {
	return `"${value.replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(options, imageRelPath) {
	const title = `Horóscopo Cosmopolitican - ${capitalize(options.month)}`;
	const lines = [
		`title: ${yamlString(title)}`,
		`author: ${yamlString(options.author)}`,
		`pubDate: ${options.pubDate}`,
		`category: ${yamlString("Columna")}`,
		`section: ${yamlString("Columnas")}`,
		`menuSection: "columnas"`,
		`tags: ["horóscopo", "cosmopolitican"]`,
		`summary: ${yamlString(options.summary)}`,
	];

	if (imageRelPath) {
		lines.push(`image: ${imageRelPath}`);
		lines.push(
			`imageCaption: ${yamlString(
				options.imageCaption || `Servicio de utilidad pública: ${title}.`,
			)}`,
		);
		lines.push(`imageAlt: ${yamlString(options.imageAlt || `${title}.`)}`);
		if (options.imageCredit) {
			lines.push(`imageCredit: ${yamlString(options.imageCredit)}`);
		}
		lines.push(`theme: "featured"`);
	}

	lines.push(`slug: ${yamlString(options.slug)}`);

	return lines.join("\n");
}

function main() {
	const options = parseArgs(process.argv.slice(2));

	if (!options.source) {
		throw new Error("Falta --source con el archivo de texto del horóscopo");
	}
	if (!existsSync(options.source)) {
		throw new Error(`No existe: ${options.source}`);
	}
	if (!options.month) {
		throw new Error("Falta --month (ej. --month Agosto)");
	}
	if (!options.pubDate) {
		throw new Error("Falta --pubDate (ej. --pubDate 2026-08-17)");
	}

	const abbr = monthAbbr(options.month);
	if (!options.slug) {
		options.slug = `horoscopo-${abbr}`;
	}

	const rawText = readFileSync(options.source, "utf8");
	const { intro, entries } = splitBySign(rawText);
	const body = buildBody({ intro, entries });

	const projectDir = resolve(options.project);
	const destMdx = join(projectDir, CONTENT_DIR, `${options.slug}.mdx`);

	if (existsSync(destMdx) && !options.dryRun) {
		throw new Error(
			`Ya existe ${destMdx}. Usa --slug para elegir otro nombre o bórralo antes de continuar.`,
		);
	}

	let imageRelPath = "";
	if (options.image) {
		if (!existsSync(options.image)) {
			throw new Error(`No existe la imagen: ${options.image}`);
		}
		const ext = extname(options.image);
		const destImageName = `${options.slug}${ext}`;
		const destImageAbs = join(projectDir, ASSETS_DIR, destImageName);
		imageRelPath = `../../../assets/revista/imagenes/horoscopo/${destImageName}`;

		if (options.dryRun) {
			console.log(`[dry-run] cp ${options.image} → ${destImageAbs}`);
		} else {
			mkdirSync(join(projectDir, ASSETS_DIR), { recursive: true });
			copyFileSync(options.image, destImageAbs);
			console.log(`✓ ${join(ASSETS_DIR, destImageName)}`);
		}
	}

	const frontmatter = buildFrontmatter(options, imageRelPath);
	const mdx = `---\n${frontmatter}\n---\n\n${body}\n`;

	if (options.dryRun) {
		console.log(`[dry-run] escribir ${destMdx}\n`);
		console.log(mdx);
		return;
	}

	mkdirSync(join(projectDir, CONTENT_DIR), { recursive: true });
	writeFileSync(destMdx, mdx);
	console.log(`✓ ${join(CONTENT_DIR, `${options.slug}.mdx`)}`);
	console.log(
		"\n✓ Horóscopo generado. Revisa el texto y corre pnpm validate:images && pnpm build.",
	);
}

try {
	main();
} catch (error) {
	console.error(`✗ ${error.message}`);
	process.exit(1);
}
