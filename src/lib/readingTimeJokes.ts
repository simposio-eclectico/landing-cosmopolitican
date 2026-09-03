export const READING_TIME_JOKES: Record<number, string[]> = {
	1: [
		"rapidito",
		"lo lees esperando que pase la publicidad del YouTube",
		"más de lo que demoras en cortar a ese número desconocido",
		"ni que fuera maratón",
	],
	3: [
		"léelo lavándote los dientes",
		"te acompaña poniendo el agua pal café",
		"te alcanza para buscar las llaves",
		"léelo cuando el uber esté cerca",
        "imagina que es un reel",
	],
	5: [
		"alcanzas a poner agua para el mate",
		"léelo tomando choca en la pega",
		"lo lees esperando el baño",
		"lo que debería durar una ducha «corta»",
		"mejor que explicarle a tu mamá cómo desbloquear el celular",
	],
	7: [
		"alcanzas a colgar la ropa",
		"lo mismo que esperas que cargue la app del banco un lunes",
		"te alcanza para hacerte una ensalada",
        "lo lees haciendo del «dos»",
        "podría ser peor",
        "pero los mejores de tu vida",
	],
	9: [
		"te queda tiempo si estás esperando la micro",
		"alcanzas a lavar los platos",
		"lo lees mientras haces un huevo duro",
		"responde lo que dejaste en visto",
		"alcanzas a hacer fila en el banco, con suerte",
		"puedes sacar a pasear al perro, paradas incluidas",
	],
    12: [
        "ya si igual está largo",
        "una eternidad",
        "pero te prometo que es weno",
        "a la larga es weno",
        "vale la pena",
    ],
};

const READING_TIME_BUCKETS = Object.keys(READING_TIME_JOKES).map(Number).sort(
	(a, b) => a - b,
);

const getNearestBucket = (minutes: number): number =>
	READING_TIME_BUCKETS.reduce((nearest, bucket) =>
		Math.abs(minutes - bucket) < Math.abs(minutes - nearest) ? bucket : nearest,
	);

export const getRandomReadingTimeJoke = (minutes: number): string => {
	const bucket = getNearestBucket(minutes);
	const options = READING_TIME_JOKES[bucket];
	return options[Math.floor(Math.random() * options.length)];
};
