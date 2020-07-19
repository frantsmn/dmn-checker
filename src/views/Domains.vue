<template>
  <div class="container">
    <div class="card border-secondary rounded-2">
      <div class="row card-body">
        <!-- Форма -->
        <div class="col">
          <form @submit.prevent="onSubmit" class="col mb-3">
            <div class="form-group">
              <label class="lead" for="domains">Домены</label>
              <textarea
                class="form-control"
                name="domains"
                id="domains"
                rows="7"
                cols="3"
                placeholder="example.com"
                v-model="textareaText"
                v-bind:disabled="blockForm"
              ></textarea>
            </div>

            <input
              class="btn btn-primary mr-2 mb-3"
              type="submit"
              v-bind:disabled="blockForm || !textareaText.length"
              value="Проверить"
            />
            <input
              class="btn btn-outline-danger mb-3"
              type="reset"
              @click="this.textareaText = ''"
              v-bind:disabled="blockForm || !textareaText.length"
              value="Очистить поле"
            />
          </form>
        </div>

        <!-- Сортировка -->
        <div class="col-xs-12 col-md">
          <div class="col border border-secondary rounded p-3 mb-3">
            <div class="form-group">
              <label class="lead">Сортировка</label>
            </div>

            <div class="form-group">
              <div class="custom-control custom-radio mb-1">
                <input
                  v-model="sort"
                  id="sort-by-alphabet"
                  class="custom-control-input"
                  type="radio"
                  name="sort"
                  value="alphabet"
                />
                <label class="custom-control-label" for="sort-by-alphabet">по алфавиту</label>
              </div>

              <div class="custom-control custom-radio mb-1">
                <input
                  v-model="sort"
                  id="sort-by-age"
                  class="custom-control-input"
                  type="radio"
                  name="sort"
                  value="age"
                />
                <label class="custom-control-label" for="sort-by-age">по возрасту</label>
              </div>

              <!-- <div class="custom-control custom-radio">
                <input
                  v-model="sort"
                  id="sort-by-donors"
                  class="custom-control-input"
                  type="radio"
                  name="sort"
                  value="donors"
                />
                <label class="custom-control-label" for="sort-by-donors">по количеству доноров</label>
              </div>-->
            </div>

            <button class="btn btn-sm btn-outline-info" @click="sort = null;">Сбросить</button>
          </div>
        </div>

        <!-- Фильтр -->
        <div class="col-xs-12 col-lg">
          <div class="col-12 border border-secondary p-3 rounded">
            <div class="form-group">
              <label class="lead">Фильтры</label>
            </div>

            <div class="form-group">
              <div class="custom-control custom-switch mb-1">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="firstShot"
                  v-model="filter.firstShot"
                />
                <label class="custom-control-label" for="firstShot">
                  Первый снимок сделан
                  до:
                </label>
              </div>
              <input
                type="month"
                v-model="filter.firstShotDate"
                class="form-control form-control-sm"
                style="max-width: 220px;"
              />
            </div>

            <div class="form-group">
              <div class="custom-control custom-switch mb-1">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="lastShot"
                  v-model="filter.lastShot"
                />
                <label class="custom-control-label" for="lastShot">
                  Последний снимок
                  сделан после:
                </label>
              </div>
              <input
                type="month"
                v-model="filter.lastShotDate"
                class="form-control form-control-sm"
                style="max-width: 220px;"
              />
            </div>

            <hr class="border-secondary ml-n3 mr-n3 mt-4 mb-4" />

            <div class="form-group mb-2">
              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="hideErrors"
                  name="hideErrors"
                  v-model="filter.hideErrors"
                />
                <label class="custom-control-label" for="hideErrors">
                  Скрывать результаты с
                  ошибками
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Прогрессбар -->
      <Progressbar :visiblity="progress.visible" :value="progress.value" :text="progress.text"></Progressbar>
    </div>

    <!-- РЕЗУЛЬТАТЫ -->
    <div class="mt-5" id="container">
      <!-- Вкладки - Pills -->
      <ul class="nav nav-pills">
        <ListPill
          v-for="list in lists"
          :list="list"
          :lists="lists"
          :key="list.id"
          v-on:switchtab="switchTab(list.id)"
        ></ListPill>
      </ul>

      <!-- Контент - Tabs -->
      <div class="tab-content mt-2">
        <List v-for="list in lists" :list="list" :filter="filter" :sort="sort" :key="list.id"></List>
      </div>
    </div>
  </div>
</template>

<script>
import processDomains from "@/js/model/processDomains.js";

import List from "Components/List.vue";
import ListPill from "Components/ListPill.vue";
import Progressbar from "Components/Progressbar.vue";

export default {
  components: { List, ListPill, Progressbar },
  data() {
    return {
      textareaText: "", //Поле
      lists: [], //Сформированные списки результатов проверки

      sort: null, //Настройки сортировки (сохраняются в localstorage, используются компонентом list)
      filter: {
        //Настройки фильтра (сохраняются в localstorage, используются компонентом list)
        firstShot: false,
        firstShotDate: 0,
        lastShot: false,
        lastShotDate: 0,
        hideErrors: false
      },

      blockForm: false, //Необходимо для блокировки формы ввода
      progress: {
        value: 0,
        text: "",
        visible: false
      } //Отображает текущий прогресс в прогрессбаре формы
    };
  },

  //Загрузка состояния из localStorage
  mounted() {
    if (localStorage.textareaText) {
      this.textareaText = localStorage.textareaText;
    }
    if (localStorage.sort) {
      this.sort = localStorage.sort;
    }
    if (localStorage.filter) {
      this.filter = JSON.parse(localStorage.filter);
    }
    if (localStorage.lists) {
      this.lists = JSON.parse(localStorage.lists);
    }
  },

  //Сохранение состояния в localStorage
  watch: {
    textareaText(text) {
      localStorage.textareaText = text;
    },
    sort(sortType) {
      localStorage.sort = sortType;
    },
    filter: {
      handler: function(val, oldVal) {
        let filterState = JSON.stringify(val);
        localStorage.setItem("filter", filterState);
      },
      deep: true
    },
    lists: {
      handler: function(val, oldVal) {
        let lists = JSON.stringify(val);
        localStorage.setItem("lists", lists);
      },
      deep: true
    }
  },

  methods: {
    updateProgress(amount, ready) {
      this.progress.value = (100 / amount) * ready;
    },
    switchTab(id) {
      this.lists.forEach(
        list => (list.isActive = list.id === id ? true : false)
      );
    },

    async onSubmit() {
      this.blockForm = true;
      this.progress.visible = true;

      const list = {
        id: +new Date(),
        name: "Результаты",
        isBusy: true,
        isActive: true,
        domains: [],
        items: []
      };
      //Добавить новую вкладку
      this.lists.unshift(list);
      //Сделать активной новую вкладку
      this.switchTab(list.id);

      await processDomains(list.items, this.textareaText, this.progress, this);

      // await processQueryYandex(list.items, this.textareaText, this.progress);
      // await Promise.all([
      //     () => processTitles(list.items, this.progress),
      //     () => processDomains(list.items, undefined, this.progress)
      // ].map(async func => await func()));
      // await processTitles(list.items, this.progress, this);
      // await processDomains(list.items, undefined, this.progress);

      list.isBusy = false;
      this.progress.visible = false;
      this.blockForm = false;
    }
  }
};
</script>