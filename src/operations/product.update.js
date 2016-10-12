/**
 * ## `product.update` operation factory
 *
 * Update Product operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const updateProductChain = new base.utils.Chain().use('updateProductChain');
  const op = {
    // TODO: create the product JsonSchema
    handler: (newData, reply) => {
      const context = {
        newData,
      };
      updateProductChain
        .exec(context)
        .then(() => reply(base.utils.genericResponse({ product: context.savedProduct.toClient() })))
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
