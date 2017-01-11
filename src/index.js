const raven = require('raven');
const base = require('microbase')({ extra: { raven } });

// Register model(s)
base.utils.loadModulesFromKey('models');

// Add Operations
base.services.addOperationsFromFolder('operations');

module.exports = base;
