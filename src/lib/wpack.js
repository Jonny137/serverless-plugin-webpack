const path = require('path');
const R = require('ramda');
const webpack = require('webpack'); // eslint-disable-line import/no-unresolved
const service = require('./service');

/**
 * Sets webpack entry
 * @param {object} fn Serverless function object
 * @param {string} servicePath Serverless service path
 * @param {string} handlerFileExtension File extension for source
 * @param {string} sourceDir default source dir
 * @returns {object} Webpack configuration
 */
const setEntry = (fn, servicePath, handlerFileExtension, sourceDir) =>
  R.assoc(
    'entry',
    R.objOf(
      service.fnPath(fn),
      path.join(servicePath, sourceDir, service.fnPath(fn).replace(new RegExp('.js$'), handlerFileExtension))
    )
  );

/**
 * Sets webpack output in configuration
 * @param {object} defaultOutput Webpack default output object
 * @param {string} outputPath Webpack output path
 * @returns {object} Webpack configuration
 */
const setOutput = (defaultOutput, outputPath) =>
  R.assoc(
    'output',
    R.merge(
      defaultOutput, {
        path: outputPath
      }
    )
  );

/**
 * Creates an array of webpack configurations
 * @param {object} fns Serverless functions object
 * @param {object} config Webpack config
 * @param {string} servicePath Serverless service path
 * @param {object} defaultOutput Webpack default output object
 * @param {string} folder Webpack output folder
 * @param {string} handlerFileExtension File extension for source
 * @param {string} sourceDir default source dir
 * @returns {array} Array of webpack configurations
 */
const createConfigs = (fns, config, servicePath, defaultOutput, folder, handlerFileExtension, sourceDir) =>
  R.map(
    fn =>
    R.pipe(
      setEntry(fn, servicePath, handlerFileExtension, sourceDir),
      setOutput(defaultOutput, path.join(servicePath, folder))
    )(config),
    R.values(fns)
  );

/**
 * Runs webpack with an array of configurations
 * @param {array} configs Array of webpack configurations
 * @returns {Promise} Webpack stats
 */
const run = configs =>
  new Promise((resolve, reject) => {
    webpack(configs, (err, stats) => {
      if (err) reject(`Webpack compilation error: ${err}`);

      console.log(stats.toString({ // eslint-disable-line no-console
        colors: true,
        hash: false,
        chunks: false,
        version: false,
      }));

      if (stats.hasErrors()) reject('Webpack compilation error, see stats above');

      resolve(stats);
    });
  });

module.exports = {
  createConfigs,
  run,
};