  // Плагин Cross-env поможет правильно определять NODE_ENV кроссбраузерно // 
  
  
  const path = require('path');  // Модуль который позволяет корректно работать с путями к файлам
  const HTMLWebpackPlugin = require('html-webpack-plugin');
  const {CleanWebpackPlugin} = require('clean-webpack-plugin'); // Плагин очистки папки dist
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const CopyWebpackPlugin = require('copy-webpack-plugin');
  const  SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

  const isDev = process.env.NODE_ENV === 'development';  // В procces.env.NODE_ENV хранится два значения dev или production
  const isProd = !isDev;
  
    // Название проекта, [name] - спец переменная (Название файла) || с contenthash не нужно будет сбрасывать кеш на сайте  
  const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
  

  
  module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',    // В какой персии проекта находимся есть еще (Production)
    entry: './js/main.js',  // Файл с которого начинается сборка
    output: {
      filename: `./js/${filename('js')}`, // Вызываем функцию (стр-6) передаём в неё extension(js) 
      path: path.resolve(__dirname, 'dist'), // Папка в которую будет выгружаться проект
      assetModuleFilename: 'images/[hash][ext][query]'
    },

    devServer: {
      static: './dist',
      port: 3000,
      open: true,
      hot: true
    },

    plugins: [
      new HTMLWebpackPlugin({  // Плагин подключение html
        template: path.resolve(__dirname, 'src/index.html'),
        filename: 'index.html',
        minify: {
          collapseWhitespace: isProd // Если в production будет сжимать html
        }
      }),

      new MiniCssExtractPlugin({
        filename: `./css/${filename('css')}`
      }),

      new SVGSpritemapPlugin('src/assets/images/svg/*.svg', {
        output: {
            filename: '../src/assets/images/spritemap.svg',
            svg: {
                sizes: true
            },
            chunk: {
                keep: true // Включаем чтобы при сборке проекта небыло ошибки из-за отсутствия spritemap.js 
            }
        }
      }),

      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/assets/images'),
            to: path.resolve(__dirname, 'dist/assets/images'),
            globOptions: {
              ignore: ['**/svg/**'] // Игнорируем каталог с иконками
            }
          },
          {
            from: path.resolve(__dirname, 'src/assets/fonts'),
            to: path.resolve(__dirname, 'dist/assets/fonts'),
          }
        ]
      })
      
    ],

    module: {    // Работы с лодерами
      rules: [

        {
          test: /\.html$/i, // Файлы которые будут обрабатываться
          loader: 'html-loader'
        },

        {
          test: /\.css$/i, 
          use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev // Страничка изменяеться без обновления вкладки
            }
          },'css-loader']
        },

        {
          test: /\.s[ac]ss$/i,
          use: [  // Чтобы в css можно было использовать картинки
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: (resourcePath, context) => {  // Чтобы в scss можно было правильно подключать картинки
                  return path.relative(path.dirname(resourcePath), context) + '/';
                },
              }
            }, 'css-loader', 'sass-loader']
        },

        {
          test: /\.m(?:|png|jpg|gif|jpeg|svg)$i/,
          use: ['file-loader']
        }
      ]
    }
  }