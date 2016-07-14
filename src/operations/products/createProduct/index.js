/**
 * ## `createProduct` operation factory
 *
 * Create Product operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const createProductChain = new base.utils.Chain().use('createProductChain');
  /**
   * ## catalog.createProduct service
   *
   * Creates a new Product
   */
  const op = {
    name: 'createProduct',
    path: '/product',
    method: 'POST',
    // TODO: create the product JsonSchema
    handler: (newData, reply) => {
      const context = {
        newData,
      };
      createProductChain
        .exec(context)
        .then(() => reply(context.savedProduct.toClient()).code(201))
        .catch(error => reply(base.utils.genericErrorResponse(error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
