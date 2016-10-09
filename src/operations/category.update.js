/**
 * ## `category.update` operation factory
 *
 * Update Category operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const op = {
    // TODO: create the category JsonSchema
    handler: (msg, reply) => {
      // findOneAndUpdate not used to allow the tree plugin to do their job
      base.db.models.Category
        .findOne({ _id: msg.id })
        .then(category => {
          if (!category) throw base.utils.Error('category_not_found', id);
          // Explicitly name allowed updates
          if (msg.title) category.title = msg.title;
          if (msg.description) category.description = msg.description;
          if (msg.slug) category.slug = msg.slug;
          if (msg.classifications) category.classifications = msg.classifications;
          if (msg.parent) {
            return base.db.models.Category
              .findOne({ _id: msg.parent })
              .then(parent => {
                if (!parent) throw base.utils.Error('parent_category_not_found', msg.parent);
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
          return (reply(base.utils.genericResponse({ category: savedCategory.toClient() })));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
