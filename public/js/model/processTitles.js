import fetchData from "./fetchData.js";

export default async function processTitles(items, progress) {
	console.group('processTitles()');
	progress.text = 'Получение тайтлов для результата выдачи...';

	if (items && items.length) {
		console.log('<< Request: ', items);
		const response = await fetchData(items, 'title');
		console.log('>> Response: ', response);

		response.forEach(responseItem => {
			let listItemIndex = items.findIndex(item => item.id === responseItem.id);
			//Реактивное обновление элементов массива (объектов) в Vue
			Vue.set(items, listItemIndex, Object.assign({}, items[listItemIndex], responseItem));
		});

	}

	progress.text = '';
	console.log('Done!!!');
	console.groupEnd();
}