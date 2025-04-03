import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import EnvironmentPlugin from 'vite-plugin-environment'

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
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
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

      // optionally disable threads to work around canvas module warnings
      // but this causes more tests to fail
      // ref: https://github.com/vitest-dev/vitest/issues/740
      // threads: false,

      // hide Vue Devtools message
      onConsoleLog: function (log) {
        if (log.includes('Download the Vue Devtools extension')) {
          return false
        }
      }
    }
  }
})
