/**
 * ## `updateProduct` operation factory
 *
 * Update Product operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const updateProductChain = new base.utils.Chain().use('updateProductChain');
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
      const context = {
        newData,
      };
      updateProductChain
        .exec(context)
        .then(() => reply(context.savedProduct.toClient()))
        .catch(error => reply(base.utils.genericErrorResponse(error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
