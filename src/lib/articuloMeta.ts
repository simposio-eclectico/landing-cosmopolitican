import { getRandomReadingTimeJoke } from "@lib/readingTimeJokes";

const WORDS_PER_MINUTE = 200;

export const getReadingMeta = (body: string) => {
	const plainText = body
		.replace(/```[\s\S]*?```/g, "")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/[#>*_~`|-]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	const words = plainText ? plainText.split(" ").length : 0;
	const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

	return {
		words,
		minutes,
		readingTimeJoke: getRandomReadingTimeJoke(minutes),
	};
};

export const formatWordCount = (words: number) =>
	new Intl.NumberFormat("es-CL").format(words);
