const boom = require('boom');

function checkVariants(base) {
  return (data) => {

    // Cannot mix base & variant data
    if ((data.newData.variants || data.newData.modifiers)
      && (data.newData.base || data.newData.variations)) {
      throw boom.notAcceptable('Inconsistent base/variants data');
    }

    if ((data.newData.base && !data.newData.variations)
      || data.newData.variations && !data.newData.base) {
      throw boom.notAcceptable('Inconsistent base/variations data');
    }

    if (data.newData.base) {
      // VARIANT
      // base: "ID01"
      // variations: [
      //   {id: "color", value: "Azul"}
      //   {id: "size", value: "38"}
      // ]
      return Promise
        .resolve(data)
        .then(data => {
          // Find base product
          return base.db.models.Product
            .findById(data.newData.base)
            .exec();
        })
        .then(baseProduct => {
          if (!baseProduct) throw boom.notAcceptable(`Base product '${data.newData.base}' not found`);
          // Check variations against the base Product modifications, while filtering them
          const filteredVariations = [];
          baseProduct.modifiers.forEach(modifier => {
            const variation = data.newData.variations.find(v => v.id === modifier);
            if (!variation || !variation.value) {
              throw boom.notAcceptable(`Variation '${modifier}' not found`);
            }
            filteredVariations.push(variation);
          });
          // Only use the filtered variations
          data.newData.variations = filteredVariations;
          return productData;
        });
    } else if (data.newData.modifiers) {
      // BASE PRODUCT
      // modifiers: ["color", "size"],
      // variants: [ID02, ID03, ID04] <-= Generated

      // There should be some modifier
      if (data.newData.modifiers.length === 0) {
        throw boom.notAcceptable('No modifiers found');
      }

      // If it's a create (we have an id), don't check variants (There isn't any yet)
      if (!data.newData.id) return productData;

      return Promise
        .resolve(data)
        .then(data => {
          // For each Variant check the variations
          const promises = [];
          data.oldProduct.variants.map(variantId => {
            return promises.push(new Promise((resolve, reject) => {
              // Find the Variant
              base.db.models.Product
                .findById(variantId)
                .then(variant => {
                  if (!variant) reject(`Variant '${variantId}' not found`);
                  // Check variations against the base Product modifications
                  data.newData.modifiers.forEach(modifier => {
                    const variation = variant.variations.find(v => v.id === modifier);
                    if (!variation || !variation.value) {
                      reject(boom.notAcceptable(`Variation '${modifier}' not found in variant ${variantId}`));
                    }
                  });
                  resolve();
                });
            }));
          });
          return Promise.all(promises).then(() => data);
        });
    }
  };
}

module.exports = checkVariants;
