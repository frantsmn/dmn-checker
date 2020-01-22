const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;

// headless: false,
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    async function checkDomain(domain) {

        let result = {
            isError: false,
            errorText: '',
            domain: domain,
            img: '',
            links: [],
        };

        const page = await browser.newPage();
        console.log(`INFO >> Открыта новая страница [${domain}]`);
        await page.goto(`http://web.archive.org/web/*/${domain}`, { waitUntil: 'networkidle', networkIdleInflight: 0, networkIdleTimeout: '1000' })
            .catch(function (error) {
                const errorMessage = `ERROR >> Не удалось перейти на страницу [${domain}]\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        if (result.isError) {
            page.close();
            console.log(`INFO >> Страница закрыта [${domain}]\n\n`);
            return result
        } else {
            console.log(`INFO >> Cтраница загружена [${domain}]`);

        }


        await page.waitForSelector('canvas.sparkline-canvas', { timeout: 5000 })
            .catch(function (error) {
                const errorMessage = `ERROR >> Не удалось найти элемент для скриншота\nВозможно информация о таком домене отсутствует, либо ресурс недоступен\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        const container = await page.$('.sparkline-container')
            .catch(function (error) {
                const errorMessage = `ERROR >> Не удалось найти контейнер с информацией для скриншота\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        if (result.isError) {
            page.close();
            console.log(`INFO >> Страница закрыта [${domain}]\n\n`);
            return result
        }

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
            .then(function (links) {
                result.links = links;
            })
            .catch(function (error) {
                const errorMessage = `ERROR >> Не удалось найти ссылки на страницы первого и/или последнего снимка сайта\n\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
            });

        await page.addStyleTag({ content: '.sparkline-container{overflow: visible !important; max-width: unset !important; width: max-content;}' });

        try {
            await container.screenshot()
                .then(function (buffer) {
                    result.img = buffer.toString('base64');
                })
                .catch(function (error) {
                    const errorMessage = `ERROR >> Не удалось сделать скриншот\n\n${error}\n\n`
                    console.error(errorMessage);
                    result.errorText += errorMessage;
                    result.isError = true;
                });
        } catch (error) {
            const errorMessage = `ERROR >> Не удалось сделать скриншот\n\n${error}\n\n`
            console.error(errorMessage);
            result.errorText += errorMessage;
            result.isError = true;
        }

        console.log(`INFO >> Собран объект:\n`, result);
        page.close();
        console.log(`INFO >> Страница закрыта [${domain}]`);

        return result;
    }

    app.use(express.static('public'));

    app.listen(port, function () { console.log('App listening on port ' + port); });

    app.post('/domain', express.json({ type: 'application/json' }), async function (req, res) {
        let responseData = [];

        // await (async () => {

        // for (let domain of req.body.domains) {
        //     let obj = await checkDomain(domain)
        //     responseData.push(obj);
        // }

        async function processArray(array) {
            // делаем "map" массива в промисы
            const promises = array.map(async (domain) => {
                let result = await checkDomain(domain);
                responseData.push(result);
            });
            // ждем когда всё промисы будут выполнены
            await Promise.all(promises);
            console.log('Done!');
        }

        await processArray(req.body.domains);

        res.json(responseData);

        // })();


    });

})();


// var parseUrl = function (url) {
//     url = decodeURIComponent(url)
//     if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
//         url = 'http://' + url;
//     }
//     return url;
// };

// app.get('/domains', function (req, res) {

//     const domains = decodeURIComponent(req.query.domains);
//     console.log(domains);

//     let response = {
//         domains: domains.split('\r\n')
//     };

//     for (var i = 0; i < response.domains.length; i++) {
//         console.log(response.domains[i]);
//     }

//     res.json(response);
// });




