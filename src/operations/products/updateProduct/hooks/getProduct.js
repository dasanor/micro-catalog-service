const boom = require('boom');

function factory(base) {
  return (context, next) => {
    base.db.models.Product
      .findById(context.newData.id)
      .exec()
      .then(product => {
        if (!product) throw boom.notAcceptable(`Base product '${context.newData.id}' not found`);
        context.oldProduct = product;
        next();
      })
      .catch(next);
  };
}

module.exports = factory;




