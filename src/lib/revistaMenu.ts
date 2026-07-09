import type { CollectionEntry } from "astro:content";

import { CURRENT_ISSUE, type DrawerLinkStyle } from "@consts";

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

const compareArticles = (
	a: CollectionEntry<"revista">,
	b: CollectionEntry<"revista">,
) => {
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

	return (
		issueArticles.find((article) => article.data.theme === "featured") ??
		issueArticles[0]
	);
};

export const buildDrawerMenu = (
	articles: CollectionEntry<"revista">[],
	issueNumber: string = CURRENT_ISSUE.number,
): DrawerMenuItem[] => {
	const issueArticles = getIssueArticles(articles, issueNumber);
	const sections = getIssueSections(articles, issueNumber);
	const items: DrawerMenuItem[] = [];

	for (const section of sections) {
		const sectionArticles = getSectionArticles(issueArticles, section);

		for (const article of sectionArticles) {
			items.push({
				type: "article",
				label: article.data.menuLabel ?? article.data.title,
				href: `/revista/${article.data.slug ?? article.id}`,
				style: getMenuStyle(article.data.theme),
			});
		}
	}

	return items;
};
