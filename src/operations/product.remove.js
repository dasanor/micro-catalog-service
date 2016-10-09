/**
 * ## `product.remove` operation factory
 *
 * Remove Product operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const productsChannel = base.config.get('bus:channels:products:name');
  const op = {
    handler: ({ id }, reply) => {
      // TODO: Don't allow removes if it has variants.
      // TODO: Don't allow removes if it has reserves.
      base.db.models.Product
        .findOneAndRemove({ _id: id })
        .exec()
        .then(removedProduct => {
          if (!removedProduct) throw base.utils.Error('product_not_found', id);
          if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${removedProduct.id} removed`);
          base.bus.publish(`${productsChannel}.REMOVE`,
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
        .then(() => reply(base.utils.genericResponse()))
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
