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

  const selectableFields = base.db.models.Product.selectableFields;
  const defaultFields = selectableFields.join(' ');
  const productsChannel = base.config.get('bus:channels:products:name');

  // Listen to Product changes to clear the cache
  base.bus.subscribe(`${productsChannel}.*`, ({ type, data }) => {
    if (type !== 'UPDATE' && type !== 'REMOVE') return;
    const cache = base.cache.get('products');
    cache.drop(data.old.id);
    if (data.old.base) cache.drop(data.old.base);
    if (data.new.base && data.new.base !== data.old.base) cache.drop(data.new.base);
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
        expiresIn: base.config.get('cache:products')
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
            if (f.substr(0, 1) === '-') return selectableFields.indexOf(f.substring(1)) !== -1;
            return selectableFields.indexOf(f) !== -1;
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
