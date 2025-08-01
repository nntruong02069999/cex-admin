const path = require('path');
const fs = require('fs');
const {
  override,
  addLessLoader,
  addBabelPlugins,
  addWebpackAlias,
} = require('customize-cra');
const lessToJS = require('less-vars-to-js');

const dev = process.env.NODE_ENV === 'development' ? true : false;
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, './src/theme.less'), 'utf8')
);

const overrideProcessEnv = (value) => (config) => {
  /* config.resolve.modules = [
    path.join(__dirname, 'src')
  ].concat(config.resolve.modules); */
  return config;
};

module.exports = override(
  addWebpackAlias({
    '@src': path.resolve(__dirname, 'src'),
  }),
  ...addBabelPlugins(
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/proposal-object-rest-spread'
  ),
  addLessLoader({
    sourceMap: dev,
    lessOptions: {
      modifyVars: {
        ...themeVariables,
      },
      javascriptEnabled: true,
    },
  }),
  overrideProcessEnv({
    VERSION: JSON.stringify(require('./package.json').version),
  })
);
