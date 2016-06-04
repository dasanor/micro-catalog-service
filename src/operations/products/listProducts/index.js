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
    categories: inExpression,
    status: inExpression,
    title: likeExpression,
    description: likeExpression
  };
  const allowedProperties = Object.keys(filterExpressions);

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

      const filters = allowedProperties
        .filter(k => params[k] !== undefined)
        .reduce((result, k) => {
          result[k] = filterExpressions[k](params[k]);
          return result;
        }, {});

      base.db.models.Product
        .find(filters)
        .exec()
        .then(products => {
          console.log(filters);
          return reply({ query: filters, data: products.map(p => p.toClient()) });
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
