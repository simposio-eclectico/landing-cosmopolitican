import type { CollectionEntry } from "astro:content";

import {
	CURRENT_ISSUE,
	DRAWER_MENU_GROUPS,
	type DrawerLinkStyle,
} from "@consts";

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

const getSectionArticles = (
	articles: CollectionEntry<"revista">[],
	section: string,
) =>
	articles
		.filter((article) => article.data.section === section)
		.sort((a, b) => {
			const orderA = a.data.sectionOrder ?? Number.MAX_SAFE_INTEGER;
			const orderB = b.data.sectionOrder ?? Number.MAX_SAFE_INTEGER;

			if (orderA !== orderB) {
				return orderA - orderB;
			}

			return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
		});

export const getIssueArticles = (
	articles: CollectionEntry<"revista">[],
	issueNumber: string = CURRENT_ISSUE.number,
) =>
	articles
		.filter((article) => article.data.issueNumber === issueNumber)
		.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

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
	const items: DrawerMenuItem[] = [];

	for (const group of DRAWER_MENU_GROUPS) {
		if (group.label) {
			items.push({ type: "heading", label: group.label });
		}

		for (const sectionDef of group.sections) {
			const sectionArticles = getSectionArticles(
				issueArticles,
				sectionDef.key,
			);

			if (sectionArticles.length > 0) {
				sectionArticles.forEach((article, index) => {
					const style =
						index === 0 ? sectionDef.style : ("sub" as const);

					items.push({
						type: "article",
						label: article.data.menuLabel ?? article.data.title,
						href: `/revista/${article.data.slug ?? article.id}`,
						style,
					});
				});
				continue;
			}

			if (sectionDef.placeholder) {
				items.push({
					type: "placeholder",
					label: sectionDef.placeholder,
					style: sectionDef.style,
				});
			}
		}
	}

	return items;
};
