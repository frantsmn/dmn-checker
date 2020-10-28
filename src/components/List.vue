<template>
  <div v-bind:id="'list' + list.id" v-bind:class="[list.isActive ? 'active' : '', 'tab-pane']">
    <Card v-for="item in computedItems" :item="item" :key="item.id"></Card>
  </div>
</template>

<script>
import Card from "Components/Card.vue";

import filterItems from "@/js/utils/filterItems.js";
import sortItems from "@/js/utils/sortItems.js";

export default {
  components: { Card },
  props: ["list", "filter", "sort"],
  computed: {
    computedItems() {
      //Вычисления делать только для АКТИВНОГО списка
      if (!this.list.isActive) return this.list.items;

      let computedItems = [...this.list.items];
      computedItems = filterItems(computedItems, this.filter);
      sortItems(computedItems, this.sort);
      return computedItems;
    }
  }
};
</script>