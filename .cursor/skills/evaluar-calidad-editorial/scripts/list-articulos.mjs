#!/usr/bin/env node
// Lista los artículos de src/content/revista con métricas base para elegir
// cuál evaluar editorialmente o para armar el ranking de una evaluación completa.
//
// Uso:
//   node .cursor/skills/evaluar-calidad-editorial/scripts/list-articulos.mjs
//   node .cursor/skills/evaluar-calidad-editorial/scripts/list-articulos.mjs --menu-section columnas
//   node .cursor/skills/evaluar-calidad-editorial/scripts/list-articulos.mjs --slug modo-avion
//   node .cursor/skills/evaluar-calidad-editorial/scripts/list-articulos.mjs --json

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const CONTENT_DIR = "src/content/revista";
const WORDS_PER_MINUTE = 200;
const ARTICLE_FIGURE_PATTERN = /<ArticleFigure[\s\S]*?(?:\/>|<\/ArticleFigure>)/g;

function parseArgs(argv) {
	const args = { json: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--json") args.json = true;
		else if (arg === "--menu-section") args.menuSection = argv[++i];
		else if (arg === "--slug") args.slug = argv[++i];
	}
	return args;
}

function walkMdxFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		const stats = statSync(fullPath);
		if (stats.isDirectory()) {
			files.push(...walkMdxFiles(fullPath));
			continue;
		}
		if (/\.(md|mdx)$/.test(entry)) files.push(fullPath);
	}
	return files;
}

// Parser mínimo de frontmatter YAML: alcanza para los campos escalares que
// usamos acá (no reemplaza el schema real de src/content.config.ts).
function parseFrontmatter(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) return { data: {}, body: raw };

	const [, frontmatter, body] = match;
	const data = {};
	for (const line of frontmatter.split(/\r?\n/)) {
		const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
		if (!kv) continue;
		const [, key, rawValue] = kv;
		const value = rawValue.trim().replace(/^["']|["']$/g, "");
		if (value !== "") data[key] = value;
	}
	return { data, body };
}

function getReadingMeta(body) {
	const plainText = body
		.replace(/```[\s\S]*?```/g, "")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/[#>*_~`|-]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	const words = plainText ? plainText.split(" ").length : 0;
	return { words, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) };
}

function countImages(body, hasFrontmatterImage) {
	const figures = body.match(ARTICLE_FIGURE_PATTERN) ?? [];
	return figures.length + (hasFrontmatterImage ? 1 : 0);
}

function buildEntry(filePath) {
	const raw = readFileSync(filePath, "utf8");
	const { data, body } = parseFrontmatter(raw);
	const { words, minutes } = getReadingMeta(body);
	const slug = data.slug ?? filePath.split("/").at(-1).replace(/\.(md|mdx)$/, "");
	const menuSection = filePath.split("/").at(-2);

	return {
		slug,
		menuSection,
		title: data.title ?? "(sin título)",
		author: data.author,
		pubDate: data.pubDate,
		theme: data.theme ?? "default",
		format: data.format ?? "article",
		words,
		readingMinutes: minutes,
		imageCount: countImages(body, Boolean(data.image)),
		path: relative(process.cwd(), filePath),
	};
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	let entries = walkMdxFiles(CONTENT_DIR).map(buildEntry);

	if (args.menuSection) {
		entries = entries.filter((e) => e.menuSection === args.menuSection);
	}
	if (args.slug) {
		entries = entries.filter((e) => e.slug === args.slug);
	}

	entries.sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));

	if (args.json) {
		console.log(JSON.stringify(entries, null, 2));
		return;
	}

	if (entries.length === 0) {
		console.log("No se encontraron artículos con esos filtros.");
		return;
	}

	const bySection = new Map();
	for (const entry of entries) {
		if (!bySection.has(entry.menuSection)) bySection.set(entry.menuSection, []);
		bySection.get(entry.menuSection).push(entry);
	}

	for (const [menuSection, items] of bySection) {
		const avgWords = Math.round(
			items.reduce((sum, e) => sum + e.words, 0) / items.length,
		);
		console.log(`\n## ${menuSection} (${items.length} artículos, promedio ${avgWords} palabras)`);
		for (const e of items) {
			console.log(
				`- ${e.slug} | ${e.title} | ${e.words} palabras (~${e.readingMinutes} min) | ${e.imageCount} imágenes | ${e.pubDate ?? "sin fecha"} | ${e.path}`,
			);
		}
	}
}

main();
