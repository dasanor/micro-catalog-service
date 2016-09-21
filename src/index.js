const base = require('microbase')();

// Register model(s)
require(base.config.get('models:productModel'))(base);
require(base.config.get('models:categoryModel'))(base);

// Add Product operations
base.services.addOperation(require('./operations/products/createProduct')(base));
base.services.addOperation(require('./operations/products/getProduct')(base));
base.services.addOperation(require('./operations/products/listProducts')(base));
base.services.addOperation(require('./operations/products/updateProduct')(base));
base.services.addOperation(require('./operations/products/removeProduct')(base));

// Add Category operations
base.services.addOperation(require('./operations/categories/createCategory')(base));
base.services.addOperation(require('./operations/categories/getCategory')(base));
base.services.addOperation(require('./operations/categories/listCategories')(base));
base.services.addOperation(require('./operations/categories/updateCategory')(base));
base.services.addOperation(require('./operations/categories/removeCategory')(base));

module.exports = base;
