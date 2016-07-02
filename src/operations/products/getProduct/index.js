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

  const returnFields = base.db.models.Product.returnFields;
  const defaultFields = returnFields.join(' ');
  const productsChannel = base.config.get('channels:products');

  // Listen to Product changes to clear the cache
  base.events.listen(productsChannel, ({ type, data:product }) => {
    if (type !== 'UPDATE' && type !== 'REMOVE') return;
    console.log(type, product.id);
    const cache = base.cache.get('products');
    cache.drop(product.id);
  });

  /**
   * ## catalog.getProduct service
   *
   * Gets a Product
   */
  const op = {
    name: 'getProduct',
    path: '/product/{id}',
    method: 'GET',
    cache: {
      options: {
        expiresIn: 1000 * 60 * 60 // one hour
      },
      name: 'products',
      keyGenerator: payload => payload.id
    },
    handler: (params, reply) => {
      // Filter fields
      let fields;
      if (params.fields) {
        fields = params.fields.split(',')
          .filter(f => {
            if (f.substr(0, 1) === '-') return returnFields.indexOf(f.substring(1)) !== -1;
            return returnFields.indexOf(f) !== -1;
          })
          .join(' ');
      } else {
        fields = defaultFields;
      }
      // Query db
      base.db.models.Product
        .findOne({ _id: params.id }, fields)
        .populate('variants')
        .exec()
        .then(product => {
          if (!product) throw boom.notFound(`Product '${params.id}' not found`);
          return reply(product.toClient());
        })
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
