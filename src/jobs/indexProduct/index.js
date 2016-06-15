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
    console.log(type, product.modifiers, product.status);
    if ((type === 'CREATE' || type === 'UPDATE') && !product.modifiers[0] && product.status === 'ONLINE') {
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
        })
        .then(() => {
          return done();
        })
        .catch(error => {
          base.logger.error(`[catalog] indexing saved product ${error}`);
          return done(error);
      });
    } else if (type === 'REMOVE' || product.status !== 'ONLINE') {
      base.search.delete({
          index: searchIndex,
          type: searchType,
          id: product.id,
          ignore: [404]
        })
        .then(() => {
          return done();
        })
        .catch(error => {
          base.logger.error(`[catalog] indexing deleted product ${error}`);
          return done(error);
        });
    }
  };
}

module.exports = jobFactory;
