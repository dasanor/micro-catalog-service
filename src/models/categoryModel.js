const shortId = require('shortid');
var tree = require('mongoose-path-tree');

function modelFactory(base, configKeys) {
  const modelName = configKeys[configKeys.length - 1];
  if (base.logger.isDebugEnabled()) base.logger.debug(`[db] registering model '${modelName}'`);

  // Classification Schema
  const classificationSchema = base.db.Schema({
    id: { type: String, required: true },
    description: { type: String, required: true },
    mandatory: { type: Boolean, required: true },
    type: { type: String, required: true, enum: ['STRING', 'BOOLEAN', 'NUMBER'] }
  }, { _id: false, minimize: false });

  // The root schema
  const schema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    slug: { type: String, required: true },
    classifications: [classificationSchema]
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

  schema.index({ parent: 1, slug: 1 }, { unique: true });

  const model = base.db.model(modelName, schema);

  model.selectableFields = [
    'id',
    'title',
    'description',
    'slug',
    'parent',
    'path',
    'classifications'
  ];

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
