function factory(base) {
  return (context, next) => {
    if (context.categories) {
      const promises = context.categories.map(category => {
        return new Promise((resolve, reject) => {
        category.getAncestors({}, 'classifications', {}, (err, ancestors) => {
          if (err) reject(err);
          const result = ancestors
            .reduce((bag, a) => bag.concat(a.classifications), [])
            .concat(category.classifications);
          resolve(result);
        });
        });
      });
      Promise.all(promises)
        .then((results) => results.reduce((bag, a) => bag.concat(a), []))
        .then(classifications => {
          const filteredClassifications = [];
          classifications.forEach(c => {
            const cData = context.newData.classifications.find(x => x.id === c.id);
            if (!cData && c.mandatory) throw base.utils.Error('missing_classification', c.id);
            if (cData) {
              if (!cData.value && c.mandatory) throw base.utils.Error('empty_classification_value', c.id);
              if (c.type === 'STRING') cData.value = `${cData.value}`;
              if (c.type === 'BOOLEAN' && typeof cData.value !== 'boolean') throw base.utils.Error('classification_value_not_a_boolean', c.id);
              if (c.type === 'NUMBER') cData.value = +cData.value;
              if (c.type === 'NUMBER' && !Number.isFinite(cData.value)) throw base.utils.Error('classification_value_not_a_number', c.id);
              filteredClassifications.push(cData);
            }
          });
          context.newData.classifications = filteredClassifications;
          next();
        })
        .catch(next);
    } else {
      next();
    }
  };
}

module.exports = factory;
