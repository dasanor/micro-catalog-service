const boom = require('boom');

function checkVariants(base) {
  return (productData) => {

    // Cannot mix base & variant data
    if ((productData.variants || productData.modifiers)
      && (productData.base || productData.variations)) {
      throw boom.notAcceptable('Inconsistent base/variants data');
    }

    if (productData.base) {
      // VARIANT
      // base: "ID01"
      // variations: [
      //   {id: "color", value: "Azul"}
      //   {id: "size", value: "38"}
      // ]
      return Promise
        .resolve(productData)
        .then(productData => {
          // Find base product
          return base.db.models.Product
            .findById(productData.base)
            .exec();
        })
        .then(baseProduct => {
          if (!baseProduct) throw boom.notAcceptable(`Base product '${productData.base}' not found`);
          // Check variations against the base Product modifications, while filtering them
          const filteredVariations = [];
          baseProduct.modifiers.forEach(modifier => {
            const variation = productData.variations.find(v => v.id === modifier);
            if (!variation || !variation.value) {
              throw boom.notAcceptable(`Variation '${modifier}' not found`);
            }
            filteredVariations.push(variation);
          });
          // Only use the filtered variations
          productData.variations = filteredVariations;
          return productData;
        });
    } else if (productData.modifiers) {
      // BASE PRODUCT
      // modifiers: ["color", "size"],
      // variants: [ID02, ID03, ID04] <-= Generated

      // There should be some modifier
      if (productData.modifiers.length === 0) {
        throw boom.notAcceptable('No modifiers found');
      }

      // If it's a create (we have an id), don't check variants (There isn't any yet)
      if (!productData.id) return productData;

      return Promise
        .resolve(productData)
        .then(productData => {
          // Find the original product to obtain the variants
          return base.db.models.Product
            .findById(productData.id)
            .exec();
        })
        .then(baseProduct => {
          // For each Variant check the variations
          const promises = [];
          baseProduct.variants.map(variantId => {
            return promises.push(new Promise((resolve, reject) => {
              // Find the Variant
              base.db.models.Product
                .findById(variantId)
                .then(variant => {
                  if (!variant) reject(`Variant '${variantId}' not found`);
                  // Check variations against the base Product modifications
                  productData.modifiers.forEach(modifier => {
                    const variation = variant.variations.find(v => v.id === modifier);
                    if (!variation || !variation.value) {
                      reject(boom.notAcceptable(`Variation '${modifier}' not found in variant ${variantId}`));
                    }
                  });
                  resolve();
                });
            }));
          });
          return Promise.all(promises);
        });
    }
  };
}

module.exports = checkVariants;
