<template>
  <div v-bind:class="[item.error.status ? 'border-danger' : 'border-success', 'card mb-3']">
    <div class="card-body p-3">
      <h4 class="m-0 p-0">
        <a :href="'https://' + item.data.domain" target="_blank">{{ item.data.domain }}</a>
      </h4>
    </div>

    <small v-if="item.error.status" class="card-body text-danger py-0">{{ item.error.text }}</small>

    <div v-if="item.data.img.length" class="card__image-wrapper ml-3 mr-3 rounded">
      <img class="card__image" v-bind:src="'data:image/png;base64,' + item.data.img" />
    </div>

    <div class="card-body p-3 row">
      <div class="col-12 col-lg-4">
        <p class="pt-1 pb-1 m-0">
          Подробно на
          <a
            v-bind:href="'http://web.archive.org/web/*/' + item.data.domain"
            target="_blank"
          >web.archive.org</a>
        </p>
        <p class="pt-1 pb-1 m-0">
          Подробно на
          <a
            v-bind:href="'https://www.linkpad.ru/?search=' + item.data.domain"
            target="_blank"
          >linkpad.ru</a>
        </p>
      </div>
      <div v-if="item.data.links.length" class="col-12 col-md-4">
        <p class="pt-1 pb-1 m-0" v-if="item.data.links[0]">
          Первый снимок
          <a
            :href="item.data.links[0].href"
            target="_blank"
          >{{ item.data.links[0].innerText }}</a>
        </p>
        <p class="pt-1 pb-1 m-0" v-if="item.data.links[1]">
          Последний снимок
          <a
            :href="item.data.links[1].href"
            target="_blank"
          >{{ item.data.links[1].innerText }}</a>
        </p>
        <p class="pt-1 pb-1 m-0" v-else-if="item.data.links[0]">
          Последний снимок
          <a
            :href="item.data.links[0].href"
            target="_blank"
          >{{ item.data.links[0].innerText }}</a>
        </p>
      </div>
      <!-- <div class="col-12 col-lg-4">
        <p class="pt-1 pb-1 m-0" v-if="item.meta">
          Тайтл
          <a v-bind:href="item.url" target="_blank">{{ item.meta.title }}</a>
        </p>
      </div>-->
    </div>
  </div>
</template>

<script>
export default {
  props: ["item"]
}
</script>

<style lang="scss">
.card__image-wrapper {
  display: flex;
  overflow-y: auto;
  flex-flow: column;
  direction: rtl;

  & img {
    width: auto;
    min-height: 80px;
    margin: 0 auto;
  }
}
</style>