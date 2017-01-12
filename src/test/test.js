const Code = require('code');
const Lab = require('lab');
const nock = require('nock');
const request = require('supertest');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const base = require('../index.js');
const app = base.transports.http.app;

const defaultHeaders = base.config.get('test:defaultHeaders');

// Check the environment
if (process.env.NODE_ENV !== 'test') {
  console.log('\n[test] THIS ENVIRONMENT IS NOT FOR TEST!\n');
  process.exit(1);
}
// Check the database
if (!base.db.url.includes('test')) {
  console.log('\n[test] THIS DATABASE IS NOT A TEST DATABASE!\n');
  process.exit(1);
}

// Helper to clean the DB
function cleaner(callback) {
  const db = base.db.connections[0];
  var count = Object.keys(db.collections).length;
  Object.keys(db.collections).forEach(colName => {
    const collection = db.collections[colName];
    if (colName === 'categories') {
      collection.remove({_id: {$ne: 'ROOT'}}, () => {
        if (--count <= 0 && callback) {
          callback();
        }
      })
    } else {
      collection.drop(() => {
        if (--count <= 0 && callback) {
          callback();
        }
      });
    }
  });
}

// Helper to clean the database
function cleanDB(done) {
  return cleaner(done);
}

// Helper to initialize the database
function initDB(done) {
  return cleanDB(done);
}

// Helper to inject a call with default parameters
function callService(options) {
  options.method = options.method || 'POST';
  options.headers = options.headers || defaultHeaders;
  const promise = request(app)[options.method.toLowerCase()](options.url);
  Object.keys(options.headers).forEach(key => {
    promise.set(key, options.headers[key]);
  });
  if (options.payload) promise.send(options.payload);
  return promise;
}

// Helper to create categories
function createCategories(numEntries, categoryRequest) {
  categoryRequest = categoryRequest || {
      title: 'Category',
      description: 'This is the Category',
      slug: 'category',
      parent: 'ROOT'
    };
  const promises = Array.from(new Array(numEntries), (a, i) => {
    return callService({
      url: '/services/catalog/v1/category.create',
      payload: {
        title: `${categoryRequest.title} ${i}`,
        description: `${categoryRequest.description} ${i}`,
        slug: `${categoryRequest.slug}${i}`,
        parent: categoryRequest.parent
      }
    })
      .then(response => response.body);
  });
  return Promise.all(promises);
}

function createProduct(options) {
  const categories = ['ROOT'];
  const classifications = [{id: 'color', value: 'Multicolor'}];
  const prices = [{amount: 29.95, currency: 'USD'}];

  const payload = {
    sku: options.sku,
    title: options.title || 'Product Title',
    brand: options.brand || 'Brand name',
    prices: options.prices || prices,
    description: options.description || 'description',
    categories: options.categories || categories,
    isNetPrice: options.isNetPrice || false,
    taxCode: options.taxCode || 'default',
    status: options.status || 'ONLINE',
    classifications: options.classifications || classifications,
    base: options.base
  };

  if (options.modifiers) {
    payload.modifiers = options.modifiers;
  }

  if (options.variations) {
    payload.variations = options.variations;
  }

  return callService({
    url: '/services/catalog/v1/product.create',
    payload
  });
}

/*
 Category Tests
 */
describe('Category', () => {
  beforeEach(done => {
    initDB(done);
  });
  after(done => {
    cleanDB(done);
  });

  it('creates a Category', done => {
    const payload = {
      title: 'Category 01',
      description: 'This is the Category 01',
      slug: 'category01',
      parent: 'ROOT'
    };
    const options = {
      url: '/services/catalog/v1/category.create',
      payload: payload
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        //
        // {
        //   ok: true,
        //   category: {
        //     path: 'ROOT.BkhfCwRw',
        //     parent: 'ROOT',
        //     title: 'Category 01',
        //     description: 'This is the Category 01',
        //     slug: 'category01',
        //     classifications: [],
        //     level: 2,
        //     id: 'BkhfCwRw'
        //   }
        // }
        expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
        expect(response.body.category).to.be.an.instanceof(Object);
        const category = response.body.category;
        expect(category.id).to.be.a.string();
        expect(category.parent).to.be.a.string().and.to.equal('ROOT');
        expect(category.level).to.be.a.number().and.to.equal(2);
        expect(category.path).to.be.a.string().and.to.startWith('ROOT.');
        expect(category.title).to.be.a.string().and.to.equal(payload.title);
        expect(category.description).to.be.a.string().and.to.equal(payload.description);
        expect(category.slug).to.be.a.string().and.to.equal(payload.slug);
        expect(category.classifications).to.be.a.array().and.to.be.empty();
        done();
      })
      .catch(error => done(error));
  });

  it('creates a Category with classifications', done => {
    const payload = {
      title: 'Category 01',
      description: 'This is the Category 01',
      slug: 'category01',
      parent: 'ROOT',
      classifications: [
        {id: 'size', description: 'Size', type: 'NUMBER', mandatory: true},
        {id: 'tech', description: 'Technology', type: 'STRING', mandatory: true}
      ]
    };
    const options = {
      url: '/services/catalog/v1/category.create',
      payload: payload
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        //
        // {
        //   path: 'ROOT.B1gieGO0w',
        //   parent: 'ROOT',
        //   title: 'Category 01',
        //   description: 'This is the Category 01',
        //   slug: 'category01',
        //   classifications: [],
        //   level: 2,
        //   id: 'BkhfCwRw',
        //   classifications: [
        //     { id: 'size', description: 'Size', type: 'NUMBER', mandatory: true },
        //     { id: 'tech', description: 'Technology', type: 'STRING', mandatory: true }
        //   ]
        // }
        expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
        expect(response.body.category).to.be.an.instanceof(Object);
        const category = response.body.category;
        expect(category.id).to.be.a.string();
        expect(category.parent).to.be.a.string().and.to.equal('ROOT');
        expect(category.level).to.be.a.number().and.to.equal(2);
        expect(category.path).to.be.a.string().and.to.startWith('ROOT.');
        expect(category.classifications).to.be.a.array().and.to.have.length(2);
        done();
      })
      .catch(error => done(error));
  });

  it('creates a Category without parent, ROOT parent by default', done => {
    const payload = {
      title: 'Category 01',
      description: 'This is the Category 01',
      slug: 'category01'
    };
    const options = {
      url: '/services/catalog/v1/category.create',
      payload: payload
    };
    callService(options)
      .then(response => {
        expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
        expect(response.body.category).to.be.an.instanceof(Object);
        const category = response.body.category;
        expect(category.id).to.be.a.string();
        expect(category.parent).to.be.a.string().and.to.equal('ROOT');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Category, parent category not found ', done => {
    const payload = {
      title: 'Category 01',
      description: 'This is the Category 01',
      slug: 'category01',
      parent: 'WrongParent'
    };
    const options = {
      url: '/services/catalog/v1/category.create',
      payload: payload
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('parent_category_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('gets a Category by id', done => {
    const payload = {
      title: 'Category 01',
      description: 'This is the Category 01',
      slug: 'category01',
      parent: 'ROOT'
    };
    const options = {
      url: '/services/catalog/v1/category.create',
      payload: payload
    };
    callService(options)
      .then(createdResponse => {
        expect(createdResponse.body.ok).to.be.a.boolean().and.to.equal(true);
        const createdCategory = createdResponse.body.category;
        callService({url: `/services/catalog/v1/category.info?id=${createdCategory.id}`})
          .then(response => {
            expect(response.statusCode).to.equal(200);
            expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
            expect(response.body.category).to.be.an.instanceof(Object);
            const category = response.body.category;
            expect(category.id).to.be.a.string().and.equal(createdCategory.id);
            expect(category.title).to.be.a.string().and.to.equal(payload.title);
            expect(category.description).to.be.a.string().and.to.equal(payload.description);
            expect(category.slug).to.be.a.string().and.to.equal(payload.slug);
            done();
          });
      })
      .catch(error => done(error));
  });

  it('gets a Category by id, category not found', done => {
    const options = {
      url: '/services/catalog/v1/category.info?id=fakeId'
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('category_not_found');

        done();
      })
      .catch(error => done(error));
  });


  it('gets a Category by title', done => {
    const q = 3;
    const categoryTemplate = {
      title: 'Category',
      description: 'This is the Category',
      slug: 'category',
      parent: 'ROOT'
    };
    createCategories(q, categoryTemplate)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        callService({
          url: `/services/catalog/v1/category.list?title=${categoryTemplate.title} 1`
        })
          .then(response => {
            expect(response.statusCode).to.equal(200);
            expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
            const categories = response.body.data;
            expect(categories).to.be.a.array().and.to.have.length(1);
            const category = categories[0];
            expect(category.title).to.be.a.string().and.to.equal(`${categoryTemplate.title} 1`);
            done();
          });
      })
      .catch(error => done(error));
  });

  it('removes a Category', done => {
    const q = 3;
    createCategories(q)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        callService({
          url: `/services/catalog/v1/category.remove?id=${cats[0].category.id}`
        })
          .then(response => {
            expect(response.statusCode).to.equal(200);
            expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
            done();
          });
      })
      .catch(error => done(error));
  });

  it('removes a Category, category not found', done => {
    const options = {
      url: '/services/catalog/v1/category.remove?id=fakeId'
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('category_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('removes a Category, category not empty', done => {
    const q = 1;
    createCategories(q)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        const categoryId = cats[0].category.id
        const productOptions = {
          sku: 'productCategoryRemove',
          categories: [categoryId]
        };

        return createProduct(productOptions);
      })
      .then(response => {
        const product = response.body.product;

        return callService({
          url: `/services/catalog/v1/category.remove?id=${product.categories[0]}`
        });
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('category_not_empty');

        done();
      })
      .catch(error => done(error));
  });

  it('updates a Category', done => {
    const q = 3;
    createCategories(q)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        const payload = {
          title: 'Category title modified',
          parent: cats[0].category.id
        };
        callService({
          url: `/services/catalog/v1/category.update?id=${cats[1].category.id}`,
          payload
        })
          .then(response => {
            expect(response.statusCode).to.equal(200);
            expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
            const category = response.body.category;
            expect(category.title).to.be.a.string().and.to.equal(payload.title);
            expect(category.parent).to.be.a.string().and.to.equal(payload.parent);
            expect(category.level).to.be.a.number().and.to.equal(3);
            expect(category.path).to.be.a.string().and.to.equal(`ROOT.${cats[0].category.id}.${cats[1].category.id}`);
            done();
          });
      })
      .catch(error => done(error));
  });

  it('updates a Category, category not found ', done => {
    const q = 1;
    createCategories(q)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        const payload = {
          title: 'Category title modified',
          parent: 'ROOT'
        };

        return callService({
          url: '/services/catalog/v1/category.update?id=id',
          payload
        })
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('category_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('updates a Category, parent category not found ', done => {
    const q = 1;
    createCategories(q)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        const payload = {
          title: 'Category title modified',
          parent: 'wrongCategory'
        };

        return callService({
          url: `/services/catalog/v1/category.update?id=${cats[0].category.id}`,
          payload
        })
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('parent_category_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('gets a Category children', done => {
    const q = 4;
    createCategories(q)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        const payload = {
          parent: cats[0].category.id
        };
        callService({
          url: `/services/catalog/v1/category.update?id=${cats[1].category.id}`,
          payload
        })
          .then(response => {
            expect(response.statusCode).to.equal(200);
            expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
            const category = response.body.category;
            expect(category.parent).to.be.a.string().and.to.equal(payload.parent);
            return callService({
              method: 'GET',
              url: '/services/catalog/v1/category.info?id=ROOT&withChildren=true&recursive=true'
            });
          })
          .then(response => {
            expect(response.statusCode).to.equal(200);
            expect(response.body.ok).to.be.a.boolean().and.to.equal(true);
            const level1 = response.body.category.children;
            expect(level1).to.be.a.array().and.to.have.length(q - 1);
            const pos = level1.findIndex((cat) => cat.id === cats[0].category.id);
            const level2 = level1[pos].children;
            expect(level2).to.be.a.array().and.to.have.length(1);
            const category = level2[0];
            expect(category.id).to.be.a.string().and.to.equal(cats[1].category.id);
            done();
          });
      })
      .catch(error => done(error));
  });
});

/*
 Product Tests
 */
describe('Product', () => {
  beforeEach(done => {
    initDB(done);
  });
  after(done => {
    cleanDB(done);
  });

  it('creates a Product', done => {
    createProduct({sku: "product1"})
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(true);
        const product = response.body.product;
        expect(product.id).to.be.a.string();
        expect(product.sku).to.be.a.string().and.to.equal('product1');
        expect(product.title).to.be.a.string().and.to.equal('Product Title');
        expect(product.brand).to.be.a.string().and.to.startWith('Brand name');
        expect(product.taxCode).to.be.a.string().and.to.equal('default');
        expect(product.stockStatus).to.be.a.number().and.to.equal(0);
        expect(product.status).to.be.a.string().and.to.equal('ONLINE');
        expect(product.categories).to.be.a.array().and.to.have.length(1);
        expect(product.categories[0]).to.be.a.string().and.to.equal('ROOT');

        done();
      })
      .catch(error => done(error));
  });


  it('create a  variant product', done => {
    const options = {
      sku: 'product1',
      modifiers: ['color']
    };

    createProduct(options)
      .then(response => {
        const product = response.body.product;
        const productId = product.id;

        const options = {
          sku: 'product2',
          base: [productId],
          variations: [{id: 'color', value: 'Blue'}]
        };

        return createProduct(options);
      })
      .then(response => {
        const result = response.body;
        const product = result.product;
        expect(result.ok).to.be.a.boolean().and.to.equal(true);

        //Check product base has a variant now
        const options = {
          url: `/services/catalog/v1/product.info?id=${product.base}`
        };

        return callService(options);
      })
      .then(response => {
        const result = response.body;
        const product = result.product;
        expect(result.ok).to.be.a.boolean().and.to.equal(true);
        expect(product.variants[0].sku).to.be.a.string().and.to.equal('product2');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid price', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: -1,
          currency: 'USD'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_invalid');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid currency', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: 10,
          currency: 'USD1'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_currency_invalid');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid price country', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: 10,
          currency: 'USD',
          country: 'Country'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_country_invalid');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid price dates, not validUntil', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: 10,
          currency: 'USD',
          country: 'US',
          validFrom: '2017-01-01'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_valid_dates');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid price dates, not validFrom', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: 10,
          currency: 'USD',
          country: 'US',
          validUntil: '2017-01-01'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_valid_dates');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid price dates, wrong validFrom', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: 10,
          currency: 'USD',
          country: 'US',
          validFrom: '2017-051-051',
          validUntil: '2017-02-02'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_valid_dates');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid price dates, wrong validUntil', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: 10,
          currency: 'USD',
          country: 'US',
          validFrom: '2017-01-01',
          validUntil: '2017-051-051'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_valid_dates');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, invalid price dates, validUntil is before validFrom', done => {
    const options = {
      sku: 'product100',
      prices: [
        {
          amount: 10,
          currency: 'USD',
          country: 'US',
          validFrom: '2017-02-02',
          validUntil: '2017-01-01'
        }
      ]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('price_valid_dates');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, category not found', done => {
    const options = {
      sku: 'product1',
      categories: ['WrongCategory']
    };
    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('category_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, max categories per product', done => {
    const q = 6;
    createCategories(q)
      .then(cats => {
        expect(cats).to.be.a.array().and.to.have.length(q);
        let categories = [];
        cats.forEach(cat => categories.push(cat.category.id));

        const options = {
          sku: 'product1',
          categories: categories
        };

        return createProduct(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('max_categories_per_product_reached');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, inconsistent base variants', done => {
    createProduct({sku: 'product1'})
      .then(response => {
        const productBase = response.body.product;
        const options = {
          sku: 'product100',
          base: productBase.id,
          modifiers: ['color', 'size']
        };

        return createProduct(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('inconsistent_base_variants_data');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, inconsistent base variations', done => {
    createProduct({sku: 'product1'})
      .then(response => {
        const productBase = response.body.product;
        const options = {
          sku: 'product100',
          base: productBase.id
        };

        return createProduct(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('inconsistent_base_variations_data');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, base product not found', done => {
    const options = {
      sku: 'product100',
      base: 'wrongId',
      variations: [{id: 'color', value: 'Blue'}]
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('base_product_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, variation data not found', done => {
    const baseProductOptions = {
      sku: 'product1',
      modifiers: ['color']
    };

    createProduct(baseProductOptions)
      .then(response => {
        const productBase = response.body.product;
        const options = {
          sku: 'product100',
          base: productBase.id,
          variations: [{id: 'size', value: 'Small'}]
        };

        return createProduct(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('variation_data_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('creates a Product, no modifiers found', done => {
    const options = {
      sku: 'product100',
      modifiers: []
    };

    createProduct(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('no_modifiers_found');

        done();
      })
      .catch(error => done(error));
  });

  it('get a Product', done => {
    createProduct({sku: 'product1'})
      .then(response => {
        const productId = response.body.product.id;
        const options = {
          url: `/services/catalog/v1/product.info?id=${productId}`
        };

        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(true);
        expect(result.product.sku).to.be.a.string().and.to.equal('product1');

        done();
      })
      .catch(error => done(error));
  });

  it('get a Product, product not found', done => {
    const options = {
      url: '/services/catalog/v1/product.info?id=wrongId'
    };

    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('product_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('list of Products', done => {
    createProduct({sku: 'product1'})
      .then(response => {
        return createProduct({sku: 'product2'});
      })
      .then(response => {
        const options = {
          url: '/services/catalog/v1/product.list?sku=product2'
        };

        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(true);
        const products = result.data;
        expect(products.length).to.be.a.number().and.to.equal(1);
        expect(products[0].sku).to.be.a.string().and.to.equal('product2');

        done();
      })
      .catch(error => done(error));
  });

  it('remove a Product', done => {
    createProduct({sku: 'product1'})
      .then(response => {
        const productId = response.body.product.id;
        const options = {
          url: `/services/catalog/v1/product.remove?id=${productId}`
        };

        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(true);

        done();
      })
      .catch(error => done(error));
  });

  it('remove a Product, product not found', done => {
    const options = {
      url: '/services/catalog/v1/product.remove?id=wrongId'
    };

    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('product_not_found');

        done();
      })
      .catch(error => done(error));
  });

  it('update a Product', done => {
    createProduct({sku: 'product1'})
      .then(response => {
        const savedProduct = response.body.product;
        const payload = {
          sku: savedProduct.sku,
          title: 'newTitle',
          description: savedProduct.description,
          brand: savedProduct.brand,
          taxCode: savedProduct.taxCode,
          stockStatus: savedProduct.stockStatus,
          isNetPrice: savedProduct.isNetPrice,
          prices: savedProduct.prices,
          categories: savedProduct.categories,
          type: savedProduct.type,
          status: savedProduct.status
        };

        const options = {
          url: `/services/catalog/v1/product.update?id=${savedProduct.id}`,
          payload
        };

        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(true);
        expect(result.product.title).to.be.a.string().and.to.equal('newTitle');

        done();
      })
      .catch(error => done(error));
  });

  it('update a Product, product not found', done => {
    const options = {
      url: '/services/catalog/v1/product.update?id=wrongId'
    };

    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.be.a.boolean().and.to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('product_not_found');

        done();
      })
      .catch(error => done(error));
  });


});
