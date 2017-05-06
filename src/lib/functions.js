const path = require('path');
const R = require('ramda');
const list = require('./list');

const handlerProp = R.prop('handler');

const handlerExport = R.compose(R.last, R.split('.'));

const handlerPath = config => handler => R.replace(handlerExport(handler), config && config.entry ? config.entry : 'js', handler);
const handlerFile = (config) => R.compose(path.basename, handlerPath(config));
const fnPath = (config) => R.compose(handlerPath(config), handlerProp);
const fnFilename = (config) => R.compose(handlerFile(config), handlerProp);

const setPackage = fn =>
  R.assoc(
    'package',
    R.objOf(
      'include',
      R.compose(list, fnFilename(null))(fn)
    ),
    fn
  );

const setHandler = R.over(R.lensProp('handler'), path.basename);

const setPackageAndHandler = R.map(R.compose(setHandler, setPackage));

const setArtifacts = (serverlessPath, fns) => R.map(
  R.over(
    R.lensProp('artifact'),
    artifact => path.join(serverlessPath, path.basename(artifact))
  ),
  fns
);

module.exports = {
  fnPath,
  fnFilename,
  setPackageAndHandler,
  setArtifacts,
};
