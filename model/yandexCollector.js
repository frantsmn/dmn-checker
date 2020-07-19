// const _title = require('./titleCollector');

module.exports = async function (browser, query) {
	const page = await browser.newPage();

	const yandexURL = 'https://yandex.by/search/?' + new URLSearchParams({ text: query, ncrnd: 9890 });
	let result = {

		error: {
			status: false,
			text: ""
		},
		data: []
		// [{
		// 	index, text, url, domain, advertisement
		// }, ...]

	};

	await page.goto(yandexURL, { waitUntil: 'networkidle', networkIdleInflight: 0, networkIdleTimeout: '1000' })
		.then(() => {
			console.log(`>> Открыт yandex по запросу [${query}]`);
		})
		.catch(error => {
			const errorMessage = `ERROR >> Не удалось открыть yandex [${query}]\n${error}\n\n`;
			console.error(errorMessage);
			result.error.text += errorMessage;
			result.error.status = true;
		});

	await page.waitForSelector('#search-result .serp-item', { timeout: 5000 })
		.then(() => {
			console.log(`>> Найдены результаты выдачи`);
		})
		.catch(error => {
			const errorMessage = `ERROR >> Не удалось найти результаты выдачи\n${error}\n\n`;
			console.error(errorMessage);
			result.error.text += errorMessage;
			result.error.status = true;
		});

	await page.evaluate(() => {

		let data = [];
		document.querySelectorAll('.serp-item:not([data-fast-wzrd])')
			.forEach((link, index) => {
				const el = link.querySelector('h2 > .link');
				if (el) {
					let text = el.innerText;
					let url = el.href;
					let domain = new URL(url).host;
					let advertisement = false;
					if (domain === 'yabs.yandex.by') {
						domain = link.querySelector('.organic__subtitle > div.path > a:first-child').innerText;
						advertisement = true;
					}
					data.push({ index, text, url, domain, advertisement });
				}
			});

		return data;

	}).then(async data => {

		result.data = data;

	})
		.catch(error => {
			const errorMessage = `ERROR >> Не удалось собрать выдачу с yandex\n\n${error}\n\n`
			console.error(errorMessage);
			result.error.text += errorMessage;
			result.error.status = true;
		});

	await page.goto('about:blank');
	await page.close();

	console.log(`>> Результаты:`, result);
	console.log(`>> Вкладка yandex закрыта\n\n`);

	return result;
}