import { rmSync } from "node:fs";

const ASTRO_CACHE_DIRS = [".astro", "node_modules/.astro"];

for (const dir of ASTRO_CACHE_DIRS) {
	rmSync(dir, { recursive: true, force: true });
}

console.log("✓ Caché de Astro limpiada");
