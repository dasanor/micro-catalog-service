/**
 * ## `category.info` operation factory
 *
 * Get Category operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const op = {
    handler: ({ id, withChildren, recursive }, reply) => {
      const retrieveChildren = (withChildren === 'true');
      const retrieveChildrenRecursive = (recursive === 'true');
      base.db.models.Category
        .findOne({ _id: id })
        .exec()
        .then(category => {
          if (!category) throw base.utils.Error('category_not_found', id);
          if (retrieveChildren) {
            category.getChildrenTree({
              fields: '_id title slug',
              recursive: retrieveChildrenRecursive,
              allowEmptyChildren: true
            }, (error, childrenTree) => {
              if (error) throw error;
              const remap = (item) => {
                item.id = item._id;
                delete item._id;
                delete item.path;
                delete item.parent;
                item.children = item.children.map(remap);
                return item;
              };
              const response = category.toClient();
              response.children = childrenTree.map(remap);
              return reply(base.utils.genericResponse({ category: response }));
            });
          } else {
            return reply(base.utils.genericResponse({ category: category.toClient() }));
          }
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));

    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
