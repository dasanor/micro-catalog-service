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
  const checkCategories = require('./checkCategories')(base);
  const checkClassifications = require('./checkClassifications')(base);
  const productsChannel = base.config.get('channels:products');
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
        .then(() => {
          // Explicitly name allowed properties
          const product = new base.db.models.Product({
            sku: productData.sku,
            status: productData.status || 'DRAFT',
            title: productData.title,
            description: productData.description,
            brand: productData.brand,
            categories: productData.categories || [],
            classifications: productData.classifications || [],
            price: productData.price,
            salePrice: productData.salePrice || productData.price,
            medias: productData.medias
          });
          // Save
          return product.save();
        })
        .then(savedProduct => {
          // Send a products CREATE event
          base.events.send(productsChannel, 'CREATE', savedProduct.toObject({ virtuals: true }));
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${savedProduct._id} created`);
          // Return the product to the client
          return reply(savedProduct.toClient()).code(201);
        })
        .catch(error => {
          if (error.name && error.name === 'ValidationError') {
            return reply(boom.create(406, 'ValidationError', { data: base.util.extractErrors(error) }));
          }
          if (error.name && error.name === 'MongoError' && (error.code === 11000 || error.code === 11001)) {
            return reply(boom.forbidden('duplicate key'), { data: error.errmsg });
          }
          if (!(error.isBoom || error.statusCode === 404)) base.logger.error(error);
          return reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
