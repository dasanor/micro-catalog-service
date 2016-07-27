# product.update

This method is used to update Product data.

# Arguments

This method has the URL https://server/services/catalog/v1/product.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token         | yes | Token  | Bearer xxxxx... | Authentication token.
id            | no  | String | HJ4g4fACrH        | The id of the Product to update.

## Updatable fields

See [product.create](./product.create.html) for a fields description.

Name |
-----|
sku |
title |
description |
status |
brand |
taxCode |
stockStatus |
base |
categories |
price |
salePrice |
isNetPrice |
medias |
classifications |
modifiers |
variants |
variations |

# Response

Product object

```javascript
    "ok": true,
    "product": { 
       "id" : "HJ4g4fACrH", 
       "base" : "SJ64fAAHH", 
       "sku" : "001017730838228085", 
       "title" : "Gel Noosa Tri 11", 
       "description" : "A long description for this shoes", 
       "brand" : "Asics", 
       "price" : 119.95, 
       "salePrice" : 99.95, 
       "isNetPrice" : false, 
       "taxCode" : "default", 
       "status" : "ONLINE", 
       "stockStatus" : 0,
       "classifications" : [
           { "id" : "color", "value" : "Multicolor" }, 
           { "id" : "genre", "value" : "hombre" }
       ], 
       "medias" : [
           {"id": "100x100", "url": "http://placehold.it/100x100"},
           {"id": "350x150", "url": "http://placehold.it/350x150"}    
       ], 
       "categories" : [
           "B1-Zr45Br"
       ] 
   }
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
product_not_found | The id not found | The Product was not found
category_not_found | The Category id | The Category was not found
missing_classification | The Classification id | The Classification was not found and it's mandatory
empty_classification_value | The Classification id | The Classification value is missing and it's mandatory
classification_value_not_a_boolean | The Classification id | The Classification value must be a boolean
classification_value_not_a_number | The Classification id |  The Classification value must be a number
inconsistent_base_variants_data | - | A Product must be a Base or a Variant (Cannot mix variants/modifiers with Base product/variations)
inconsistent_base_variantions_data | - | A Variant must have a Base product and variations data 
base_product_not_found | The Product id not found | The Base product was not found 
variation_data_not_found | The modifier name not found | The Variant must have the modifier value (a variation)
no_modifiers_found | - | A Base Product must provide at least one modifier
variant_not_found | The Variant id not found | The Variant product was not found
product_not_saved | - | The product was not updated

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/catalog/v1/product.update?id=HJ4g4fACrH \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{"title": "CGel Noosa Tri 11 by Asics", salePrice: 95.99}'
```

# Events

A Product creation fires a `UPDATE` event in the `PRODUCTS` channel.

## Payload

Property | Description
---------|------------
data | The request data used to update the Product 
old  | The Product as was before the update
new  | The new updated Product
