// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://cosmopolitican.cl",
	env: {
		schema: {
			PUBLIC_SHOW_SECTION_DESCRIPTIONS: envField.boolean({
				context: "client",
				access: "public",
				default: false,
			}),
			PUBLIC_GA_MEASUREMENT_ID: envField.string({
				context: "client",
				access: "public",
				default: "",
			}),
			PUBLIC_META_PIXEL_ID: envField.string({
				context: "client",
				access: "public",
				default: "",
			}),
			PUBLIC_FORMSPREE_ID: envField.string({
				context: "client",
				access: "public",
				default: "",
			}),
		},
	},
	integrations: [
		mdx({
			components: {
				ArticleFigure: "./src/components/revista/ArticleFigure.astro",
			},
		}),
		sitemap(),
	],
});
