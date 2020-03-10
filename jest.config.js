module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true
    }
  },
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transformIgnorePatterns: []
}
