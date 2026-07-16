export const parseTimestamp = (time: string) => {
	const parts = time.split(":").map((part) => Number(part));

	if (parts.length === 2) {
		return parts[0] * 60 + parts[1];
	}

	return parts[0] ?? 0;
};

export const formatDurationLabel = (duration: string) => {
	if (duration.includes("min")) {
		return duration;
	}

	const [minutesPart, secondsPart] = duration.split(":");
	const minutes = Number(minutesPart);
	const seconds = Number(secondsPart ?? 0);

	if (Number.isNaN(minutes)) {
		return duration;
	}

	if (seconds > 0) {
		return `${minutes}:${String(seconds).padStart(2, "0")} min`;
	}

	return `${minutes} min`;
};

export const getVideoSeekUrl = (videoUrl: string, time: string) => {
	const seconds = parseTimestamp(time);

	if (!videoUrl) {
		return "";
	}

	if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
		const separator = videoUrl.includes("?") ? "&" : "?";
		return `${videoUrl}${separator}t=${seconds}`;
	}

	return `${videoUrl}#t=${seconds}`;
};
