import fetchData from "./fetchData.js";

export default async function processDomains(items, text = undefined, progress) {
	console.group('processDomains()')

	if (items.length === 0 && text) {
		items.push(...text.split('\n').map((domain, id) => ({ domain, id })));
		console.log('items: ', items);
	}

	let itemsCopy = items.slice();
	let groups = [];
	while (itemsCopy.length) {
		groups.push(itemsCopy.splice(0, 3));
	}

	for (const group of groups) {
		progress.text = `Получение данных для доменов: `;
		group.forEach(domain => {
			progress.text += domain.domain + ', ';
		});
		progress.text = progress.text.substring(0, progress.text.length - 2);
		progress.text += '...';

		console.log('<< Request: ', group);
		let response = await fetchData(group, 'domain');
		console.log('>> Response: ', response);

		if (!response) {
			console.log('Break!!!');
			break;
		} else {
			response.forEach(responseItem => {
				let listItemIndex = items.findIndex(item => item.id === responseItem.id);
				//Реактивное обновление элементов массива (объектов) в Vue
				Vue.set(items, listItemIndex, Object.assign({}, items[listItemIndex], responseItem));
			});
		}

	}
	progress.text = '';
	console.log('Done!!!');
	console.groupEnd();
}