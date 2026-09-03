import ArticleAside from "@components/revista/ArticleAside.astro";
import ArticleFigure from "@components/revista/ArticleFigure.astro";
import SpotifyEmbed from "@components/revista/SpotifyEmbed.astro";
import ZodiacIcon from "@components/revista/ZodiacIcon.astro";
import ArticuloCierre from "@components/texto/ArticuloCierre.astro";
import CustomQuote from "@components/texto/CustomQuote.astro";

export const revistaMdxComponents = {
	ArticleAside,
	ArticleFigure,
	SpotifyEmbed,
	ZodiacIcon,
	ArticuloCierre,
	blockquote: CustomQuote,
};
