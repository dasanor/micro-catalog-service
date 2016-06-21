const boom = require('boom');

/**
 * ## `listProduct` operation factory
 *
 * List Products operation
 *
 * @param {base} Object The micro-base object
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
    categories: inExpression,
    status: inExpression,
    brand: likeExpression,
    taxCode: inExpression
  };
  const returnFields = [
    'id',
    'sku',
    'title',
    'description',
    'price',
    'salePrice',
    'isNetPrice',
    'medias',
    'categories',
    'status',
    'brand',
    'taxCode',
    'classifications',
    'base',
    'modifiers',
    'variants',
    'variations'
  ];
  const defaultFields = returnFields.join(' ');
  const allowedProperties = Object.keys(filterExpressions);
  const defaultLimit = 10;
  const maxLimit = 100;

  /**
   * ## catalog.listProduct service
   *
   * List Products filtering by fields
   */
  const op = {
    name: 'listProducts',
    path: '/product',
    method: 'GET',
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
          .filter(f => returnFields.indexOf(f) !== -1)
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
          return reply({ page: { limit, skip }, data: products.map(p => p.toClient()) });
        })
        .catch(error => {
          reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
