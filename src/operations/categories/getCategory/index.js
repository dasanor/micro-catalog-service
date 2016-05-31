const boom = require('boom');

/**
 * ## `getCategory` operation factory
 *
 * Get Category operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  /**
   * ## catalog.getCategory service
   *
   * Gets a Category
   */
  const op = {
    name: 'createCategory',
    path: '/category/{id}',
    method: 'GET',
    handler: ({id}, reply) => {
      base.db.models.Category
        .findOne({ _id: id })
        .exec()
        .then(category => {
          if (!category) throw boom.notFound('Category not found');
          return reply(category.toClient());
        })
        .catch(error => {
          if (!(error.isBoom || error.statusCode == 404)) base.logger.error(error);
          reply(Boom.wrap(error));
        });

    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
