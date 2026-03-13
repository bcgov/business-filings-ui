import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import EnvironmentPlugin from 'vite-plugin-environment'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const appName = JSON.parse(packageJson).appName
const appVersion = JSON.parse(packageJson).version
const sbcName = JSON.parse(packageJson).sbcName
const sbcVersion = JSON.parse(packageJson).dependencies['sbc-common-components']

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    define: {
      'import.meta.env.ABOUT_APP': `"${appName} v${appVersion}"`,
      'import.meta.env.ABOUT_SBC': `"${sbcName} v${sbcVersion}"`,
      'import.meta.env.APP_NAME': `"${appName}"`
    },
    envPrefix: 'VUE_APP_', // Need to remove this after fixing vaults. Use import.meta.env with VUE_APP.
    plugins: [
      vue(),
      EnvironmentPlugin({
        BUILD: 'web' // Fix for Vuelidate, allows process.env with Vite.
      }),
      // Rewrite @vue/composition-api imports to 'vue' in sbc-common-components.
      // The standalone polyfill has a separate reactivity system from Vue 2.7's built-in
      // composition API, which breaks computed properties (e.g. isAuthenticated in auth store).
      {
        name: 'rewrite-composition-api',
        transform (code, id) {
          if (id.includes('sbc-common-components') && code.includes('@vue/composition-api')) {
            return code.replace(/@vue\/composition-api/g, 'vue')
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@/util/constants': path.resolve(__dirname, 'node_modules/sbc-common-components/src/util/constants'),
        // SBC-Common-Components uses older version.
        // Point directly to Vue 2.7's ESM entry so its built-in composition API is used
        // instead of the standalone @vue/composition-api polyfill (which has a separate reactivity system).
        '@vue/composition-api': path.resolve(__dirname, 'node_modules/vue/dist/vue.runtime.esm.js'),
        vue$: path.resolve(__dirname, 'node_modules/vue'),
        // Vue 2.7 includes its own compiler; @vue/test-utils still imports the standalone package.
        'vue-template-compiler': path.resolve(__dirname, 'node_modules/vue/compiler-sfc'),
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      // Fix inline dependency of a dependency, which is the case in Tiptap-Vuetify
      mainFields: ['module']
    },
    server: {
      host: true,
      port: 8080
    },
    test: {
      // simulate DOM with jsdom
      environment: 'jsdom',
      // enable jest-like global test APIs
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      // enable threads to speed up test running
      threads: true,
      // hide Vue Devtools message
      onConsoleLog: function (log) {
        if (log.includes('Download the Vue Devtools extension')) {
          return false
        }
      },
      deps: {
        // need sbc-common-components here otherwise vue error
        inline: ['vuetify', 'sbc-common-components']
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        // Fix Module has been externalized for browser compatibility warning.
        plugins: [
          NodeModulesPolyfillPlugin()
        ]
      },
      // needed so there aren't two instances of sbc-common-components created
      // needed because sbc-common-components has different dependencies
      exclude: ['@vue/composition-api', 'sbc-common-components']
    }
  }
})
