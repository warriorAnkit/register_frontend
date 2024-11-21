// eslint-disable-next-line import/no-extraneous-dependencies
const CracoLessPlugin = require('craco-less');
const { theme } = require('antd/lib');

const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: mapToken,
            javascriptEnabled: true,
          },
        },
      },
    },
  ],

  webpack: {
    configure: (webpackConfig) => {
      // eslint-disable-next-line no-param-reassign
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer/'), // Add the buffer polyfill here
      };
      return webpackConfig;
    },
  },
};
