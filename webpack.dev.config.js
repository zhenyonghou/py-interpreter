const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PORT = 8200;

module.exports = {
    mode: 'development',
    // devtool: 'inline-source-map',
    entry: {
        interpreter: './src/interpreter/interpreter.ts',
        test: './test/index.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dest'),
        clean: true,
        publicPath: '/',    // 如果不设置，输出包的路径前面就没有/符号,找vendor.js的时候会定位错误。
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts']
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
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dest'),
        },
        compress: true,
        port: PORT,
        // host: "0.0.0.0",
        historyApiFallback: true,
        hot: false,
    },
};
