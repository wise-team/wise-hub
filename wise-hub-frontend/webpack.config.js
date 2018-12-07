'use strict';

var path = require('path');
var webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const webpackConfig = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'wise-hub.js'
  },
  mode: (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'css': 'vue-style-loader!css-loader!sass-loader',
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
          },
          esModule: true
          // other vue-loader options go here
        }
      },
      {
        test: /\.(tsx|ts|js)$/,
        loader: 'ts-loader',
        include: /src/,
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      },
      {test: /\.scss?$/, loaders: ['vue-style-loader', 'css-loader', 'sass-loader']},
      {test: /\.css?$/, loaders: ['vue-style-loader', 'css-loader', 'sass-loader']},
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  node: {
    fs: "empty" // fix can't resolve "fs" in winston
  },
  plugins: [
    new VueLoaderPlugin(),
    new Visualizer({
      filename: './statistics.html'
    }),
    new webpack.DefinePlugin({
      'process.env': (process.env.NODE_ENV === 'production') ? {
        NODE_ENV: '"production"'
      } : {
        NODE_ENV: '"development"'
      },
      "__VERSION__": JSON.stringify(require("./package.json").version)
    }),
    new HtmlWebpackPlugin({
      filename: '../index.html',
      template: './src/index.template.html',
      hash: true,
      title: 'WISE for steem: hub'
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  webpackConfig.plugins = (webpackConfig.plugins || []).concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])

  webpackConfig.optimization = {
    minimizer: [
      // we specify a custom UglifyJsPlugin here to get source maps in production
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: true
        },
        sourceMap: true
      })
    ]
  };
}

module.exports = smp.wrap(webpackConfig);