const grabFromWebArchive = require('./webArchive.js');
// const grabFromLinkpad = require('./linkpad.js');

module.exports = async function checkDomain(browser, params) {

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