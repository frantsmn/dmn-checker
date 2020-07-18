const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

module.exports = {
	mode: 'production',

	entry: './src/index.js',
	output: {
		filename: 'js/[hash].[name].min.js',
		path: path.resolve(process.cwd(), 'dist'),
	},

	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.s[ac]ss$/i,
				use: [{
					loader: MiniCssExtractPlugin.loader,
					options: {
						hmr: process.env.NODE_ENV === 'development',
						publicPath: '/dist/',
					},
				},
					//Translates CSS into CommonJS
					'css-loader',
					//Compiles SASS to CSS
					'sass-loader'
				]
			}
		]
	},

	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		// compress: true,
		hot: true, //Hot module replacement
		// writeToDisk: true,
		host: 'localhost', // Defaults to `localhost`
		port: 80,
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				secure: false
			}
		}
	},

	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/img', to: 'img' },
				{ from: path.resolve(__dirname, 'src/favicon.ico') },
				{ from: path.resolve(__dirname, 'src/site.webmanifest') },
			],
		}),
		new MiniCssExtractPlugin({
			filename: 'css/[hash].[name].min.css',
		}),
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			minify: {
				collapseWhitespace: false,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true
			}
		}),
		new VueLoaderPlugin(),
	],

	resolve: {
		alias: {
			Views: path.join(__dirname, 'src/views/'),
			Components: path.join(__dirname, 'src/components/'),
			'@': path.join(__dirname, 'src/'),
		}
	}

};