const path = require('path');
const webpack = require('webpack');

module.exports = {
    // devtool: 'inline-source-map',
    entry: {
        PI: './src/interpreter/index.ts',
        test: './test/index.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/',    // 如果不设置，输出包的路径前面就没有/符号,找vendor.js的时候会定位错误。
        // library: {
        //     name: 'PI',
        //     type: 'umd',
        // },
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
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
            'process.env.INTERPRETER_STACK_LOG': '0',
            'process.env.VERSION': '' + new Date().getTime(),
        })
    ]
};
