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
        if (a.links.length && b.links.length) {
            let _a = a.links[0].timestamp;
            let _b = b.links[0].timestamp;
            if (_a < _b) return -1;
            if (_a > _b) return 1;
            return 0
        } else {
            return -1;
        }
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