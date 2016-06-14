/**
 * Hook to allow customization of the indexing process
 */
function jobFactory(base) {

  const searchIndex = 'products';
  const searchType = 'product';
  const productsChannel = base.config.get('channels:products');

  // Listen to Product changes and enqueue a indexing job
  if (base.search) {
    base.logger.info('[products] activating indexing');
    base.events.listen(productsChannel, (msg) => {
      base.workers.enqueue('indexProduct', msg);
    });
  }

  return ({ type, data:product }, done) => {
    if ((type === 'CREATE' || type === 'UPDATE') && !product.modifiers) {
      base.search.index({
        index: searchIndex,
        type: searchType,
        id: product.id,
        body: {
          sku: product.sku,
          status: product.status,
          title: product.title,
          description: product.description,
          brand: product.brand,
          categories: product.categories,
          classifications: product.classifications.reduce((result, k) => {
            result[k.id] = k.value;
            return result;
          }, {}),
          price: product.price,
          salePrice: product.salePrice,
          medias: product.medias,
          base: product.base,
          variations: product.variations
        }
      }, (error) => {
        if (error) {
          base.logger.error(`[catalog] indexing saved product ${error}`);
          return done(error);
        }
        return done();
      });
    } else if (type === 'REMOVE') {
      base.search.delete({
        index: searchIndex,
        type: searchType,
        id: product.id
      }, (error) => {
        if (error) {
          base.logger.error(`[catalog] indexing deleted product ${error}`);
          return done(error);
        }
        return done();
      });
    }
  };
}

module.exports = jobFactory;
