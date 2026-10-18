import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@consts";
import { stripSummaryMarkdown } from "@lib/summaryMarkdown";

export async function GET(context) {
	const posts = (await getCollection("revista")).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: stripSummaryMarkdown(post.data.summary),
			pubDate: post.data.pubDate,
			author: post.data.author,
			link: `/revista/${post.data.slug || post.id}/`,
		})),
	});
}
