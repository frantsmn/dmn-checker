const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8081;

(async () => {
    // headless: false,
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    async function checkDomain(obj) {

        let page;

        let result = {
            id: obj.id,
            domain: obj.domain,
            img: '',
            links: [],
            isError: false,
            errorText: ''
        };

        if (/^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/igm.test(obj.domain) === false) {
            result.errorText = `«${obj.domain}» не является доменным именем`;
            result.isError = true;
            return result;
        }

        async function grabInfo(page, container, result) {

            await page.addStyleTag({
                content: '.sparkline-container{overflow: visible !important; max-width: unset !important; width: max-content;}'
            })
                .then(() => {
                    console.log(`INFO >> Добавлены стили для контейнера [${result.domain}]`);
                })
                .catch(error => {
                    const errorMessage = `ERROR >> Не удалось добавить стили для контейнера [${result.domain}]\n\n${error}\n\n`
                    console.error(errorMessage);
                    result.errorText += errorMessage;
                    result.isError = true;
                });

            await container.screenshot()
                .then(buffer => {
                    result.img = buffer.toString('base64');
                })
                .catch(error => {
                    const errorMessage = `ERROR >> Не удалось сделать скриншот\n\n${error}\n\n`
                    console.error(errorMessage);
                    result.errorText += errorMessage;
                    result.isError = true;
                });

            await page.evaluate(() => {
                let links = [];
                document.querySelectorAll('.captures-range-info a')
                    .forEach(a => {
                        links.push({
                            href: a.href,
                            innerText: a.innerText
                        });
                    });
                return links;
            })
                .then(links => {
                    console.log(`INFO >> Найдены ссылки на страницы первого и последнего снимка сайта [${result.domain}]`);
                    result.links = links;
                })
                .catch(error => {
                    const errorMessage = `ERROR >> Не удалось найти ссылки на страницы первого и последнего снимка сайта [${result.domain}]\n\n${error}\n\n`
                    console.error(errorMessage);
                    result.errorText += errorMessage;
                });

        }

        try {
            page = await browser.newPage();
        } catch (error) {
            const errorMessage = `ERROR >> Не удалось открыть вкладку [${obj.domain}]\n${error}\n\n`;
            console.error(errorMessage);
            result.errorText += errorMessage;
            result.isError = true;
            return result;
        }

        await page.goto(`http://web.archive.org/web/*/${obj.domain}`, { waitUntil: 'networkidle', networkIdleInflight: 0, networkIdleTimeout: '1000' })
            .then(() => {
                console.log(`INFO >> Открыта страница [${obj.domain}]`);
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось перейти на страницу [${obj.domain}]\n${error}\n\n`;
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        await page.waitForSelector('#wm-graph-anchor', { timeout: 5000 })
            .then(() => {
                console.log(`INFO >> Найдено содержимое для скриншота [${obj.domain}]`);
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось найти содержимое для скриншота [${obj.domain}]\nВозможно страница с информацией о таком домене отсутствует, либо ресурс недоступен\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        await page.$('.sparkline-container')
            .then(async container => {
                if (container) {
                    console.log(`INFO >> Найден контейнер с информацией для скриншота [${obj.domain}]`);

                    await grabInfo(page, container, result)
                        .catch(error => {
                            const errorMessage = `ERROR >> Не удалось собрать информацию [${obj.domain}]\n${error}\n\n`
                            console.error(errorMessage);
                            result.errorText += errorMessage;
                            result.isError = true;
                        });
                }
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось найти контейнер с информацией для скриншота [${obj.domain}]\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        await page.goto('about:blank');
        await page.close();
        console.log(`INFO >> Собран объект:\n`, result);
        console.log(`INFO >> Вкладка закрыта [${obj.domain}]\n\n`);

        return result;
    }

    app.use(express.static('public'));

    app.listen(port, function () { console.log('App listening on port ' + port); });

    app.post('/domain', express.json({ type: 'application/json' }), async function (req, res) {
        let responseData = [];

        async function processArray(domains) {

            let array = domains.length > 3 ? domains.slice(0, 3) : domains;

            // делаем "map" массива в промисы
            const promises = array.map(
                async domain => {
                    await checkDomain(domain)
                        .then(result => responseData.push(result))
                        .catch(error => console.error('ERROR >> Не удалось проверить домен', error))
                });

            // ждем когда все промисы будут выполнены
            await Promise.all(promises);
            console.log('INFO >> Все промисы выполнены!');
        }

        await processArray(req.body.domains);

        res.json(responseData);
    });

})();