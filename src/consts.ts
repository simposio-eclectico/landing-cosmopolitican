export const SITE_NAME = "Cosmopolitican";
export const SITE_SLOGAN = "Tu revista con Clase";
export const SITE_TITLE = `${SITE_NAME} | ${SITE_SLOGAN}`;
export const SITE_DESCRIPTION = `Descubre ${SITE_NAME}, la revista digital definitiva para la dama y el varón. Moda, cultura, tendencias y estilo de vida con un toque de distinción y clase.`;
export const SITE_MAIL = "contacto.cosmopolitican@gmail.com";
export const SHOW_UNDER_CONSTRUCTION = true;

export const CATEGORIES = {
	LIGERO: "Contenido ligero",
	NARRATIVO: "Contenido narrativo",
	AUDIOVISUAL: "Contenido audiovisual",
} as const;

export const MENU_SECTIONS = [
	"editorial",
	"reportajes",
	"columnas",
	"entrevistas",
	"podcast",
	"internacional",
	"horoscopo",
] as const;

export type MenuSection = (typeof MENU_SECTIONS)[number];

export const MENU_SECTION_LABELS: Record<MenuSection, string> = {
	editorial: "Editorial",
	reportajes: "Reportajes",
	columnas: "Columnas",
	entrevistas: "Entrevistas",
	podcast: "Podcast",
	internacional: "Internacional",
	horoscopo: "Horóscopo",
};

export const MENU_SECTION_DESCRIPTIONS: Record<MenuSection, string> = {
	editorial:
		"La palabra de la redacción en cada número: contexto, tono y punto de partida de la edición.",
	reportajes:
		"Historias largas desde el terreno: investigación, crónica y mirada de clase sobre lo que pasa.",
	columnas:
		"Opinión, crónica y texto breve: reflexiones sobre trabajo, barrio y política cotidiana.",
	entrevistas:
		"Conversaciones con quienes piensan, organizan y disputan el presente.",
	podcast:
		"Episodios de audio para escuchar en la micro, en el turno o donde caiga.",
	internacional:
		"Miradas desde y hacia afuera: conflictos, solidaridades y debates globales.",
	horoscopo:
		"Tu guía astral: predicciones y reflexiones según tu signo zodiacal.",
};

export const TOP_NAV_MENU_SECTIONS = MENU_SECTIONS.filter(
	(section) => section !== "editorial",
).map((section) => ({
	slug: section,
	label: MENU_SECTION_LABELS[section],
	href: `/revista/seccion/${section}`,
}));

export const CURRENT_ISSUE = {
	number: "Nº 01",
	title: "Cooptación",
	theme:
		"Cooptación de espacios de base por parte de la política institucional",
	launchDate: "2026-04-27",
	issueDate: "2026-05-01",
} as const;

export type DrawerLinkStyle = "main" | "sub";
