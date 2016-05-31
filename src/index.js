const base = require('micro-base')();

// Register model(s)
require(base.config.get('models:productModel'))(base);
require(base.config.get('models:categoryModel'))(base);

// Add Product operations
base.services.add(require('./operations/products/createProduct')(base));
base.services.add(require('./operations/products/getProduct')(base));
base.services.add(require('./operations/products/updateProduct')(base));
base.services.add(require('./operations/products/removeProduct')(base));

// Add Category operations
base.services.add(require('./operations/categories/createCategory')(base));
base.services.add(require('./operations/categories/getCategory')(base));
base.services.add(require('./operations/categories/updateCategory')(base));
base.services.add(require('./operations/categories/removeCategory')(base));
base.services.add(require('./operations/categories/getCategoryChildren')(base));

module.exports = base;
