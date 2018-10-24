const {resolve} = require('path');
const nodeExternals = require('webpack-node-externals');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

const OUTPUT_FOLDER = resolve(__dirname, '../dist');

const createConfig = ({
  entry,
  target,
  externals,
  outputFile,
  plugins,
  alias,
}) => ({
  target,
  entry,
  externals,
  plugins,
  output: {
    path: OUTPUT_FOLDER,
    filename: outputFile,
    publicPath: '/',
  },
  resolve: {
    alias,
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      resolve(__dirname, '../node_modules'),
      resolve(__dirname, '../src'),
    ],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          emitError: false,
        },
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // polyfill for new browser
              '@babel/preset-react', // react jsx compiler
            ],
            plugins: [
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-logical-assignment-operators',
              '@babel/plugin-proposal-do-expressions',
              '@babel/plugin-proposal-function-bind',
              [
                '@babel/plugin-proposal-pipeline-operator',
                {
                  proposal: 'minimal',
                },
              ],
              [
                '@babel/plugin-proposal-decorators',
                {
                  legacy: true,
                },
              ],
              [
                '@babel/plugin-proposal-class-properties',
                {
                  loose: true,
                },
              ],
              [
                '@babel/transform-runtime',
                {
                  regenerator: true,
                },
              ],
            ],
          },
        },
      },
    ],
  },
});

const GLOBAL_ALIASES = {
  '@client': resolve(__dirname, '../src/client/'),
};

module.exports = [
  // client stuff
  createConfig({
    alias: GLOBAL_ALIASES,
    target: 'web',
    entry: resolve(__dirname, '../src/client/index.jsx'),
    outputFile: 'public/client-[hash].js',
    plugins: [
      new CleanWebpackPlugin(
        ['dist/'],
        {
          root: resolve(__dirname, '../'),
        },
      ),
    ],
  }),

  // server stuff
  createConfig({
    alias: GLOBAL_ALIASES,
    target: 'node',
    entry: resolve(__dirname, '../src/server/index.jsx'),
    outputFile: 'server.js',
    externals: [
      nodeExternals({
        whitelist: [
          /^@client.*/,
        ],
      }),
    ],
    plugins: [
      new NodemonPlugin,
    ],
  }),
];