require('dotenv').config();

const base64Credentials = Buffer.from(process.env.URLMETA).toString('base64');
const fetch = require('node-fetch');

async function grabTitle(url) {
	const response = await fetch(`https://api.urlmeta.org/?url=${url}`, {
		method: 'GET',
		headers: {
			'Authorization': 'Basic ' + base64Credentials
		}
	})
	return await response.json();
}

module.exports = async (array) => {
	await Promise.all(array.map(async item => {
		item.meta = (await grabTitle((item.url))).meta;
		console.log('TITLE =>>>>>>>>>>');
		console.log(item);
	}));
	return array;
}

// async function grabTitle2(browser, url) {
// 	const page = await browser.newPage();
// 	let title = '(не найден)';

// 	if (url.indexOf("yabs.yandex.by") > -1) {
// 		console.log('Waiting for redirect...');
// 		await page.waitFor(5000);
// 	}

// 	await page.goto(url, { waitUntil: 'networkidle', networkIdleInflight: 1, networkIdleTimeout: 1000 })
// 		.then(async () => {
// 			console.log(`>> Открыта страница [${page.url()}]`);
// 		})
// 		.catch((error) => console.log('\n\nERROR >> ', error, '\n\n'));

// 	await page
// 		.waitForSelector('body')
// 		.then(async () => {
// 			console.log(`>> Загружен документ [${page.url()}]`);
// 			title = await page.evaluate(() => document.title)
// 			console.log(`>> Найден тайтл ${title}`);
// 			title = !title.length ? '(редирект)' : title;
// 		})
// 		.catch((error) => console.log('\n\nERROR >> ', error, '\n\n'));

// 	await page.goto('about:blank');
// 	await page.close();

// 	return title;
// }

