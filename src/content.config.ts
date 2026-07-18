import { MENU_SECTIONS, SITE_NAME } from "@consts";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const transcriptionFragmentSchema = z.object({
	time: z.string(),
	text: z.string(),
});

const revista = defineCollection({
	loader: glob({ base: "./src/content/revista", pattern: "**/*.{md,mdx}" }),
	schema: () =>
		z.object({
			title: z.string(),
			author: z.string().default(SITE_NAME),
			pubDate: z.coerce.date(),
			category: z.string().optional(),
			section: z.string().default("Edición"),
			menuSection: z.enum(MENU_SECTIONS),
			menuLabel: z.string().optional(),
			tags: z.array(z.string()).default([]),
			summary: z.string(),
			subtitle: z.string().optional(),
			image: z.string().optional(),
			imageAlt: z.string().optional(),
			imageCaption: z.string().optional(),
			slug: z.string().optional(),
			issueNumber: z.string(),
			theme: z.enum(["default", "featured", "dark"]).default("default"),
			format: z.enum(["article", "video"]).default("article"),
			duration: z.string().optional(),
			videoUrl: z.string().optional(),
			transcriptionFragments: z
				.array(transcriptionFragmentSchema)
				.default([]),
			customStyles: z.string().optional(),
		}),
});

export const collections = { blog, revista };
