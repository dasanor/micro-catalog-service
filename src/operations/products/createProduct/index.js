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
    handler: (msg, reply) => {
      let promise = Promise.resolve();
      if (msg.categories) {
        // Deduplicate category codes
        msg.categories = [...new Set(msg.categories)];
        // Check categories existence
        promise = checkCategories(msg);
      }
      // Save
      promise
        .then(() => {
          // Explicitly name allowed properties
          const product = new base.db.models.Product({
            sku: msg.sku,
            status: msg.status || 'DRAFT',
            title: msg.title,
            description: msg.description,
            categories: msg.categories || [],
            price: msg.price,
            salePrice: msg.salePrice || msg.price,
            medias: msg.medias
          });
          return product.save();
        })
        .then(savedProduct => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${savedProduct._id} created`);
          return reply(savedProduct.toClient()).code(201);
        })
        .catch(error => {
          if (11000 === error.code || 11001 === error.code) {
            return reply(boom.forbidden('duplicate key'));
          }
          if (!(error.isBoom || error.statusCode == 404)) base.logger.error(error);
          return reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
