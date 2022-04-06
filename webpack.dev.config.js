const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PORT = 8200;

module.exports = {
    mode: 'development',
    entry: {
        PI: './src/index.ts',
        test: './test/index.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/',    // 如果不设置，输出包的路径前面就没有/符号,找vendor.js的时候会定位错误。
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.js|\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            // hash: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"',
            'process.env.INTERPRETER_STACK_LOG': '1',
            'process.env.VERSION': '' + new Date().getTime(),
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: PORT,
        // host: "0.0.0.0",
        historyApiFallback: true,
        hot: false,
    },
};
