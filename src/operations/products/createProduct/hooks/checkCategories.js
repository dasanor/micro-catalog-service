const boom = require('boom');

function factory(base) {
  const maxCategoriesPerProduct = base.config.get('maxCategoriesPerProduct');
  return (context, next) => {
    // Deduplicate category codes
    if (context.newData.categories) {
      context.newData.categories = [...new Set(context.newData.categories)];
      // Check max allowed categories per product
      if (context.newData.categories.length > maxCategoriesPerProduct) {
        return next(boom.notAcceptable(`No more than ${maxCategoriesPerProduct} categories allowed`));
      }
      // Check category codes
      const promises = context.newData.categories.map(id => {
        return new Promise(function (resolve, reject) {
          base.db.models.Category
            .findById(id)
            .exec()
            .then(category => {
              if (!category) throw boom.notFound('Category not found', { id });
              resolve(category);
            })
            .catch(reject);
        });
      });
      Promise
        .all(promises)
        .then(result => {
          context.categories = result;
          next();
        })
        .catch(next);
    } else {
      next();
    }
  };
}

module.exports = factory;
