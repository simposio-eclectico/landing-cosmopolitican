export type ArticleFigureVariant =
	| "figura"
	| "side-left"
	| "side-right"
	| "full-bleed";

export type ArticleFigureAspect = "3-2" | "16-10";

export type ImageCreditProps = {
	credit?: string;
	creditUrl?: string;
	license?: string;
	licenseUrl?: string;
};

export const CC_BY_NC_2 = {
	license: "CC BY-NC 2.0",
	licenseUrl: "https://creativecommons.org/licenses/by-nc/2.0/",
} as const;


export function getFigureClassNames({
	variant = "figura",
	aspect,
}: {
	variant?: ArticleFigureVariant;
	aspect?: ArticleFigureAspect;
}): string {
	const classes: string[] = [];

	if (variant === "side-left") {
		classes.push("articulo__side-img--left");
	} else if (variant === "side-right") {
		classes.push("articulo__side-img--right");
	} else if (variant === "full-bleed") {
		classes.push("articulo__full-bleed");
	} else {
		classes.push("articulo__figura");
	}

	if (aspect === "3-2") {
		classes.push("articulo__figura--3-2");
	}

	if (aspect === "16-10") {
		classes.push("articulo__figura--16-10");
	}

	return classes.join(" ");
}

export function hasImageAttribution({
	credit,
	creditUrl,
	license,
}: ImageCreditProps): boolean {
	return Boolean(credit || creditUrl || license);
}
