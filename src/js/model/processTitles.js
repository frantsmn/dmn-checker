import fetchData from "./fetchData.js";

export default async function processTitles(items, progress, _vue) {
	console.group('processTitles()');
	progress.text = 'Получение тайтлов для результата выдачи...';


	let itemsCopy = items.slice();
	let groups = [];
	while (itemsCopy.length) {
		groups.push(itemsCopy.splice(0, 3));
	}

	for (let [key, group] of Object.entries(groups)) {
		progress.value = 100 / (groups.length - 1) * key;
		progress.text = `Получение тайтлов для доменов: `;
		group.forEach(domain => {
			progress.text += domain.domain + ', ';
		});
		progress.text = progress.text.substring(0, progress.text.length - 2);
		progress.text += '...';

		console.log('<< Request: ', group);
		const response = await fetchData(group, 'title');
		console.log('>> Response: ', response);

		if (!response) {
			console.log('Break!!!');
			break;
		} else {
			response.forEach(responseItem => {
				let listItemIndex = items.findIndex(item => item.id === responseItem.id);
				//Реактивное обновление элементов массива (объектов) в Vue
				_vue.$set(items, listItemIndex, Object.assign({}, items[listItemIndex], responseItem));
			});
		}

	}

	// if (items && items.length) {
	// 	console.log('<< Request: ', items);
	// 	const response = await fetchData(items, 'title');
	// 	console.log('>> Response: ', response);

	// 	response.forEach(responseItem => {
	// 		let listItemIndex = items.findIndex(item => item.id === responseItem.id);
	// 		//Реактивное обновление элементов массива (объектов) в Vue
	// 		Vue.set(items, listItemIndex, Object.assign({}, items[listItemIndex], responseItem));
	// 	});

	// }

	progress.value = 0;
	progress.text = '';
	console.log('Done!!!');
	console.groupEnd();
}