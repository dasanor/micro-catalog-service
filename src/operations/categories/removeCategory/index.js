const boom = require('boom');

/**
 * ## `removeCategory` operation factory
 *
 * Remove Category operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  /**
   * ## catalog.removeCategory service
   *
   * Removes a Category
   */
  const op = {
    name: 'removeCategory',
    path: '/category/{id}',
    method: 'DELETE',
    handler: ({id}, reply) => {
      // findOneAndRemove not used to allow the tree plugin to do their job
      base.db.models.Category
        .findOne({ _id: id })
        .then(category => {
          if (!category) throw (boom.notFound('Category not found'));
          return base.db.models.Product
            .find({ categories: category._id }, { _id: 1 })
            .limit(1)
            .exec()
            .then(productsInThisCategory => {
              if (productsInThisCategory[0]) throw boom.notAcceptable(`Category not empty`);
              return category;
            });
        })
        .then(category => {
          return category.remove();
        })
        .then(removedCategory => {
          if (!removedCategory) throw (boom.notFound('Category not found'));
          if (base.logger.isDebugEnabled()) base.logger.debug(`[category] category ${removedCategory._id} removed`);
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
