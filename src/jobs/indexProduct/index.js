/**
 * Hook to allow customization of the indexing process
 */
function jobFactory(base) {
  return (params, done) => {
    base.search.index({
      index: 'products',
      type: 'product',
      id: params.data.sku,
      body: {
        sku: params.data.sku,
        title: params.data.title,
        description: params.data.description,
        categories: params.data.categories,
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

// Listen to Product changes and enqueue a indexing job
base.events.listen('products', (msg) => {
  base.workers.enqueue('indexProduct', msg);
});

module.exports = jobFactory;
