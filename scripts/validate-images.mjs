import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const CONTENT_DIR = "src/content/revista";
const CC_LICENSE_HOSTS = ["creativecommons.org", "flickr.com", "wikimedia.org"];
const ARTICLE_FIGURE_PATTERN =
	/<ArticleFigure[\s\S]*?(?:\/>|<\/ArticleFigure>)/g;

const errors = [];
const warnings = [];

function walkMarkdownFiles(dir) {
	const entries = readdirSync(dir);
	const files = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			files.push(...walkMarkdownFiles(fullPath));
			continue;
		}

		if (/\.(md|mdx)$/.test(entry)) {
			files.push(fullPath);
		}
	}

	return files;
}

function parseFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

	if (!match) {
		return {};
	}

	const frontmatter = {};
	const lines = match[1].split("\n");

	for (const line of lines) {
		const separatorIndex = line.indexOf(":");

		if (separatorIndex === -1) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");
		frontmatter[key] = value;
	}

	return frontmatter;
}

function isTruthyFrontmatterValue(value) {
	return Boolean(value && value.trim().length > 0);
}

function isExternalImageSrc(src) {
	return src.startsWith("http://") || src.startsWith("https://");
}

function looksLikeThirdPartyImage(src) {
	if (isExternalImageSrc(src)) {
		return true;
	}

	return CC_LICENSE_HOSTS.some((host) => src.includes(host));
}

function hasFigureAttribution(block) {
	return (
		/\bcredit\s*=/.test(block) ||
		block.includes("{...CHRISTIAN_C_CC}") ||
		block.includes("articulo__fig-credit")
	);
}

function validateFrontmatter(filePath, content) {
	const frontmatter = parseFrontmatter(content);

	if (isTruthyFrontmatterValue(frontmatter.image) && !isTruthyFrontmatterValue(frontmatter.imageAlt)) {
		errors.push(`${filePath}: falta imageAlt en el frontmatter`);
	}

	if (
		isTruthyFrontmatterValue(frontmatter.image) &&
		frontmatter.theme === "featured" &&
		!isTruthyFrontmatterValue(frontmatter.imageCaption)
	) {
		errors.push(
			`${filePath}: falta imageCaption en artículo featured con image`,
		);
	}

	if (
		isTruthyFrontmatterValue(frontmatter.imageLicense) &&
		!isTruthyFrontmatterValue(frontmatter.imageCredit)
	) {
		errors.push(
			`${filePath}: falta imageCredit cuando hay imageLicense en el frontmatter`,
		);
	}
}

function validateBodyImages(filePath, content) {
	const body = content.replace(/^---[\s\S]*?---/, "");
	const imgTags = [...body.matchAll(/<img\b[^>]*>/gi)];
	const articleFigures = [...body.matchAll(ARTICLE_FIGURE_PATTERN)];

	for (const [block] of articleFigures) {
		if (!/\balt\s*=/.test(block)) {
			errors.push(`${filePath}: <ArticleFigure> sin atributo alt`);
		}

		if (!hasFigureAttribution(block)) {
			if (/\blicense\s*=/.test(block)) {
				errors.push(
					`${filePath}: <ArticleFigure> con license pero sin crédito`,
				);
			}
		}

		const altMatch = block.match(/\balt\s*=\s*(['"])([\s\S]*?)\1/);
		const captionMatch = block.match(/\bcaption\s*=\s*(['"])([\s\S]*?)\1/);

		if (altMatch && captionMatch) {
			const alt = altMatch[2].replace(/\s+/g, " ").trim();
			const caption = captionMatch[2].replace(/\s+/g, " ").trim();

			if (alt && caption && alt === caption) {
				warnings.push(
					`${filePath}: alt y caption idénticos en <ArticleFigure>; conviene diferenciarlos`,
				);
			}
		}
	}

	for (const [tag] of imgTags) {
		if (!/\balt\s*=/.test(tag)) {
			errors.push(`${filePath}: <img> sin atributo alt`);
		}

		const altMatch = tag.match(/\balt\s*=\s*(['"])(.*?)\1/i);
		const srcMatch = tag.match(/\bsrc\s*=\s*(['"])(.*?)\1/i);

		if (!altMatch || !srcMatch) {
			continue;
		}

		const alt = altMatch[2].trim();
		const src = srcMatch[2].trim();

		if (alt.length === 0 && !tag.includes('alt=""')) {
			errors.push(`${filePath}: alt vacío en ${src}`);
		}

		if (looksLikeThirdPartyImage(src)) {
			const figureContext = body.slice(
				Math.max(0, body.indexOf(tag) - 200),
				body.indexOf(tag) + 600,
			);

			if (!figureContext.includes("articulo__fig-credit")) {
				warnings.push(
					`${filePath}: imagen posiblemente de terceros sin crédito (${src})`,
				);
			}
		}
	}

	const markdownImages = [...body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];

	for (const [, alt, src] of markdownImages) {
		if (!alt.trim()) {
			errors.push(`${filePath}: imagen markdown sin alt (${src})`);
		}
	}
}

const markdownFiles = walkMarkdownFiles(CONTENT_DIR);

for (const filePath of markdownFiles) {
	const content = readFileSync(filePath, "utf8");
	const relativePath = relative(process.cwd(), filePath);

	validateFrontmatter(relativePath, content);
	validateBodyImages(relativePath, content);
}

for (const warning of warnings) {
	console.warn(`⚠ ${warning}`);
}

if (errors.length > 0) {
	for (const error of errors) {
		console.error(`✗ ${error}`);
	}

	process.exit(1);
}

console.log(`✓ Validación de imágenes OK (${markdownFiles.length} archivos)`);
