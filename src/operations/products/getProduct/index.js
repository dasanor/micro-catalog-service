const boom = require('boom');

/**
 * ## `getProduct` operation factory
 *
 * Get Product operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  /**
   * ## catalog.getProduct service
   *
   * Gets a Product
   */
  const op = {
    name: 'getProduct',
    path: '/product/{sku}',
    method: 'GET',
    handler: ({sku}, reply) => {
      base.db.models.Product
        .findOne({ sku })
        .exec()
        .then(product => {
          if (!product) throw boom.notFound('Product not found');
          return reply(product.toClient());
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
