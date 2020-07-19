<template>
  <table class="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Img</th>
        <th scope="col">Name</th>
        <th scope="col">Link</th>
        <th scope="col">Title</th>
        <th scope="col">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data" :key="item.index">
        <th scope="row">{{item.index}}</th>
        <td>
          <img class="table__image" v-if="item.meta" :src="item.meta.site.favicon" />
        </td>
        <td>{{item.text}}</td>
        <td>
          <a class="table__link" :href="item.url">{{item.url}}</a>
        </td>
        <td>
          <span v-if="item.meta">{{item.meta.title}}</span>
        </td>
        <td>
          <span v-if="item.meta">{{item.meta.description}}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: ["data"]
};
</script>

<style lang='scss'>
.table {
  &__image {
    max-width: 50px;
    width: 100%;
    object-fit: scale-down;
  }

  &__link {
		display: inline-block;
		max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>