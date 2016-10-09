function factory(base) {
  const productsChannel = base.config.get('bus:channels:products:name');
  return (context, next) => {
    // Send a products UPDATE event
    base.bus.publish(`${productsChannel}.UPDATE`, {
      new: context.savedProduct.toObject({ virtuals: true }),
      old: context.oldProduct.toObject({ virtuals: true }),
      data: context.newData
    });
    if (base.logger.isDebugEnabled()) base.logger.debug(`[product] product ${context.savedProduct._id} updated`);
    next();
  };
}

module.exports = factory;
