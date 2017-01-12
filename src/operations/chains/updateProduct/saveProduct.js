function factory(base) {
  const updatableFields = base.db.models.Product.updatableFields;
  return (context, next) => {
    // Allow updates only on explicitly named properties
    const update = updatableFields
      .filter(f => context.newData[f] !== undefined)
      .reduce((result, f) => {
        result[f] = context.newData[f];
        return result;
      }, {});
    // Update type
    if (update.base || context.oldProduct.base) {
      update.type = base.db.models.Product.TYPE.VARIANT;
    } else if ((update.modifiers && update.modifiers.length > 0) || context.oldProduct.length > 0) {
      update.type = base.db.models.Product.TYPE.BASE;
    } else {
      update.type = base.db.models.Product.TYPE.SIMPLE;
    }
    // Update
    return base.db.models.Product
      .findOneAndUpdate({ _id: context.newData.id }, { $set: update }, { new: true })
      .exec()
      .then(savedProduct => {
        if (!savedProduct) throw base.utils.Error('product_not_saved');
        context.savedProduct = savedProduct;
      })
      .then(() => {
        if (context.savedProduct.base) {
          // Add the product to the base variants
          return base.db.models.Product
            .findOneAndUpdate({
              _id: context.savedProduct.base
            }, {
              $addToSet: { variants: context.savedProduct.id }
            })
            .exec()
            .then(() => {
              // Remove the product from other base variants
              return base.db.models.Product
                .findOneAndUpdate({
                  variants: { $all: [context.savedProduct.id] },
                  _id: { $ne: context.savedProduct.base }
                }, {
                  $pull: { variants: context.savedProduct.id }
                })
                .exec();
            });
        }
      })
      .then(() => next())
      .catch(next);
  };
}

module.exports = factory;




