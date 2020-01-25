const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

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

        // res.json([{
        //     id: 0,
        //     domain: 'dev.by',
        //     img: "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",
        //     links: [{ href: "#1", innerText: 'InnerText1' }, { href: "#2", innerText: 'InnerText2' }],
        //     errorText: '',
        //     isError: false
        // }]);
        
    });

})();