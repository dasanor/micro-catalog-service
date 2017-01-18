/**
 * ## `product.info` operation factory
 *
 * Get Product operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  const selectableFields = base.db.models.Product.selectableFields;
  const defaultFields = selectableFields.join(' ');
  const productsChannel = base.config.get('bus:channels:products:name');

  // Listen to Product changes to clear the cache
  base.bus.subscribe(`${productsChannel}.*`, ({ json: { type, data } }) => {
    if (type !== 'UPDATE' && type !== 'REMOVE') return;
    const cache = base.cache.get('products');
    cache.drop(data.old.id);
    if (data.old && data.old.base) cache.drop(data.old.base);
    if (data.new && data.new.base && data.new.base !== data.old.base) cache.drop(data.new.base);
  });

  const op = {
    eventEmitter: {
      channel: `${productsChannel}.VIEWED`,
      filter: (params) => params.customerId,
      payload: (params) => ({
        date: new Date(),
        productId: params.id,
        customerId: params.customerId
      })
    },
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
          if (!product) throw base.utils.Error('product_not_found', { productId: params.id });
          return reply(base.utils.genericResponse({ product: product.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
