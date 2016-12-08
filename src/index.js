const base = require('microbase')();

// Register model(s)
base.utils.loadModulesFromKey('models');

// Add Operations
base.services.addOperationsFromFolder('operations');

module.exports = base;
