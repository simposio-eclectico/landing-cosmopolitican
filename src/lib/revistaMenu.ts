import type { CollectionEntry } from "astro:content";

import { CURRENT_ISSUE, type DrawerLinkStyle, type MenuSection } from "@consts";

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

const isEditorialArticle = (article: CollectionEntry<"revista">) =>
	article.data.menuSection === "editorial";

const compareArticles = (
	a: CollectionEntry<"revista">,
	b: CollectionEntry<"revista">,
) => {
	if (isEditorialArticle(a) !== isEditorialArticle(b)) {
		return isEditorialArticle(a) ? -1 : 1;
	}

	const themeOrder =
		THEME_SORT_ORDER[a.data.theme] - THEME_SORT_ORDER[b.data.theme];

	if (themeOrder !== 0) {
		return themeOrder;
	}

	return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
};

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

export const getIssueArticles = (
	articles: CollectionEntry<"revista">[],
	issueNumber: string = CURRENT_ISSUE.number,
) =>
	articles
		.filter((article) => article.data.issueNumber === issueNumber)
		.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

export const getArticlesByMenuSection = (
	articles: CollectionEntry<"revista">[],
	menuSection: MenuSection,
) =>
	[...articles]
		.filter((article) => article.data.menuSection === menuSection)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const getIssueSections = (
	articles: CollectionEntry<"revista">[],
	issueNumber: string = CURRENT_ISSUE.number,
): string[] => {
	const issueArticles = getIssueArticles(articles, issueNumber);
	const sections = [
		...new Set(issueArticles.map((article) => article.data.section)),
	];

	return sortSections(issueArticles, sections);
};

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
	issueNumber: string = CURRENT_ISSUE.number,
) => {
	const issueArticles = getIssueArticles(articles, issueNumber);
	const editorial = issueArticles.find(isEditorialArticle);

	if (editorial) {
		return editorial;
	}

	const sorted = [...issueArticles].sort(compareArticles);

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
	issueNumber: string = CURRENT_ISSUE.number,
) => {
	const issueArticles = getIssueArticles(articles, issueNumber);
	const leadId = leadArticle?.id;

	return issueArticles
		.filter((article) => article.id !== leadId)
		.sort(compareArticles);
};

export const getRelatedArticles = (
	articles: CollectionEntry<"revista">[],
	currentArticleId: string,
	issueNumber: string = CURRENT_ISSUE.number,
	limit = 3,
) => {
	const currentArticle = articles.find((article) => article.id === currentArticleId);
	const issueArticles = getIssueArticles(articles, issueNumber);
	const sameMenuSection = issueArticles.filter(
		(article) =>
			article.id !== currentArticleId &&
			article.data.menuSection === currentArticle?.data.menuSection,
	);
	const fallbackArticles = issueArticles.filter(
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
	issueNumber: string = CURRENT_ISSUE.number,
): DrawerMenuItem[] => {
	const issueArticles = getIssueArticles(articles, issueNumber);

	return [...issueArticles].sort(compareArticles).map((article) => ({
		type: "article" as const,
		label: article.data.menuLabel ?? article.data.title,
		href: `/revista/${article.data.slug ?? article.id}`,
		style: getMenuStyle(article.data.theme),
	}));
};
