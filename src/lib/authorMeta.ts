export function getAuthorSlug(author: string): string {
	return author
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^\w\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");
}

export function getAuthorHref(author: string): string {
	return `/revista/autor/${getAuthorSlug(author)}`;
}
