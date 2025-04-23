const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', // necessary for React Router + history fallback
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    static: './dist',
    open: true,
    historyApiFallback: true,
    proxy: [
      {
        context: [
          '/login',
          '/logout',
          '/register',
          '/protected',
          '/refresh',
          '/set_alert',
          '/get_price',
          '/user_alerts',
          '/delete_user_alerts',
          '/alert_history',
          '/delete_history_alerts',
          '/update_alert'
        ],
        target: 'http://backend:5000', // for docker change to 'http://backend:5000' for local change to 'http://127.0.0.1:5000'
        changeOrigin: true,
      },
    ],
  }
};
