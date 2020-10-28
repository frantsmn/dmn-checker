import fetchData from "./fetchData.js";

export default async function processDomains(items, text = undefined, progress, _vue) {
	console.group('Проверка доменов...')

	// Флаг на остановку цикла проверки при фатальной ошибке
	let fatalError = false;

	// Создать массив доменов
	const domains = [];
	domains.push(...text.split('\n').map((domain, id) => ({ domain, id })));
	console.log('[processDomains.js] >> Создан массив доменов: ', domains);

	// Создать копию массива доменов
	let domainsCopy = domains.slice();
	let groups = [];
	// Разделить её на группы по 3 домена в каждой
	while (domainsCopy.length) {
		groups.push(domainsCopy.splice(0, 3));
	}

	// Для каждой группы
	for (let [key, group] of Object.entries(groups)) {

		console.group('Проверка группы доменов...')
		console.log('[processDomains.js] >> Формируются запросы для группы: ', group);

		// Подсчет прогресса
		progress.value = 100 / (groups.length - 1) * key;
		progress.text = `Получение данных для доменов: `;
		group.forEach(domain => {
			progress.text += domain.domain + ', ';
		});
		progress.text = progress.text.substring(0, progress.text.length - 2);
		progress.text += '...';

		// Каждый элемент в группе становится промисом
		const promises = group.map(
			async domain => {
				await fetchData(domain, 'domain')
					.then(response => {
						if (response) {
							// Дополняем объект домента информацией с сервера
							Object.assign(domain, response);
							console.log('[processDomains.js] >> Получен ответ для ', domain.domain, response);
						} else {
							console.error('[processDomains.js] >> Не удалось получить ответ для ', domain.domain, error);
							domain.error = {
								fatal: true,
								status: true,
								text: `Не удалось проверить домен! Сервер не отвечает! ${error}`
							};
						}
					})
					//???
					.catch(error => {
						console.error('[processDomains.js] >> Не удалось получить ответ для ', domain.domain, error);
						domain.error = {
							fatal: true,
							status: true,
							text: `Не удалось проверить домен! Сервер не отвечает! ${error}`
						};
					});
			});

		// Обработка группы доменов
		await Promise.all(promises);

		group.forEach(updatedDomain => {
			if (updatedDomain.error.fatal) {
				console.log('!!!!!!!!! FATAL ERROR !!!!!!!!!');
				fatalError = true;
				return;
			}
			const id = updatedDomain.id;

			// Обновляем массив do vue
			// По индексу "id" в массиве items устанавливаем обновленный домен
			_vue.$set(items, id, Object.assign({}, items[updatedDomain.data.id], updatedDomain));
		});

		console.groupEnd();
		if (fatalError) {
			alert("Ошибка! Проверка остановлена. Сервер перестал отвечать. Для дальнейшей работы убери из списка уже проверенные домены и запусти снова.");
			break;
		}
	}

	progress.value = 0;
	progress.text = '';
	console.log('[processDomains.js] >> Проверка завершена!');
	console.groupEnd();
}