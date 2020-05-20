
async function grabTitle(browser, url) {
	const page = await browser.newPage();
	let title = '(не найден)';

	if (url.indexOf("yabs.yandex.by") > -1) {
		console.log('Waiting for redirect...');
		await page.waitFor(5000);
	}

	await page.goto(url, { waitUntil: 'networkidle', networkIdleInflight: 1, networkIdleTimeout: 1000 })
		.then(async () => {
			console.log(`>> Открыта страница [${page.url()}]`);
		})
		.catch((error) => console.log('\n\nERROR >> ', error, '\n\n'));

	await page
		.waitForSelector('body')
		.then(async () => {
			console.log(`>> Загружен документ [${page.url()}]`);
			title = await page.evaluate(() => document.title)
			console.log(`>> Найден тайтл ${title}`);
			title = !title.length ? '(редирект)' : title;
		})
		.catch((error) => console.log('\n\nERROR >> ', error, '\n\n'));

	await page.goto('about:blank');
	await page.close();

	return title;
}

module.exports = async (browser, array) => {
	await Promise.all(array.map(async item => {
		item.title = await grabTitle(browser, (item.url));
	}));
	return array;
}