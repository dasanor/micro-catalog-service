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
  const checkCategories = base.utils.loadModule('hooks:checkCategories:handler');
  const checkClassifications = base.utils.loadModule('hooks:checkClassifications:handler');
  const checkVariants = base.utils.loadModule('hooks:checkVariants:handler');
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
          if (productData.categories) {
            // Deduplicate category codes
            productData.categories = [...new Set(productData.categories)];
            // Check categories existence
            return checkCategories(productData)
              .then(categories => checkClassifications(productData, categories))
          }
          return productData;
        })
        .then(checkVariants)
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
          if (productData.isNetPrice) update.isNetPrice = productData.isNetPrice;
          if (productData.medias) update.medias = productData.medias;
          if (productData.base) update.base = productData.base;
          if (productData.variations) update.variations = productData.variations;
          if (productData.modifiers) update.modifiers = productData.modifiers;
          if (productData.variants) update.variants = productData.variants;
          if (productData.taxCode) update.taxCode = productData.taxCode;
          return base.db.models.Product
            .findOneAndUpdate({ _id: productData.id }, { $set: update }, { new: true })
            .exec();
        })
        .then(savedProduct => {
          if (!savedProduct) throw (boom.notFound('Product not found'));
          // Send a products UPDATE event
          base.events.send(productsChannel, 'UPDATE', savedProduct.toObject({ virtuals: true }));
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${savedProduct._id} updated`);
          // Return the product to the client
          return reply(savedProduct.toClient());
        })
        .catch(error => reply(base.utils.genericErrorResponse(error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
