#!/usr/bin/env node
/**
 * Importa un artículo generado externamente (salida de prompt-articulos.md)
 * al repo landing-cosmopolitican.
 *
 * Uso:
 *   node .cursor/skills/import-revista-articulo/scripts/import-articulo.mjs \
 *     --source "~/Downloads/Ana Cosmopolitana diseño web 2" \
 *     [--map imagenes.json] [--dry-run] [--project .]
 */

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { homedir } from "node:os";

const REVISTA_CONTENT_PREFIX = join("src", "content", "revista");
const REVISTA_ASSETS_PREFIX = join("src", "assets", "revista", "imagenes");

const IMAGE_EXTENSIONS = new Set([
	".jpg",
	".jpeg",
	".png",
	".gif",
	".webp",
]);

function expandHome(path) {
	if (path.startsWith("~/")) {
		return join(homedir(), path.slice(2));
	}

	return path;
}

function parseArgs(argv) {
	const options = {
		source: "",
		project: process.cwd(),
		map: "",
		dryRun: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];

		if (arg === "--source") {
			options.source = expandHome(argv[index + 1] ?? "");
			index += 1;
			continue;
		}

		if (arg === "--project") {
			options.project = expandHome(argv[index + 1] ?? "");
			index += 1;
			continue;
		}

		if (arg === "--map") {
			options.map = expandHome(argv[index + 1] ?? "");
			index += 1;
			continue;
		}

		if (arg === "--dry-run") {
			options.dryRun = true;
		}
	}

	return options;
}

function walkFiles(dir, predicate) {
	const results = [];

	if (!existsSync(dir)) {
		return results;
	}

	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			results.push(...walkFiles(fullPath, predicate));
			continue;
		}

		if (predicate(fullPath)) {
			results.push(fullPath);
		}
	}

	return results;
}

function parseFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

	if (!match) {
		return {};
	}

	const frontmatter = {};

	for (const line of match[1].split("\n")) {
		const separatorIndex = line.indexOf(":");

		if (separatorIndex === -1) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		const value = line
			.slice(separatorIndex + 1)
			.trim()
			.replace(/^"|"$/g, "");
		frontmatter[key] = value;
	}

	return frontmatter;
}

function extractImageManifest(content, slug) {
	const manifest = new Set();

	const heroMatch = content.match(/^image:\s*(.+)$/m);

	if (heroMatch) {
		const heroPath = heroMatch[1].trim().replace(/^"|"$/g, "");
		const heroFile = basename(heroPath);

		if (heroFile) {
			manifest.add(heroFile);
		}
	}

	for (const match of content.matchAll(
		/<ArticleFigure[\s\S]*?\bsrc\s*=\s*(['"])([\s\S]*?)\1/g,
	)) {
		const src = match[2].trim();

		if (src.includes("/")) {
			manifest.add(basename(src));
			continue;
		}

		manifest.add(basename(`${slug}/${src}`));
	}

	for (const match of content.matchAll(
		/\{\/\*\s*PENDIENTE:[^→]*→\s*([^\s*]+)\s*\*\/\}/g,
	)) {
		manifest.add(basename(match[1].trim()));
	}

	return [...manifest].sort();
}

function findMdxFiles(sourceDir) {
	const revistaDir = join(sourceDir, REVISTA_CONTENT_PREFIX);

	return walkFiles(revistaDir, (filePath) => /\.mdx?$/.test(filePath));
}

function findSourceImages(sourceDir) {
	const candidates = [
		join(sourceDir, "src", "assets", "revista", "imagenes"),
		join(sourceDir, "assets", "revista", "imagenes"),
		join(sourceDir, "uploads"),
		join(sourceDir, "imagenes"),
	];

	const images = [];

	for (const dir of candidates) {
		images.push(
			...walkFiles(dir, (filePath) =>
				IMAGE_EXTENSIONS.has(filePath.slice(filePath.lastIndexOf(".")).toLowerCase()),
			),
		);
	}

	return [...new Set(images)];
}

function loadImageMap(mapPath) {
	if (!mapPath) {
		return {};
	}

	if (!existsSync(mapPath)) {
		throw new Error(`No existe el archivo de mapeo: ${mapPath}`);
	}

	const parsed = JSON.parse(readFileSync(mapPath, "utf8"));

	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
		throw new Error("El mapeo debe ser un objeto JSON { destino: origen }");
	}

	return parsed;
}

function ensureDir(dirPath, dryRun) {
	if (existsSync(dirPath)) {
		return;
	}

	if (dryRun) {
		console.log(`[dry-run] mkdir -p ${dirPath}`);
		return;
	}

	mkdirSync(dirPath, { recursive: true });
}

function copyFile(sourcePath, destPath, dryRun) {
	ensureDir(dirname(destPath), dryRun);

	if (dryRun) {
		console.log(`[dry-run] cp ${sourcePath} → ${destPath}`);
		return;
	}

	copyFileSync(sourcePath, destPath);
	console.log(`✓ ${relative(process.cwd(), destPath)}`);
}

function resolveMapSource(sourceDir, mapValue) {
	const expanded = expandHome(mapValue);

	if (existsSync(expanded)) {
		return resolve(expanded);
	}

	const fromSource = join(sourceDir, mapValue);

	if (existsSync(fromSource)) {
		return resolve(fromSource);
	}

	throw new Error(`Imagen de origen no encontrada: ${mapValue}`);
}

function writeManifestTemplate(manifest, sourceImages, outputPath, dryRun) {
	const template = {
		_comentario:
			"Claves = nombre destino en assets. Valores = ruta relativa al --source o absoluta.",
	};

	for (const fileName of manifest) {
		template[fileName] = "";
	}

	template._imagenes_disponibles_en_origen = sourceImages.map((imagePath) =>
		relative(sourceDirForTemplate, imagePath),
	);

	if (dryRun) {
		console.log("[dry-run] manifest template:", JSON.stringify(template, null, 2));
		return;
	}

	writeFileSync(outputPath, `${JSON.stringify(template, null, 2)}\n`);
	console.log(`→ Plantilla de mapeo: ${outputPath}`);
}

let sourceDirForTemplate = "";

function importArticle(options) {
	const sourceDir = resolve(expandHome(options.source));
	const projectDir = resolve(expandHome(options.project));
	sourceDirForTemplate = sourceDir;

	if (!options.source) {
		throw new Error("Falta --source con la carpeta de salida del artículo");
	}

	if (!existsSync(sourceDir)) {
		throw new Error(`No existe la carpeta origen: ${sourceDir}`);
	}

	const mdxFiles = findMdxFiles(sourceDir);

	if (mdxFiles.length === 0) {
		throw new Error(
			`No se encontró ningún .mdx bajo ${join(sourceDir, REVISTA_CONTENT_PREFIX)}`,
		);
	}

	if (mdxFiles.length > 1) {
		console.warn(
			`⚠ Se encontraron ${mdxFiles.length} MDX; se importará cada uno.`,
		);
	}

	const imageMap = loadImageMap(options.map);
	const sourceImages = findSourceImages(sourceDir);
	const pendingManifests = [];

	for (const mdxPath of mdxFiles) {
		const content = readFileSync(mdxPath, "utf8");
		const frontmatter = parseFrontmatter(content);
		const slug =
			frontmatter.slug ?? basename(mdxPath, ".mdx").replace(/\.md$/, "");
		const manifest = extractImageManifest(content, slug);
		const relFromRevista = relative(
			join(sourceDir, REVISTA_CONTENT_PREFIX),
			mdxPath,
		);
		const destMdx = join(projectDir, REVISTA_CONTENT_PREFIX, relFromRevista);
		const destAssetsDir = join(projectDir, REVISTA_ASSETS_PREFIX, slug);

		console.log(`\n📄 ${relFromRevista} (slug: ${slug})`);

		copyFile(mdxPath, destMdx, options.dryRun);

		const missingImages = [];

		for (const fileName of manifest) {
			const destImage = join(destAssetsDir, fileName);

			if (imageMap[fileName]) {
				const mapSource = resolveMapSource(sourceDir, imageMap[fileName]);
				copyFile(mapSource, destImage, options.dryRun);
				continue;
			}

			const mirroredSource = join(
				sourceDir,
				"src",
				"assets",
				"revista",
				"imagenes",
				slug,
				fileName,
			);

			if (existsSync(mirroredSource)) {
				copyFile(mirroredSource, destImage, options.dryRun);
				continue;
			}

			missingImages.push(fileName);
		}

		if (missingImages.length > 0) {
			pendingManifests.push({ slug, manifest: missingImages });
		}
	}

	if (pendingManifests.length > 0 && !options.map) {
		const templatePath = join(sourceDir, "imagenes-map.json");

		console.log("\n⚠ Faltan imágenes por mapear:");

		for (const { slug, manifest } of pendingManifests) {
			for (const fileName of manifest) {
				console.log(`  - ${slug}/${fileName}`);
			}
		}

		console.log("\nImágenes disponibles en origen:");
		for (const imagePath of sourceImages) {
			console.log(`  - ${relative(sourceDir, imagePath)}`);
		}

		writeManifestTemplate(
			pendingManifests.flatMap(({ manifest }) => manifest),
			sourceImages,
			templatePath,
			options.dryRun,
		);

		console.log(
			"\nCompleta imagenes-map.json y vuelve a ejecutar con --map imagenes-map.json",
		);

		process.exit(2);
	}

	console.log("\n✓ Importación completada");
}

try {
	const options = parseArgs(process.argv.slice(2));
	importArticle(options);
} catch (error) {
	console.error(`✗ ${error.message}`);
	process.exit(1);
}
