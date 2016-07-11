function factory(base) {
  const productsChannel = base.config.get('bus:channels:products:name');
  return (context, next) => {
    // Send a products CREATE event
    base.bus.publish(`${productsChannel}.CREATE`,
      {
        new: context.savedProduct.toObject({ virtuals: true }),
        data: context.newData
      }
    );
    if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${context.savedProduct._id} created`);
    next();
  };
}

module.exports = factory;




