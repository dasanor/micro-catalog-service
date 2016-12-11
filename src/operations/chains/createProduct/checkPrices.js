const moment = require('moment');
const isoCurrencies = require('currency-format');
const isoCountries = require('i18n-iso-countries');

function factory(base) {
  return (context, next) => {
    console.log(context.newData);
    for (const price of context.newData.prices) {
      if (!price.amount || price.amount < 0) {
        return next(base.utils.Error('price_invalid', price.amount));
      }
      if (!price.currency || !isoCurrencies[price.currency]) {
        return next(base.utils.Error('price_currency_invalid', price.currency));
      }
      if (price.country && !isoCountries.alpha2ToNumeric(price.country)) {
        return next(base.utils.Error('price_country_invalid', price.country));
      }
      if ('validFrom' in price && !('validUntil' in price) || 'validUntil' in price && !('validFrom' in price)) {
        return next(base.utils.Error('price_valid_dates', {
          validFrom: price.validFrom,
          validUntil: price.validUntil
        }));
      }
      if ('validFrom' in price && 'validUntil' in price) {
        if (!moment(price.validFrom, moment.ISO_8601, true).isValid()) {
          return next(base.utils.Error('price_valid_dates', { validFrom: price.validFrom }));
        }
        if (!moment(price.validUntil, moment.ISO_8601, true).isValid()) {
          return next(base.utils.Error('price_valid_dates', { validUntil: price.validUntil }));
        }
        if (moment(price.validUntil).isSameOrBefore(price.validFrom)) {
          return next(base.utils.Error('price_valid_dates', {
            validFrom: price.validFrom,
            validUntil: price.validUntil
          }));
        }
      }
    }
    return next();
  };
}

module.exports = factory;
