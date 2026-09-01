import type { CollectionEntry } from "astro:content";

import { type DrawerLinkStyle, type MenuSection } from "@consts";

type RevistaTheme = CollectionEntry<"revista">["data"]["theme"];

const THEME_SORT_ORDER: Record<RevistaTheme, number> = {
	featured: 0,
	dark: 1,
	default: 2,
};

export type DrawerMenuItem =
	| { type: "heading"; label: string }
	| {
			type: "article";
			label: string;
			href: string;
			style: DrawerLinkStyle;
	  }
	| {
			type: "placeholder";
			label: string;
			style: DrawerLinkStyle;
	  };

const DEFAULT_ARTICLE_ORDER = Number.MAX_SAFE_INTEGER;

const isEditorialArticle = (article: CollectionEntry<"revista">) =>
	article.data.menuSection === "editorial";

const getArticleOrder = (article: CollectionEntry<"revista">) =>
	article.data.order ?? DEFAULT_ARTICLE_ORDER;

export const compareArticles = (
	a: CollectionEntry<"revista">,
	b: CollectionEntry<"revista">,
) => {
	const dateCompare = a.data.pubDate.valueOf() - b.data.pubDate.valueOf();

	if (dateCompare !== 0) {
		return dateCompare;
	}

	const orderCompare = getArticleOrder(a) - getArticleOrder(b);

	if (orderCompare !== 0) {
		return orderCompare;
	}

	return a.data.title.localeCompare(b.data.title, "es");
};

export const compareArticlesDesc = (
	a: CollectionEntry<"revista">,
	b: CollectionEntry<"revista">,
) => compareArticles(b, a);

const getSectionArticles = (
	articles: CollectionEntry<"revista">[],
	section: string,
) =>
	articles
		.filter((article) => article.data.section === section)
		.sort(compareArticles);

const getSectionPriority = (
	articles: CollectionEntry<"revista">[],
	section: string,
) => {
	const sectionArticles = articles.filter(
		(article) => article.data.section === section,
	);

	return Math.min(
		...sectionArticles.map(
			(article) => THEME_SORT_ORDER[article.data.theme],
		),
	);
};

const sortSections = (
	articles: CollectionEntry<"revista">[],
	sections: string[],
) =>
	[...sections].sort(
		(sectionA, sectionB) =>
			getSectionPriority(articles, sectionA) -
				getSectionPriority(articles, sectionB) ||
			sectionA.localeCompare(sectionB, "es"),
	);

const getMenuStyle = (theme: RevistaTheme): DrawerLinkStyle =>
	theme === "featured" ? "main" : "sub";


export const getArticlesByMenuSection = (
	articles: CollectionEntry<"revista">[],
	menuSection: MenuSection,
) =>
	[...articles]
		.filter((article) => article.data.menuSection === menuSection)
		.sort(compareArticlesDesc);


export const getSectionsByCategory = (
	articles: CollectionEntry<"revista">[],
): Record<string, string[]> => {
	const sectionsByCategory = new Map<string, Set<string>>();

	for (const article of articles) {
		const category = article.data.category ?? "";
		const section = article.data.section;

		if (!sectionsByCategory.has(category)) {
			sectionsByCategory.set(category, new Set());
		}

		sectionsByCategory.get(category)?.add(section);
	}

	return Object.fromEntries(
		[...sectionsByCategory.entries()].map(([category, sections]) => [
			category,
			sortSections(
				articles.filter((article) => article.data.category === category),
				[...sections],
			),
		]),
	);
};

export const getLeadArticle = (
	articles: CollectionEntry<"revista">[],
) => {
	const editorials = articles.filter(isEditorialArticle).sort(compareArticlesDesc);

	if (editorials.length > 0) {
		return editorials[0];
	}

	const sorted = [...articles].sort(compareArticles);

	return (
		sorted.find(
			(article) => article.data.theme === "featured" && article.data.image,
		) ??
		sorted.find((article) => article.data.image) ??
		sorted[0]
	);
};

export const getCoverCardArticles = (
	articles: CollectionEntry<"revista">[],
	leadArticle: CollectionEntry<"revista"> | undefined,
) => {
	const leadId = leadArticle?.id;

	return articles
		.filter((article) => article.id !== leadId)
		.sort(compareArticlesDesc);
};

export const getRelatedArticles = (
	articles: CollectionEntry<"revista">[],
	currentArticleId: string,
	limit = 3,
) => {
	const currentArticle = articles.find((article) => article.id === currentArticleId);
	const sameMenuSection = articles.filter(
		(article) =>
			article.id !== currentArticleId &&
			article.data.menuSection === currentArticle?.data.menuSection,
	);
	const fallbackArticles = articles.filter(
		(article) => article.id !== currentArticleId,
	);

	return [...sameMenuSection, ...fallbackArticles]
		.filter(
			(article, index, list) =>
				list.findIndex((candidate) => candidate.id === article.id) === index,
		)
		.sort(compareArticles)
		.slice(0, limit);
};

export const buildDrawerMenu = (
	articles: CollectionEntry<"revista">[],
): DrawerMenuItem[] => {
	return [...articles].sort(compareArticles).map((article) => ({
		type: "article" as const,
		label: article.data.menuLabel ?? article.data.title,
		href: `/revista/${article.data.slug ?? article.id}`,
		style: getMenuStyle(article.data.theme),
	}));
};
