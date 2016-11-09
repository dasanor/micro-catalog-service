/**
 * ## `product.list` operation factory
 *
 * List Products operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const equalExpression = value => value;
  const inExpression = value => ({
    $in: value.split(',')
  });
  const likeExpression = value => ({
    $regex: new RegExp(value, 'i')
  });
  const filterExpressions = {
    id: inExpression,
    sku: inExpression,
    title: likeExpression,
    description: likeExpression,
    status: inExpression,
    type: inExpression,
    brand: likeExpression,
    taxCode: inExpression,
    stockStatus: inExpression,
    isNetPrice: equalExpression,
    base: inExpression,
    categories: inExpression
  };
  const selectableFields = base.db.models.Product.selectableFields;
  const defaultFields = selectableFields.join(' ');
  const allowedProperties = Object.keys(filterExpressions);
  const defaultLimit = 10;
  const maxLimit = 100;

  const op = {
    handler: (params, reply) => {

      // Filters
      const filters = allowedProperties
        .filter(k => params.hasOwnProperty(k))
        .reduce((result, k) => {
          const field = k === 'id' ? '_id' : k;
          result[field] = filterExpressions[k](params[k]);
          return result;
        }, {});

      // Pagination
      let limit = +params.limit || defaultLimit;
      if (limit > maxLimit) limit = maxLimit;
      const skip = +params.skip || 0;

      // Fields
      let fields;
      if (params.fields) {
        fields = params.fields.split(',')
          .filter(f => {
            if (f.substr(0, 1) === '-') return selectableFields.indexOf(f.substring(1)) !== -1;
            return selectableFields.indexOf(f) !== -1;
          })
          .join(' ');
      } else {
        fields = defaultFields;
      }

      // Query
      const query = base.db.models.Product
        .find(filters, fields)
        .populate('variants')
        .skip(skip)
        .limit(limit);

      // Exec the query
      query.exec()
        .then(products => {
          return products.map(p => p.toClient());
        })
        .then(products => {
          if (params.categoryPaths) {
            // Aggregate all category Ids
            const categoryIds = new Set();
            products.forEach(product => {
              product.categories.forEach(categoryId => {
                categoryIds.add(categoryId);
              });
            });
            const catFilter = { _id: { $in: Array.from(categoryIds) } };
            const catFields = 'path';
            // Get categories and add the path to the products
            return base.db.models.Category
              .find(catFilter, catFields)
              .lean()
              .then(categories => {
                const categoryPaths = categories.reduce((result, cat) => {
                  result[cat._id] = cat.path;
                  return result;
                }, {});
                products.forEach(product => {
                  product.categories.forEach(categoryId => {
                    product.categoryPaths = product.categoryPaths || {};
                    product.categoryPaths[categoryId] = categoryPaths[categoryId];
                  });
                });
                return products;
              })
              .catch(error => {
                throw error;
              });
          }
          return products;
        })
        .then(products => {
          return reply(base.utils.genericResponse({
            page: { limit, skip },
            data: products
          }));

        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
