const shortId = require('shortid');

function modelFactory(base) {
  if (base.logger.isDebugEnabled()) base.logger.debug('[db] registering model Product');

  // Classification Values Schema
  const classificationValuesSchema = base.db.Schema({
    id: { type: String, required: true },
    value: { type: String, required: true }
  }, { _id: false, minimize: false });

  // Media Schema
  const mediaSchema = base.db.Schema({
    id: { type: String, required: true },
    url: { type: String, required: true }
  }, { _id: false, minimize: false });

  // The root schema
  const schema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    sku: { type: String, required: true },
    status: { type: String, required: false, default: 'DRAFT', enum: ['DRAFT', 'ONLINE'] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: false },
    categories: [{ type: String, required: true }],
    price: { type: Number, required: true },
    salePrice: { type: Number, required: false },
    medias: [mediaSchema],
    classifications: [classificationValuesSchema]
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

  schema.index({ sku: 1 }, { unique: true });

  // Add the model to mongoose
  return base.db.model('Product', schema);
}

module.exports = modelFactory;
