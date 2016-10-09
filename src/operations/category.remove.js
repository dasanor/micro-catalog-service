/**
 * ## `category.remove` operation factory
 *
 * Remove Category operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const op = {
    handler: ({ id }, reply) => {
      // findOneAndRemove not used to allow the tree plugin to do their job
      base.db.models.Category
        .findOne({ _id: id })
        .then(category => {
          if (!category) throw base.utils.Error('category_not_found', id);
          return base.db.models.Product
            .find({ categories: category._id }, { _id: 1 })
            .limit(1)
            .exec()
            .then(productsInThisCategory => {
              if (productsInThisCategory[0]) throw base.utils.Error('category_not_empty');
              return category;
            });
        })
        .then(category => {
          return category.remove();
        })
        .then(removedCategory => {
          if (!removedCategory) throw  base.utils.Error('category_not_found', id);
          if (base.logger.isDebugEnabled()) base.logger.debug(`[category] category ${removedCategory._id} removed`);
          return reply(base.utils.genericResponse());
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
