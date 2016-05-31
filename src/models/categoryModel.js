const shortId = require('shortid');
var tree = require('mongoose-path-tree');

function modelFactory(base) {
  if (base.logger.isDebugEnabled()) base.logger.debug('[db] registering model Category');

  // The root schema
  const schema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true }
  }, { _id: false, minimize: false, timestamps: true });

  // Enable the virtuals when converting to JSON
  schema.set('toJSON', {
    virtuals: true
  });

  // Add a method to clean the object before sending it to the client
  schema.method('toClient', function () {
    const obj = this.toJSON();
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
  });

  // Tree manager plugin
  schema.plugin(tree, {
    pathSeparator: '.',
    idType: String,
    onDelete: 'REPARENT'
  });

  schema.index({ slug: 1 }, { unique: true });

  // Add the model to mongoose
  return base.db.model('Category', schema);
}

module.exports = modelFactory;
