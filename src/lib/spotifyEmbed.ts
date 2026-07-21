const SPOTIFY_HOST = "open.spotify.com";

const SPOTIFY_EMBED_TYPES = [
	"episode",
	"show",
	"track",
	"album",
	"playlist",
] as const;

export const isSpotifyUrl = (spotifyUrl: string) => {
	try {
		const url = new URL(spotifyUrl);
		return (
			url.hostname === SPOTIFY_HOST ||
			url.hostname === `www.${SPOTIFY_HOST}`
		);
	} catch {
		return false;
	}
};

export const getSpotifyEmbedUrl = (spotifyUrl: string) => {
	if (!isSpotifyUrl(spotifyUrl)) {
		return "";
	}

	try {
		const url = new URL(spotifyUrl);
		const [type, id] = url.pathname.split("/").filter(Boolean);

		if (!type || !id || !SPOTIFY_EMBED_TYPES.includes(type as typeof SPOTIFY_EMBED_TYPES[number])) {
			return "";
		}

		return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
	} catch {
		return "";
	}
};
