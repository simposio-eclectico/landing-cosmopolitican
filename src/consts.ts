export const SITE_NAME = "Cosmopolitican";
export const SITE_SLOGAN = "Tu revista con Clase";
export const SITE_TITLE = `${SITE_NAME} | ${SITE_SLOGAN}`;
export const SITE_DESCRIPTION = `Descubre ${SITE_NAME}, la revista digital definitiva para la dama y el varón. Moda, cultura, tendencias y estilo de vida con un toque de distinción y clase.`;
export const SITE_MAIL = "hola@cosmopolitican.cl";
export const SHOW_UNDER_CONSTRUCTION = true;

export const CATEGORIES = {
	LIGERO: "Contenido ligero",
	NARRATIVO: "Contenido narrativo",
	AUDIOVISUAL: "Contenido audiovisual",
} as const;

export const SECTIONS = {
	[CATEGORIES.LIGERO]: [
		"Horóscopo",
		"Quién X eres?",
		"Memes",
		"Chismes",
		"Moda",
		"vino de honor",
		"cosas que no puedes hacer con un sueldo mínimo",
		"11 organízate entonces",
		"las mujeres ya no lloran (emprenden y facturan)",
		"Tu falta de querer",
	],
	[CATEGORIES.NARRATIVO]: ["Reportajes", "Entrevistas", "Opinión"],
	[CATEGORIES.AUDIOVISUAL]: ["Videos", "Reels", "Podcast"],
} as const;

export const CURRENT_ISSUE = {
	number: "Nº 01",
	title: "Cooptación",
	theme:
		"Cooptación de espacios de base por parte de la política institucional",
	launchDate: "2026-04-27",
	issueDate: "2026-05-01",
} as const;

export type DrawerLinkStyle = "main" | "sub";

export type DrawerSectionDef = {
	key: string;
	style: DrawerLinkStyle;
	placeholder?: string;
};

export type DrawerMenuGroup = {
	label?: string;
	sections: DrawerSectionDef[];
};

/** Orden y placeholders del menú lateral del número actual (acta 2026-03-08). */
export const DRAWER_MENU_GROUPS: DrawerMenuGroup[] = [
	{
		sections: [
			{ key: "Reportajes", style: "main" },
			{
				key: "Entrevistas",
				style: "sub",
				placeholder: "Entrevista a ........",
			},
			{ key: "Opinión", style: "sub" },
		],
	},
	{
		label: "Lado B",
		sections: [
			{ key: "Horóscopo", style: "main", placeholder: "Horóscopo" },
			{
				key: "Quién X eres?",
				style: "sub",
				placeholder: "Quién X eres?",
			},
			{ key: "Memes", style: "sub", placeholder: "Memes" },
			{ key: "Chismes", style: "sub", placeholder: "Chismes" },
			{ key: "Moda", style: "sub", placeholder: "Moda" },
			{
				key: "vino de honor",
				style: "sub",
				placeholder: "Vino de honor",
			},
			{
				key: "cosas que no puedes hacer con un sueldo mínimo",
				style: "main",
				placeholder: "Saldo insuficiente",
			},
			{
				key: "11 organízate entonces",
				style: "main",
				placeholder: "11 organízate entonces",
			},
			{
				key: "las mujeres ya no lloran (emprenden y facturan)",
				style: "sub",
				placeholder: "Las mujeres ya no lloran",
			},
			{
				key: "Tu falta de querer",
				style: "sub",
				placeholder: "Tu falta de querer",
			},
		],
	},
	{
		label: "Audiovisual",
		sections: [
			{ key: "Videos", style: "sub", placeholder: "Videos" },
			{ key: "Reels", style: "sub", placeholder: "Reels" },
			{ key: "Podcast", style: "sub", placeholder: "Podcast" },
		],
	},
];
