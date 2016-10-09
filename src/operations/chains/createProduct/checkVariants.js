function factory(base) {
  return (context, next) => {
    // Cannot mix base & variant data
    if ((context.newData.variants || context.newData.modifiers)
      && (context.newData.base || context.newData.variations)) {
      return next(base.utils.Error('inconsistent_base_variants_data'));
    }
    // A Variant must have both base and variations
    if ((context.newData.base && !context.newData.variations)
      || context.newData.variations && !context.newData.base) {
      return next(base.utils.Error('inconsistent_base_variantions_data'));
    }

    if (context.newData.base) {
      // VARIANT
      //
      // base: "ID01"
      // variations: [
      //   {id: "color", value: "Azul"}
      //   {id: "size", value: "38"}
      // ]

      // Find base product
      base.db.models.Product
        .findById(context.newData.base)
        .exec()
        .then(baseProduct => {
          if (!baseProduct) throw base.utils.Error('base_product_not_found', context.newData.base);
          // Check variations against the base Product modifications, while filtering them
          const filteredVariations = [];
          baseProduct.modifiers.forEach(modifier => {
            const variation = context.newData.variations.find(v => v.id === modifier);
            if (!variation || !variation.value) {
              throw base.utils.Error('variation_data_not_found', modifier);
            }
            filteredVariations.push(variation);
          });
          // Only use the filtered variations
          context.newData.variations = filteredVariations;
          next();
        })
        .catch(next);
    } else if (context.newData.modifiers) {
      // BASE PRODUCT
      //
      // modifiers: ["color", "size"],
      // variants: [ID02, ID03, ID04] <-= Generated

      // There should be some modifier
      if (context.newData.modifiers.length === 0) {
        return next(base.utils.Error('no_modifiers_found'));
      }

      // If it's a create (we have an id), don't check variants (There isn't any yet)
      if (!context.newData.id) return next();

      // For each Variant check the variations
      const promises = context.oldProduct.variants.map(variantId => {
        return new Promise((resolve, reject) => {
          // Find the Variant
          base.db.models.Product
            .findById(variantId)
            .then(variant => {
              if (!variant) reject(base.utils.Error('variant_not_found', variantId));
              // Check variations against the base Product modifications
              context.newData.modifiers.forEach(modifier => {
                const variation = variant.variations.find(v => v.id === modifier);
                if (!variation || !variation.value) {
                  reject(base.utils.Error('variation_data_not_found', modifier));
                }
              });
              resolve();
            });
        });
      });
      Promise
        .all(promises)
        .then(() => next())
        .catch(next);
    } else {
      next();
    }
  };
}

module.exports = factory;
