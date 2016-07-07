const boom = require('boom');

/**
 * ## `createProduct` operation factory
 *
 * Create Product operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const checkCategories = base.utils.loadModule('hooks:checkCategories:handler');
  const checkClassifications = base.utils.loadModule('hooks:checkClassifications:handler');
  const checkVariants = base.utils.loadModule('hooks:checkVariants:handler');
  const productsChannel = base.config.get('bus:channels:products:name');
  const normalStockStatus = base.db.models.Product.STOCKSTATUS.NORMAL;
  /**
   * ## catalog.createProduct service
   *
   * Creates a new Product
   */
  const op = {
    name: 'createProduct',
    path: '/product',
    method: 'POST',
    // TODO: create the product JsonSchema
    handler: (productData, reply) => {
      Promise.resolve(productData)
        .then(productData => {
          // Deduplicate category codes
          productData.categories = [...new Set(productData.categories)];
          // Check categories existence
          return checkCategories(productData);
        })
        .then(categories => checkClassifications(productData, categories))
        .then(checkVariants)
        .then(() => {
          // Explicitly name allowed properties
          const product = new base.db.models.Product({
            sku: productData.sku,
            title: productData.title,
            description: productData.description,
            status: productData.status || 'DRAFT',
            brand: productData.brand,
            taxCode: productData.taxCode,
            stockStatus: productData.stockStatus || normalStockStatus,
            categories: productData.categories || [],
            price: productData.price,
            salePrice: productData.salePrice || productData.price,
            isNetPrice: productData.isNetPrice,
            medias: productData.medias,
            classifications: productData.classifications || []
          });
          if (productData.base) {
            product.base = productData.base;
            product.variations = productData.variations;
          } else if (productData.modifiers) {
            product.modifiers = productData.modifiers;
          }
          // Save
          return product.save();
        })
        .then(savedProduct => {
          // Send a products CREATE event
          base.bus.publish(`${productsChannel}.CREATE`,
            {
              new: savedProduct.toObject({ virtuals: true }),
              data: productData
            }
          );
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${savedProduct._id} created`);
          return savedProduct;
        })
        .then(savedProduct => {
          if (savedProduct.base) {
            return base.db.models.Product
              .findOneAndUpdate({
                _id: savedProduct.base
              }, {
                $addToSet: { variants: savedProduct.id }
              })
              .exec()
              .then(() => savedProduct);
          }
          return savedProduct;
        })
        .then(savedProduct => reply(savedProduct.toClient()).code(201))
        .catch(error => reply(base.utils.genericErrorResponse(error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
