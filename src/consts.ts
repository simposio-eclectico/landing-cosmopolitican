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

export const CURRENT_ISSUE = {
	number: "Nº 01",
	title: "Cooptación",
	theme:
		"Cooptación de espacios de base por parte de la política institucional",
	launchDate: "2026-04-27",
	issueDate: "2026-05-01",
} as const;

export type DrawerLinkStyle = "main" | "sub";
