const boom = require('boom');

/**
 * ## `updateCategory` operation factory
 *
 * Update Category operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  /**
   * ## catalog.updateCategory service
   *
   * Creates a new Category
   */
  const op = {
    name: 'updateCategory',
    path: '/category/{id}',
    method: 'PUT',
    // TODO: create the category JsonSchema
    handler: (msg, reply) => {
      // findOneAndUpdate not used to allow the tree plugin to do their job
      base.db.models.Category
        .findOne({ _id: msg.id })
        .then(category => {
          if (!category) throw (boom.notFound('Category not found'));
          // Explicitly name allowed updates
          if (msg.title) category.title = msg.title;
          if (msg.description) category.description = msg.description;
          if (msg.slug) category.slug = msg.slug;
          if (msg.classifications) category.classifications = msg.classifications;
          if (msg.parent) {
            return base.db.models.Category
              .findOne({ _id: msg.parent })
              .then(parent => {
                if (!parent) throw boom.notFound('Parent Category not found');
                category.parent = parent;
                return category;
              });
          }
          return category;
        })
        .then(category => {
          return category.save();
        })
        .then(savedCategory => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[category] category ${savedCategory._id} updated`);
          return reply(savedCategory.toClient());
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
