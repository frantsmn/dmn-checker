<template>
  <li class="nav-item mr-2 mb-2">
    <a
      v-bind:class="[list.isActive ? 'active' : 'bg-secondary', 'nav-link fs-sm']"
      @click="$emit('switchtab')"
      style="padding: 3px 10px;"
      data-toggle="tab"
      v-bind:href="'#list' + list.id"
    >
      <div v-if="list.isBusy" class="spinner-border spinner-border-sm" style="margin: 0 4px 1px 0">
        <span class="sr-only">Loading...</span>
      </div>
      {{computedName}}
      <button
        v-if="!list.isBusy"
        @click="deleteList(list.id)"
        type="button"
        class="close"
        style="line-height: 100%; margin-left: 6px"
      >
        <span aria-hidden="true" class="mb-2">&times;</span>
      </button>
    </a>
  </li>
</template>

<script>
export default {
  props: ["list", "lists"],
  template: "#list-pill-component",
  computed: {
    computedName() {
      return `Результаты`;
    }
  },
  methods: {
    deleteList(id) {
      const listIndex = this.lists.findIndex(list => list.id === id);
      this.lists.splice(listIndex, 1);
    }
  }
};
</script>

<style>
</style>