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

  return ({ type, data }, done) => {
    if ((type === 'CREATE' || type === 'UPDATE') && !data.new.modifiers[0] && data.new.status === 'ONLINE') {
      base.search.index({
          index: searchIndex,
          type: searchType,
        id: data.new.id,
          body: {
            sku: data.new.sku,
            status: data.new.status,
            title: data.new.title,
            description: data.new.description,
            brand: data.new.brand,
            categories: data.new.categories,
            classifications: data.new.classifications.reduce((result, k) => {
              result[k.id] = k.value;
              return result;
            }, {}),
            price: data.new.price,
            salePrice: data.new.salePrice,
            medias: data.new.medias,
            base: data.new.base,
            variations: data.new.variations
          }
        })
        .then(() => {
          return done();
        })
        .catch(error => {
          base.logger.error(`[catalog] indexing saved product ${error}`);
          return done(error);
      });
    } else if (type === 'REMOVE' || data.new.status !== 'ONLINE') {
      base.search.delete({
        index: searchIndex,
        type: searchType,
        id: data.old.id,
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
