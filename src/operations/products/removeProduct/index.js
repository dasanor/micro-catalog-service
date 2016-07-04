const boom = require('boom');

/**
 * ## `removeProduct` operation factory
 *
 * Remove Product operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const productsChannel = base.config.get('channels:products');
  /**
   * ## catalog.removeProduct service
   *
   * Removes a Product
   */
  const op = {
    name: 'removeProduct',
    path: '/product/{id}',
    method: 'DELETE',
    handler: ({ id }, reply) => {
      base.db.models.Product
        .findOneAndRemove({ _id: id })
        .exec()
        .then(removedProduct => {
          if (!removedProduct) throw (boom.notFound('Product not found'));
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${removedProduct.id} removed`);
          base.events.send(productsChannel, 'REMOVE',
            {
              old: removedProduct.toObject({ virtuals: true })
            }
          );
          return removedProduct;
        })
        .then(removedProduct => {
          if (removedProduct.base) {
            return base.db.models.Product
              .findOneAndUpdate({
                _id: removedProduct.base
              }, {
                $pull: { variants: removedProduct.id }
              })
              .exec()
              .then(() => removedProduct);
          }
          return removedProduct;
        })
        .then(() => reply().code(204))
        .catch(error => {
          if (!(error.isBoom || error.statusCode === 404)) base.logger.error(error);
          reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
