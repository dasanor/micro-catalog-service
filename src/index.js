const base = require('microbase')();

// Register model(s)
require(base.config.get('models:productModel'))(base);
require(base.config.get('models:categoryModel'))(base);

// Add Operations
base.services.addOperationsFromFolder('operations');

module.exports = base;
