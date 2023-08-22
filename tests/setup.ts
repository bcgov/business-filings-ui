/**
 * This file is to provide the correct setup for the Vue instance.
 * It can save people time when writing tests, as they won't need to figure out
 * why some of the errors are showing up due to Vue not having the plugins it needs.
 */
import Vue from 'vue'
import Vue2Filters from 'vue2-filters'
import Vuelidate from 'vuelidate'
import Vuetify from 'vuetify'

Vue.use(Vue2Filters) // needed by SbcFeeSummary
Vue.use(Vuelidate) // needed by BaseAddress
Vue.use(Vuetify)
