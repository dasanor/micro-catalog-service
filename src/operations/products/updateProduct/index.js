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
  /**
   * ## catalog.updateProduct service
   *
   * Updates a Product
   */
  const op = {
    name: 'updateProduct',
    path: '/product/{sku}',
    method: 'PUT',
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
          // Explicitly name allowed updates
          const update = {};
          if (msg.status) update.status = msg.status;
          if (msg.title) update.title = msg.title;
          if (msg.description) update.description = msg.description;
          if (msg.categories) update.categories = msg.categories;
          if (msg.price) update.price = msg.price;
          if (msg.salePrice) update.salePrice = msg.salePrice;
          if (msg.medias) update.medias = msg.medias;
          return base.db.models.Product
            .findOneAndUpdate({ sku: msg.sku }, { $set: update }, { new: true })
            .exec()
        })
        .then(savedProduct => {
          if (!savedProduct) throw (boom.notFound('Product not found'));
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${savedProduct._id} updated`);
          return reply(savedProduct.toClient());
        })
        .catch(error => {
          if (!(error.isBoom || error.statusCode == 404)) base.logger.error(error);
          reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
