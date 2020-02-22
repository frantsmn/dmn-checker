export const filterItems = {
    hideErrors: (event, items) => {
        items = event.target.checked ? items.filter(item => !item.isError) : items;
        console.log(items);
    }
};