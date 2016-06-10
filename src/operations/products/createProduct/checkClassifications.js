const boom = require('boom');

function checkClassifications(/* base */) {
  return (productData, categories) => {
    const promises = [];
    categories.map(category => {
      return promises.push(new Promise(function (resolve, reject) {
        category.getAncestors({}, 'classifications', {}, (err, ancestors) => {
          if (err) reject(err);
          const result = ancestors
            .reduce((bag, a) => bag.concat(a.classifications), [])
            .concat(category.classifications);
          resolve(result);
        });
      }));
    });
    return Promise.all(promises)
      .then(function (results) {
        return results.reduce((bag, a) => bag.concat(a), []);
      })
      .then(classifications => {
        const filteredClassifications = [];
        classifications.forEach(c => {
          const cData = productData.classifications.find(x => x.id === c.id)
          if (!cData && c.mandatory) throw new boom.notAcceptable(`Missing classification '${c.id}'`);
          if (!cData.value && c.mandatory) throw new boom.notAcceptable(`Empty classification '${c.id}' value`);
          // TODO: Check datatypes
          if (c.type === 'STRING') cData.value = `${cData.value}`;
          if (c.type === 'NUMBER') cData.value = new Boolean(cData.value).valueOf();
          if (c.type === 'NUMBER') cData.value = +cData.value;
          if (c.type === 'BOOLEAN' && typeof cData.value !== 'boolean') throw new boom.notAcceptable(`Classification '${c.id}' not boolean`);
          if (c.type === 'NUMBER' && !Number.isFinite(cData.value)) throw new boom.notAcceptable(`Classification '${c.id}' not numeric`);
          filteredClassifications.push(cData);
        });
        productData.classifications = filteredClassifications;
        return productData;
      });
  };
}

module.exports = checkClassifications;
