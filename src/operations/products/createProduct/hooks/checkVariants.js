const boom = require('boom');

function factory(base) {
  return (context, next) => {

    // Cannot mix base & variant data
    if ((context.newData.variants || context.newData.modifiers)
      && (context.newData.base || context.newData.variations)) {
      return next(boom.notAcceptable('Inconsistent base/variants data'));
    }

    if ((context.newData.base && !context.newData.variations)
      || context.newData.variations && !context.newData.base) {
      return next(boom.notAcceptable('Inconsistent base/variations data'));
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
          if (!baseProduct) throw boom.notAcceptable(`Base product '${context.newData.base}' not found`);
          // Check variations against the base Product modifications, while filtering them
          const filteredVariations = [];
          baseProduct.modifiers.forEach(modifier => {
            const variation = context.newData.variations.find(v => v.id === modifier);
            if (!variation || !variation.value) {
              throw boom.notAcceptable(`Variation '${modifier}' not found`);
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
        return next(boom.notAcceptable('No modifiers found'));
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
              if (!variant) reject(`Variant '${variantId}' not found`);
              // Check variations against the base Product modifications
              context.newData.modifiers.forEach(modifier => {
                const variation = variant.variations.find(v => v.id === modifier);
                if (!variation || !variation.value) {
                  reject(boom.notAcceptable(`Variation '${modifier}' not found in variant ${variantId}`));
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
