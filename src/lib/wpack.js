const path = require('path');
const R = require('ramda');
const webpack = require('webpack'); // eslint-disable-line import/no-unresolved
const service = require('./service');

/**
 * Sets webpack entry
 * @param {object} fn Serverless function object
 * @param {string} servicePath Serverless service path
 * @returns {object} Webpack configuration
 */
const setEntry = (fn, servicePath, config) =>
  R.assoc(
    'entry',
    R.objOf(
      functions.fnFilename(config)(fn).replace(new RegExp(config && config.entry ? config.entry : 'js'), 'js'),
      path.join(config && config.context ? config.context : servicePath, functions.fnPath(config)(fn))
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
 * @returns {array} Array of webpack configurations
 */
const createConfigs = (fns, config, servicePath, defaultOutput, folder) =>
  R.map(
    fn =>
    R.pipe(
      setEntry(fn, servicePath, config),
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
