const _title = require('./title');

module.exports = async function (browser, query) {
	const page = await browser.newPage();
	const yandexURL = 'https://yandex.by/search/?' + new URLSearchParams({ text: query, ncrnd: 9890 });
	let result = {};

	await page.goto(yandexURL, { waitUntil: 'networkidle', networkIdleInflight: 0, networkIdleTimeout: '3000' })
		.then(() => {
			console.log(`>> Открыт yandex по запросу [${query}]`);
		})
		.catch(error => {
			const errorMessage = `ERROR >> Не удалось открыть yandex [${query}]\n${error}\n\n`;
			console.error(errorMessage);
			result.errorText += errorMessage;
			result.isError = true;
		});

	await page.waitForSelector('#search-result .serp-item', { timeout: 3000 });

	await page.evaluate(() => {

		let data = [];
		document.querySelectorAll('.serp-item:not([data-fast-wzrd])').forEach(position => {
			let el = position.querySelector('h2 > .link');
			let text = el.innerText;
			let url = el.href;
			let domain = new URL(url).host;
			let isRedirect = false;
			if (domain === 'yabs.yandex.by') {
				domain = position.querySelector('.organic__subtitle > div.path > a:first-child').innerText;
				isRedirect = true;
			}

			data.push({ text, url, domain, isRedirect });
		});

		return data;

	}).then(async data => {

		for await (item of data) {
			item.id = +new Date();
			item.title = await _title(item.url);
		}

		// console.log(`>> Выдача с yandex:`, data);
		result = data;

	})
		.catch(error => {
			const errorMessage = `ERROR >> Не удалось собрать выдачу с yandex\n\n${error}\n\n`
			console.error(errorMessage);
			result.errorText += errorMessage;
		});

	await page.goto('about:blank');
	await page.close();
	console.log(`>> Вкладка yandex закрыта\n\n`);
	return result;
}