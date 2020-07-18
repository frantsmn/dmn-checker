import fetchData from "./fetchData.js";

export default async function processDomains(items, text = undefined, progress, _vue) {
	console.group('processDomains()')

	const domains = [];

	domains.push(...text.split('\n').map((domain, id) => ({ domain, id })));
	console.log('domains: ', domains);

	let domainsCopy = domains.slice();
	let groups = [];
	while (domainsCopy.length) {
		groups.push(domainsCopy.splice(0, 3));
	}

	for (let [key, group] of Object.entries(groups)) {
		progress.value = 100 / (groups.length - 1) * key;
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
			console.error(`Данные о доменах ${progress.text} получить не удалось\nОшибка сервера!`);
			alert(`Данные о доменах ${progress.text} получить не удалось\nОшибка сервера!`);
		} else {
			response.forEach(responseItem => {
				let listItemIndex = domains.findIndex(domain => domain.id === responseItem.data.id);
				//Реактивное добавление элементов массива (объектов) в Vue
				_vue.$set(items, listItemIndex, Object.assign({}, items[listItemIndex], responseItem));
			});
		}

	}
	progress.value = 0;
	progress.text = '';
	console.log('Done!!!');
	console.groupEnd();
}