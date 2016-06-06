const boom = require('boom');

/**
 * ## `listCategories` operation factory
 *
 * List Categories operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const equalExpression = value => value;
  const startWithExpression = value => ({
    $regex: new RegExp(value, 'i')
  });
  const inExpression = value => ({
    $in: value.split(',')
  });
  const likeExpression = value => ({
    $regex: new RegExp(`^${value}`, 'i')
  });
  const filterExpressions = {
    id: inExpression,
    title: likeExpression,
    description: likeExpression,
    slug: inExpression,
    parent: inExpression,
    path: startWithExpression
  };
  const returnFields = [
    'id',
    'title',
    'description',
    'slug',
    'parent',
    'path'
  ];
  const defaultFields = returnFields.join(' ');
  const allowedProperties = Object.keys(filterExpressions);
  const defaultLimit = 10;
  const maxLimit = 100;

  /**
   * ## catalog.listCategories service
   *
   * List Categories filtering by fields
   */
  const op = {
    name: 'listCategories',
    path: '/category',
    method: 'GET',
    handler: (params, reply) => {

      // Filters
      const filters = allowedProperties
        .filter(k => params.hasOwnProperty(k))
        .reduce((result, k) => {
          result[k] = filterExpressions[k](params[k]);
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
      const query = base.db.models.Category
        .find(filters, fields)
        .skip(skip)
        .limit(limit);

      // Exec the query
      query.exec()
        .then(categories => {
          return reply({ page: { limit, skip }, data: categories.map(p => p.toClient()) });
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
