import ArticleFigure from "@components/revista/ArticleFigure.astro";
import SpotifyEmbed from "@components/revista/SpotifyEmbed.astro";
import CustomQuote from "@components/texto/CustomQuote.astro";

export const revistaMdxComponents = {
	ArticleFigure,
	SpotifyEmbed,
	blockquote: CustomQuote,
};
