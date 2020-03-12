export default function sortItems(items, sortType) {
    if (!items.length) return;
    switch (sortType) {

        case 'alphabet':
            sortByAlphabet(items);
            break;

        case 'age':
            sortByAge(items);
            break;

        case 'donors':
            sortByDonors(items);
            break;

        default:
            sortById(items);
            break;
    }
}

function sortByAlphabet(items) {
    items.sort((a, b) => {
        if (a.domain > b.domain) {
            return 1;
        }
        if (a.domain < b.domain) {
            return -1;
        }
        return 0;
    });
    console.log('Sorted by alpabet');
}

function sortByAge(items) {
    items.sort((a, b) => {
        let _a = 0;
        let _b = 0;

        if (a.links.length && a.links[0].timestamp)
            _a = a.links[0].timestamp;

        if (b.links.length && b.links[0].timestamp)
            _b = b.links[0].timestamp;

        return _a - _b;
    });
    console.log('Sorted by age');
}

function sortByDonors(items) {
    items.sort((a, b) => {
        let _a = parseInt(a.donors.replace(/\s/g, ""));
        let _b = parseInt(b.donors.replace(/\s/g, ""));
        return _b - _a;
    });
    console.log('Sorted by donors');
}

function sortById(items) {
    items.sort((a, b) => a.id - b.id);
    console.log('Sorted by id');
}