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
  /**
   * ## catalog.removeProduct service
   *
   * Removes a Product
   */
  const op = {
    name: 'removeProduct',
    path: '/product/{sku}',
    method: 'DELETE',
    handler: ({sku}, reply) => {
      base.db.models.Product
        .findOneAndRemove({ sku: sku })
        .exec()
        .then(removedProduct => {
          if (!removedProduct) throw (boom.notFound('Product not found'));
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${removedProduct.sku} removed`);
          return reply().code(204);
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