<template>
  <div class="container">
    <div class="card border-secondary rounded-2">
      <div class="row card-body">
        <!-- Форма -->
        <div class="col">
          <form @submit.prevent="onSubmit" class="col mb-3">
            <div class="form-group">
              <label class="lead" for="query">Поисковый запрос</label>
              <input
                class="form-control"
                name="query"
                id="query"
                placeholder="Yandex"
                v-model="queryText"
                v-bind:disabled="blockForm"
              />
            </div>

            <input
              class="btn btn-primary mr-2 mb-3"
              type="submit"
              v-bind:disabled="blockForm || !queryText.length"
              value="Проверить"
            />
            <input
              class="btn btn-outline-danger mb-3"
              type="reset"
              @click="this.textareaText = ''"
              v-bind:disabled="blockForm || !queryText.length"
              value="Очистить поле"
            />
          </form>
        </div>
      </div>
      <!-- Прогрессбар -->
      <Progressbar :visiblity="progress.visible" :value="progress.value" :text="progress.text"></Progressbar>
    </div>

    <!-- РЕЗУЛЬТАТЫ -->
    <div class="mt-5 container">
      <!-- Вкладки - Pills -->
      <!-- <ul class="nav nav-pills">
        <ListPill
          v-for="table in tables"
          :table="table"
          :tables="tables"
          :key="table.id"
          v-on:switchtab="switchTab(list.id)"
        ></ListPill>
      </ul>-->

      <!-- Контент - Tabs -->
      <div class="tab-content mt-2">
        <Table v-for="(table, index) in tables" :data="table" :key="index" />
      </div>
    </div>
  </div>
</template>

<script>
import processQueryYandex from "@/js/model/processQueryYandex.js";
import processTitles from "@/js/model/processTitles.js";

import Table from "Components/Table.vue";
import ListPill from "Components/ListPill.vue";
import Progressbar from "Components/Progressbar.vue";

export default {
  components: { Table, ListPill, Progressbar },

  data() {
    return {
      queryText: "", //Поле запроса

      tables: [
        // [{
        //   index: 8,
        //   text: "Google\n",
        //   url: "https://www.reddit.com/r/google/",
        //   domain: "www.reddit.com",
        //   advertisement: false,
        //   meta: {
        //     site: {
        //       name: "reddit",
        //       theme_color: "#ffffff",
        //       canonical: "https://www.reddit.com/r/google/",
        //       logo:
        //         "https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-180x180.png",
        //       favicon:
        //         "https://www.redditstatic.com/desktop2x/img/favicon/favicon-16x16.png",
        //       manifest:
        //         "https://www.redditstatic.com/desktop2x/img/favicon/manifest.json"
        //     },
        //     description:
        //       "r/google: For news and announcements from and about Google",
        //     title: "r/google",
        //     type: "website",
        //     image:
        //       "https://styles.redditmedia.com/t5_2qh45/styles/communityIcon_4h5jbvy6v6z41.png?width=256&s=2dc1435f7deb4e3e2012825d5fe6844b04fc5d9b"
        //   }
        // }]
      ], //Сформированные таблицы результатов

      blockForm: false, //Необходимо для блокировки формы ввода

      progress: {
        value: 0,
        text: "",
        visible: false
      } //Отображает текущий прогресс в прогрессбаре формы
    };
  },
  methods: {
    async onSubmit() {
      this.progress.visible = true;
      this.blockForm = true;

      let result = await processQueryYandex(this.queryText, this.progress);
      result = await processTitles(result.data, this.progress, this);

      this.tables.push(result);
      console.log(result);
      this.blockForm = false;
      this.progress.visible = false;
    }
  }
};
</script>

<style>
</style>