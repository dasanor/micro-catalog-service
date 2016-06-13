const boom = require('boom');

function checkCategories(base) {
  const maxCategoriesPerProduct = base.config.get("maxCategoriesPerProduct");
  return (msg) => {
    // Check max allowed categories per product
    if (msg.categories.length > maxCategoriesPerProduct) throw boom.notAcceptable(`No more than ${maxCategoriesPerProduct} categories allowed`);
    // Check category codes
    const promises = [];
    msg.categories.map(id => {
      return promises.push(new Promise(function (resolve, reject) {
        base.db.models.Category
          .findById(id)
          .exec()
          .then(category => {
            if (!category) throw boom.notFound('Category not found', { id: id });
            resolve(category);
          })
          .catch(error => {
            reject(error);
          });
      }));
    });
    return Promise.all(promises);
  };
}

module.exports = checkCategories;




