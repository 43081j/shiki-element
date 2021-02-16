import {puppeteerLauncher} from '@web/test-runner-puppeteer';

export default {
  nodeResolve: true,
  files: 'lib/test/**/*_test.js',
  testFramework: {
    config: {
      ui: 'bdd'
    }
  },
  coverage: true,
  coverageConfig: {
    include: ['lib/**/*.js'],
    exclude: ['lib/test/**/*.js']
  },
  browsers: [
    puppeteerLauncher()
  ]
};
