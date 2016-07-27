# product.create

This method is used to create a Product.

# Arguments

This method has the URL https://server/services/catalog/v1/category.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token           | yes | Token       | Bearer xxxxx... | Authentication token.
sku             | yes | String      | 001017730838228085 | Unique stock keeping unit identifier.
status          | yes | String      | DRAFT | Status of the Product [ONLINE, DRAFT]. Only ONLINE Products are indexed and salable. 
title           | yes | String      | Two sided frigo | Product title to show in the store.
description     | no  | String      | Long description for this product | Product description. 
brand           | no  | String      | LG    | The Product Brand.
categories      | yes | String List | ['001', '002'] | A list of categories the Product belongs to. 
price           | yes | String      | 10.99 | The Product base price.
salePrice       | no  | Number      | 9.99  | The Product sale price.
isNetPrice      | no  | Boolean     | true  | Defines the price as Net of Gross. Defaults to false.
stockStatus     | yes | Number      | 0     | [0/1/2] (0: NORMAL, 1:UNLIMITED, 2:DISCONTINUED)
medias          | no  | Object List | [{id: '100x100', url: 'http:\/\/placehold.it/100x100'}] | List of urls pointing to images. 
classifications | no  | Object List | [{id: 'color', value: 'Grey'}] | If the Product belogs to a Category with classifications, a list of classification values.
base            | no  | String      | HJ4g4fACrH | In a Variant Product, the Parent Product id.
variations      | no  | Object List | [{id: 'color', value: 'Blue'}, {id: 'size', value: '15'}]  | In a Variant Product, the value of the modifiers. 
modifiers       | no  | Object List | [{'color', 'size'}] | In a Base Product, a list of product modifiers.
taxCode         | no  | String      | vat-7 | Tax code applicable to this product. Defaults to 'default'.   

# Response

Returns a Product object:
```javascript
{
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
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
max_categories_per_product_reached | The max number | The categories count exceed the limit per Product
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

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/catalog/v1/product.create \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{"sku": "0006", "title": "Product 001 title", 
           "description": "Product 001 description", "price": 100.00}'
```

# Events

A Product creation fires a `CREATE` event in the `PRODUCTS` channel.

## Payload

Property | Description
---------|------------
new  | The new Product created
data | The request data used to crate the Product 
