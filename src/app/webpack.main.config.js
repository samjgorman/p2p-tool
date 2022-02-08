// const path = require("path");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./main.ts", //Electron app was src before
  // Put your normal webpack config below here
  // output: {
  //   path: __dirname + "/dist",
  //   // filename: "my-first-webpack.bundle.js",
  // },
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};
