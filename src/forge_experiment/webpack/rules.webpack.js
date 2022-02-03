module.exports = [
  // Commenting out because this native module loader was breaking
  // installation of native node modules like wrtc
  // Reference:  https://stackoverflow.com/questions/65164434/electron-forge-v6-keytar-node-loader-error-no-suitable-image-found-file-t
  // {
  //   test: /\.node$/,
  //   use: 'node-loader',
  // },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@marshallofsound/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.(js|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
    },
  },
  {
    test: /\.(png|jpe?g|gif)$/i,
    loader: 'file-loader',
    options: {
      name: '[path][name].[ext]',
    },
  },
]
