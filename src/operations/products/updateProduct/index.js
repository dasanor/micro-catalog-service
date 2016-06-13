const boom = require('boom');

/**
 * ## `updateProduct` operation factory
 *
 * Update Product operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const checkCategories = require('../createProduct/checkCategories')(base);
  const checkClassifications = require('../createProduct/checkClassifications')(base);
  const productsChannel = base.config.get('channels:products');
  /**
   * ## catalog.updateProduct service
   *
   * Updates a Product
   */
  const op = {
    name: 'updateProduct',
    path: '/product/{id}',
    method: 'PUT',
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
          // Explicitly name allowed updates
          const update = {};
          if (productData.sku) update.sku = productData.sku;
          if (productData.status) update.status = productData.status;
          if (productData.title) update.title = productData.title;
          if (productData.description) update.description = productData.description;
          if (productData.categories) update.categories = productData.categories;
          if (productData.classifications) update.classifications = productData.classifications;
          if (productData.price) update.price = productData.price;
          if (productData.salePrice) update.salePrice = productData.salePrice;
          if (productData.medias) update.medias = productData.medias;
          return base.db.models.Product
            .findOneAndUpdate({ _id: productData.id }, { $set: update }, { new: true })
            .exec()
        })
        .then(savedProduct => {
          if (!savedProduct) throw (boom.notFound('Product not found'));
          // Send a products UPDATE event
          base.events.send(productsChannel, 'UPDATE', savedProduct.toObject({ virtuals: true }));
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${savedProduct._id} updated`);
          // Return the product to the client
          return reply(savedProduct.toClient());
        })
        .catch(error => {
          if (error.name && error.name === 'ValidationError') {
            return reply(boom.create(406, 'ValidationError', { data: base.util.extractErrors(error) }));
          }
          if (error.name && error.name === 'MongoError' && (error.code === 11000 || error.code === 11001)) {
            return reply(boom.create(403, 'Duplicate key', { data: error.errmsg }));
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
