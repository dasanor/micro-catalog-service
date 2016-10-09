function factory(base) {
  return (context, next) => {
    base.db.models.Product
      .findById(context.newData.id)
      .exec()
      .then(product => {
        if (!product) throw base.utils.Error('product_not_found', context.newData.id);
        context.oldProduct = product;
        next();
      })
      .catch(next);
  };
}

module.exports = factory;




