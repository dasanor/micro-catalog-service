# product.info

This method is used to obtain information about a Product.

# Arguments

This method has the URL https://server/services/catalog/v1/category.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token  | yes | Token  | Bearer xxxxx... | Authentication token.
id     | yes | String | HJ4g4fACrH      | The Product id to get info on.
fields | no  | String | sku,title,brand | Comma separated field list to return.

# Response

Returns a Product object:

```json
{
  "ok": true,
  "product": { 
    "id" : "HJ4g4fACrH", 
    "base" : "SJ64fAAHH", 
    "sku" : "001017730838228085", 
    "title" : "Gel Noosa Tri 11", 
    "description" : "A long description for this shoes", 
    "brand" : "Asics", 
    "prices" : [
     {
       "amount": 119.95,
       "currency": "EUR",
       "country": "DK"  
     } 
    ],
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
product_not_found | productId | The Product was not found

# Example

```bash
curl --request GET \
  --url http://localhost:3000/services/catalog/v1/product.info?id=HJ4g4fACrH \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```

# Events

A Product view fires a `VIEWED` event in the `PRODUCTS` channel.

## Payload

Property | Description
---------|------------
date      | The event date
productId | The id of the Product accessed
userId    | The id of the User that accessed the Product