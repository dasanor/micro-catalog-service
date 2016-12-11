const shortId = require('shortid');

function modelFactory(base, configKeys) {
  const modelName = configKeys[configKeys.length - 1];
  if (base.logger.isDebugEnabled()) base.logger.debug(`[db] registering model '${modelName}'`);

  const STOCKSTATUS = {
    NORMAL: 0,
    UNLIMITED: 1,
    DISCONTINUED: 2
  };

  const STATUS = {
    DRAFT: 'DRAFT',
    ONLINE: 'ONLINE'
  };

  const TYPE = {
    SIMPLE: 0,
    BASE: 1,
    VARIANT: 2
  };

  // Variations Values Schema
  const variationsValuesSchema = base.db.Schema({
    id: { type: String, required: true },
    value: { type: String, required: true }
  }, { _id: false });

  // Classification Values Schema
  const classificationValuesSchema = base.db.Schema({
    id: { type: String, required: true },
    value: { type: String, required: true }
  }, { _id: false });

  // Media Schema
  const mediaSchema = base.db.Schema({
    id: { type: String, required: true },
    url: { type: String, required: true }
  }, { _id: false });

  // Price Schema
  const priceSchema = base.db.Schema({
    id: { type: String, required: true, default: shortId.generate },
    amount: { type: Number, required: true },
    currency: { type: String, required: true }, // ISO 4217
    country: { type: String, required: false }, // ISO 3166-1 alpha-2
    customerType: { type: String, required: false },
    channel: { type: String, required: false },
    validFrom: { type: Date, required: false },
    validUntil: { type: Date, required: false }
  }, { _id: false });

  // The root schema
  const schema = base.db.Schema({
    _id: { type: String, required: true, default: shortId.generate },
    sku: { type: String, required: true },
    status: {
      type: String,
      required: false,
      default: 'DRAFT',
      enum: Object.keys(STATUS).map(s => STATUS[s])
    },
    type: {
      type: Number,
      required: true,
      default: 0,
      enum: Object.keys(TYPE).map(s => TYPE[s])
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    brand: { type: String, required: false },
    categories: [{ type: String, ref: 'Category' }],
    prices: [priceSchema],
    isNetPrice: { type: Boolean, required: true, default: false },
    stockStatus: {
      type: Number,
      required: true,
      default: 0,
      enum: Object.keys(STOCKSTATUS).map(s => STOCKSTATUS[s])
    },
    medias: [mediaSchema],
    classifications: [classificationValuesSchema],
    modifiers: [{ type: String, required: false }],
    variants: [{ type: String, required: false, ref: 'Product' }],
    base: { type: String, required: false },
    variations: [variationsValuesSchema],
    taxCode: { type: String, required: false, default: 'default' }
  }, { _id: false, timestamps: true });

  // Enable the virtuals when converting to JSON
  schema.set('toJSON', {
    virtuals: true
  });

  function toClient(obj) {
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    if (obj.base) {
      delete obj.modifiers;
      delete obj.variants;
    } else if (obj.modifiers) {
      delete obj.base;
      delete obj.variations;
    }
    if (obj.classifications && obj.classifications.length === 0) delete obj.classifications;
    return obj;
  }

  // Add a method to clean the object before sending it to the client
  schema.method('toClient', function () {
    const result = toClient(this.toJSON());
    if (result.variants) result.variants = result.variants.map((v) => toClient(v));
    return result;
  });

  schema.index({ sku: 1 }, { unique: true });

  const model = base.db.model(modelName, schema);
  model.STOCKSTATUS = STOCKSTATUS;
  model.STATUS = STATUS;
  model.TYPE = TYPE;

  model.selectableFields = [
    'id',
    'sku',
    'title',
    'description',
    'status',
    'type',
    'brand',
    'taxCode',
    'stockStatus',
    'base',
    'categories',
    'prices',
    'isNetPrice',
    'medias',
    'classifications',
    'modifiers',
    'variants',
    'variations'
  ];

  model.updatableFields = [
    'sku',
    'title',
    'description',
    'status',
    'type',
    'brand',
    'taxCode',
    'stockStatus',
    'base',
    'categories',
    'prices',
    'isNetPrice',
    'medias',
    'classifications',
    'modifiers',
    'variants',
    'variations'
  ];

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
