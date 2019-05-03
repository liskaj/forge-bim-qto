const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const OUTPUT_FOLDER = path.resolve(__dirname, '../app');

const config = {
    entry: {
        app: './src/client/main.ts'
    },
    externals: {
        axios: 'axios',
        three: 'THREE'
    },
    output: {
        filename: 'app.js',
        path: `${OUTPUT_FOLDER}/scripts`,
        publicPath: '/'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts?$/,
                use: 'source-map-loader',
                exclude: path.resolve(__dirname, 'node_modules')
            },
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'src/client/tsconfig.json',
                    context: path.resolve(__dirname, '../src/client'),
                    transpileOnly: true
                },
                exclude: path.resolve(__dirname, 'node_modules')
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            { from: 'src/client/extension/res/qtoPanel.html', to: `${OUTPUT_FOLDER}/scripts/extension/res` }
        ]),
        new ForkTsCheckerWebpackPlugin({
            tsconfig: path.resolve(__dirname, '../src/client/tsconfig.json')
        })
    ],
    resolve: {
        extensions: [ '.ts', '.js' ],
        plugins: [
            new TsConfigPathsPlugin({
                configFile: 'src/client/tsconfig.json'
            })
        ]
    }
};

module.exports = [ config ];
