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
  const updatableFields = base.db.models.Product.updatableFields;
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
    handler: (newData, reply) => {
      const data = { newData };
      Promise.resolve(data)
        .then(data => {
          return base.db.models.Product
            .findById(data.newData.id)
            .exec()
            .then(product => {
              if (!product) throw boom.notAcceptable(`Base product '${data.newData.id}' not found`);
              data.oldProduct = product;
              return data;
            });
        })
        .then(data => {
          if (data.newData.categories) {
            // Deduplicate category codes
            data.newData.categories = [...new Set(data.newData.categories)];
            // Check categories / classifications
            return checkCategories(data.newData)
              .then(categories => checkClassifications(data.newData, categories))
              .then(() => data);
          }
          return data;
        })
        .then(checkVariants)
        .then(() => data)
        .then(data => {
          // Allow updates only on explicitly names properties
          const update = updatableFields
            .filter(f => data.newData[f] !== undefined)
            .reduce((result, f) => {
              result[f] = data.newData[f];
              return result;
            }, {});
          return base.db.models.Product
            .findOneAndUpdate({ _id: data.newData.id }, { $set: update }, { new: true })
            .exec()
            .then(savedProduct => {
              data.savedProduct = savedProduct;
              return data;
            });
        })
        .then(data => {
          if (!data.savedProduct) throw (boom.notFound('Product not saved'));
          // Send a products UPDATE event
          base.events.send(productsChannel, 'UPDATE', {
            new: data.savedProduct.toObject({ virtuals: true }),
            old: data.oldProduct,
            data: data.newData
          });
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${data.savedProduct._id} updated`);
          // Return the product to the client
          return data;
        })
        .then(data => {
          if (data.savedProduct.base) {
            return base.db.models.Product
              .findOneAndUpdate({
                _id: data.savedProduct.base
              }, {
                $addToSet: { variants: data.savedProduct.id }
              })
              .exec()
              .then(() => {
                return base.db.models.Product
                  .findOneAndUpdate({
                    variants: { $all: [data.savedProduct.id] },
                    _id: { $ne: data.savedProduct.base }
                  }, {
                    $pull: { variants: data.savedProduct.id }
                  })
                  .exec()
                  .then(() => data);
              });
          }
          return data;
        })
        .then(data => reply(data.savedProduct.toClient()))
        .catch(error => reply(base.utils.genericErrorResponse(error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
