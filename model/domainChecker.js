const grabFromWebArchive = require('./webArchive.js');
// const grabFromLinkpad = require('./linkpad.js');

async function checkDomain(browser, params) {

    const result = {

        error: {
            status: false,
            text: ""
        },

        data: {
            id: params.id,
            domain: params.domain,
            img: "",
            links: [
                // {
                //     href: "",
                //     innerText: "",
                //     timestamp: 0,
                // }
            ]
        }

    };

    if (/^(?!:\/\/)([а-яА-Яa-zA-Z0-9-_]+\.)*[а-яА-Яa-zA-Z0-9][а-яА-Яa-zA-Z0-9-_]+\.[а-яА-Яa-zA-Z]{2,11}?$/igm.test(params.domain) === false) {
        result.error.text = `«${params.domain}» не является доменным именем`;
        result.error.status = true;
        return result;
    }

    await Promise.all([
        grabFromWebArchive(browser, result),
        // grabFromLinkpad(browser, result)
    ]);

    console.log(`[domainChecker.js] >> Домен ${params.domain} проверен!\n\n`);
    return result;
}

module.exports = async function (browser, domains) {

    let array = [],
        response = [];

    array = domains.length > 3 ? domains.slice(0, 3) : domains;

    // Делаем "map" массива в промисы
    const promises = array.map(
        async domain => {
            await checkDomain(browser, domain)
                .then(info => response.push(info))
                .catch(error => console.error('[domainChecker.js] >> ERROR >> Не удалось проверить домен!', error))
        });

    await Promise.all(promises);
    console.log('[domainChecker.js] >> Все домены проверены!\n\n');
    return response;
}