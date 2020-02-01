const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
  mode: 'development',
  entry: {
    'bundle.js': [
      path.resolve(__dirname, './src/index.ts')
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'src', 'index.html'),
        to: path.resolve(__dirname, 'dist')
      },
      {
        from: path.resolve(__dirname, 'assets'),
        to: path.resolve(__dirname, 'dist')
      },
    ]),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]'
  }
};