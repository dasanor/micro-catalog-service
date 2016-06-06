const boom = require('boom');

/**
 * ## `getCategoryChildren` operation factory
 *
 * Get Category Children operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  /**
   * ## catalog.getCategoryChildren service
   *
   * Gets a Category childrens
   */
  const op = {
    name: 'getCategoryChildren',
    path: '/category/{id}/children',
    method: 'GET',
    handler: ({id, recursive=false}, reply) => {
      base.db.models.Category
        .findOne({ _id: id })
        .exec()
        .then(category => {
          if (!category) throw boom.notFound('Category not found');
          return category;
        })
        .then(category => {
          var args = {
            fields: "_id title slug",
            recursive: recursive === 'true',
            allowEmptyChildren: true
          };
          category.getChildrenTree(args, (error, childrenTree) => {
            if (error) throw error;

            const remap = (item) => {
              item.id = item._id
              delete item._id;
              delete item.path;
              delete item.parent;
              item.children = item.children.map(remap);
              return item;
            };

            childrenTree = childrenTree.map(remap);

            return reply(childrenTree);
          });
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
