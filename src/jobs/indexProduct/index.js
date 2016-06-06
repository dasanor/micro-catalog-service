/**
 * Hook to allow customization of the indexing process
 */
function jobFactory(base) {
  // Listen to Product changes and enqueue a indexing job
  base.events.listen('products', (msg) => {
    if (base.search) {
      base.workers.enqueue('indexProduct', msg);
    }
  });

  return (params, done) => {
    base.search.index({
      index: 'products',
      type: 'product',
      id: params.data.sku,
      body: {
        sku: params.data.sku,
        status: params.data.status,
        title: params.data.title,
        description: params.data.description,
        brand: params.data.brand,
        categories: params.data.categories,
        price: params.data.price,
        salePrice: params.data.salePrice,
        medias: params.data.medias
      }
    }, (error) => {
      if (error) {
        base.logger.error(error);
        return done(error);
      }
      return done();
    });
  };
}


module.exports = jobFactory;
