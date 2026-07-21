import type { ImageMetadata } from "astro";

const revistaImages = import.meta.glob<ImageMetadata>(
	"../assets/revista/imagenes/**/*.{jpeg,jpg,png,gif,webp}",
	{
		eager: true,
		import: "default",
	},
);

const REVISTA_IMAGE_PREFIX = "/revista/imagenes/";

function normalizeRevistaImagePath(path: string): string {
	if (path.startsWith(REVISTA_IMAGE_PREFIX)) {
		return path.slice(REVISTA_IMAGE_PREFIX.length);
	}

	if (path.startsWith("@assets/revista/imagenes/")) {
		return path.slice("@assets/revista/imagenes/".length);
	}

	return path;
}

export function resolveRevistaImage(path: string): ImageMetadata {
	const normalizedPath = normalizeRevistaImagePath(path);
	const imageEntry = Object.entries(revistaImages).find(([assetPath]) =>
		assetPath.endsWith(normalizedPath),
	);

	if (!imageEntry) {
		throw new Error(`Revista image not found: ${path}`);
	}

	return imageEntry[1];
}
