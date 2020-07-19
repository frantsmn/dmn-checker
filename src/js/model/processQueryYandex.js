import fetchData from "./fetchData.js";

export default async function processQuery(query, progress) {
	let result = {};
	console.group('processQueryYandex()')
	progress.text = 'Получение поисковой выдачи Yandex...';

	if (query.trim()) {
		console.log('<< Request: ', query);
		const response = await fetchData({ query }, 'search');
		console.log('>> Response: ', response);

		if (!response) {
			console.error(`Данные поисковой выдачи Yandex получить не удалось\nОшибка сервера!`);
			alert(`Данные поисковой выдачи Yandex получить не удалось\nОшибка сервера!`);
		} else {
			result = response;
		}
	}

	progress.text = '';
	console.log('Done!!!');
	console.groupEnd();
	return result;
}