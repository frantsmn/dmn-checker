import Vue from 'vue'
import VueRouter from 'vue-router'
import Domains from "../views/Domains.vue";
// import Meta from "../views/Meta.vue";
// import About from "../views/About.vue";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Domains',
    component: Domains
  },
  {
    path: '/meta',
    name: 'Meta',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/Meta.vue')
    }
  }
]

export default new VueRouter({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes
})