const boom = require('boom');
const slug = require('slugg');

/**
 * ## `createCategory` operation factory
 *
 * Create Category operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  // Create the `ROOT` Category if it doesn't exists
  base.db.models.Category
    .findOne({ _id: 'ROOT' })
    .then((category) => {
      if (!category) {
        const rootCat = new base.db.models.Category({
          _id: 'ROOT',
          title: 'Root Category',
          description: 'Root Category',
          path: 'ROOT',
          slug: 'root'
        });
        rootCat
          .save()
          .then((savedCategory) => {
            base.logger.info('[category] Root category inserted');
          })
          .catch(error => {
            base.logger.error(`[category] Root category not inserted, ${error}`);
          });
      }
    });


  /**
   * ## catalog.createCategory service
   *
   * Creates a new Category
   */
  const op = {
    name: 'createCategory',
    path: '/category',
    method: 'POST',
    // TODO: create the category JsonSchema
    handler: (msg, reply) => {
      const category = new base.db.models.Category({
        title: msg.title,
        description: msg.description,
        slug: msg.slug || slug(msg.title),
        classifications: msg.classifications
      });
      let parentSearch = {};
      if (msg.parent) {
        parentSearch = { _id: msg.parent };
      } else {
        parentSearch = { _id: 'ROOT' };
      }
      base.db.models.Category
        .findOne(parentSearch)
        .then(parent => {
          if (!parent) throw boom.notFound('Parent Category not found');
          category.parent = parent;
          return category.save();
        })
        .then(savedCategory => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[category] category ${savedCategory._id} created`);
          return reply(savedCategory.toClient()).code(201);
        })
        .catch(error => reply(base.utils.genericErrorResponse(error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
