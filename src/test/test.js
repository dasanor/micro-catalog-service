const shortId = require('shortid');

const Code = require('code');
const Lab = require('lab');
const nock = require('nock');
const request = require('supertest-as-promised');

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
      collection.remove({ _id: { $ne: 'ROOT' } }, () => {
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
        { id: 'size', description: 'Size', type: 'NUMBER', mandatory: true },
        { id: 'tech', description: 'Technology', type: 'STRING', mandatory: true }
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
        callService({ url: `/services/catalog/v1/category.info?id=${createdCategory.id}` })
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
