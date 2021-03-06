function factory(base) {
  const normalStockStatus = base.db.models.Product.STOCKSTATUS.NORMAL;
  return (context, next) => {
    // Explicitly name allowed properties
    const product = new base.db.models.Product({
      sku: context.newData.sku,
      title: context.newData.title,
      description: context.newData.description,
      status: context.newData.status || base.db.models.Product.STATUS.DRAFT,
      brand: context.newData.brand,
      taxCode: context.newData.taxCode,
      stockStatus: context.newData.stockStatus || normalStockStatus,
      categories: context.newData.categories || [],
      prices: context.newData.prices || [],
      isNetPrice: context.newData.isNetPrice,
      medias: context.newData.medias,
      classifications: context.newData.classifications || []
    });
    if (context.newData.base) {
      product.base = context.newData.base;
      product.variations = context.newData.variations;
      product.type = base.db.models.Product.TYPE.VARIANT;
    } else if (context.newData.modifiers && context.newData.modifiers.length > 0) {
      product.modifiers = context.newData.modifiers;
      product.type = base.db.models.Product.TYPE.BASE;
    } else {
      product.type = base.db.models.Product.TYPE.SIMPLE;
    }
    // Save
    product
      .save()
      .then(savedProduct => {
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
            .exec();
        }
      })
      .then(() => next())
      .catch(next);
  };
}

module.exports = factory;




