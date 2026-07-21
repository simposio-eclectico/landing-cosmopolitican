import type { CollectionEntry } from "astro:content";
import { getImage } from "astro:assets";

import { MENU_SECTION_LABELS } from "@consts";

const SEARCH_RESULTS_LIMIT = 8;
const SEARCH_THUMB_SIZE_PX = 100;

export type SearchEntry = {
	title: string;
	summary: string;
	author: string;
	section: string;
	menuSection: string;
	tags: string[];
	href: string;
	imageSrc?: string;
	imageAlt?: string;
};

export const buildSearchIndex = async (
	articles: CollectionEntry<"revista">[],
): Promise<SearchEntry[]> =>
	Promise.all(
		articles.map(async (article) => {
			let imageSrc: string | undefined;

			if (article.data.image) {
				const optimized = await getImage({
					src: article.data.image,
					width: SEARCH_THUMB_SIZE_PX,
					height: SEARCH_THUMB_SIZE_PX,
					format: "webp",
				});
				imageSrc = optimized.src;
			}

			return {
				title: article.data.title,
				summary: article.data.summary,
				author: article.data.author,
				section: article.data.section,
				menuSection: MENU_SECTION_LABELS[article.data.menuSection],
				tags: article.data.tags,
				href: `/revista/${article.data.slug ?? article.id}`,
				imageSrc,
				imageAlt: article.data.imageAlt,
			};
		}),
	);

const normalizeSearchText = (value: string) =>
	value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

const getSearchHaystack = (entry: SearchEntry) =>
	normalizeSearchText(
		[
			entry.title,
			entry.summary,
			entry.author,
			entry.section,
			entry.menuSection,
			...entry.tags,
		].join(" "),
	);

const getSearchScore = (entry: SearchEntry, query: string) => {
	const normalizedQuery = normalizeSearchText(query);
	const title = normalizeSearchText(entry.title);
	const summary = normalizeSearchText(entry.summary);
	const author = normalizeSearchText(entry.author);

	if (title.includes(normalizedQuery)) {
		return 4;
	}

	if (author.includes(normalizedQuery)) {
		return 3;
	}

	if (summary.includes(normalizedQuery)) {
		return 2;
	}

	return 1;
};

export const findSearchResults = (
	searchIndex: SearchEntry[],
	query: string,
): SearchEntry[] => {
	const normalizedQuery = normalizeSearchText(query.trim());

	if (!normalizedQuery) {
		return [];
	}

	return searchIndex
		.filter((entry) => getSearchHaystack(entry).includes(normalizedQuery))
		.sort(
			(a, b) =>
				getSearchScore(b, normalizedQuery) - getSearchScore(a, normalizedQuery) ||
				a.title.localeCompare(b.title, "es"),
		)
		.slice(0, SEARCH_RESULTS_LIMIT);
};
