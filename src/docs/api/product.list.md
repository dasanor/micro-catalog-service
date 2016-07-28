# product.list

This method is used to list the Products, filering the results and selecting the fields returned.

# Arguments

This method has the URL https://server/services/catalog/v1/product.list and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token         | yes | Token  | Bearer xxxxx...    | Authentication token.
id            | no  | String List | HJ4g4fACrH         | Comma separated Products ids list.
sku           | no  | String List | A00123321,A8778122 | Comma separated skus list.
title         | no  | String      | shoe               | Title /${title}/i regex expression.
description   | no  | String      | flexible shoe      | Description /${description}/i regex expression.
status        | no  | String List | ONLINE             | Comma separated status list.
brand         | no  | String      | Asics              | Brand /${brand}/i regex expression.
taxCode       | no  | String List | default,vat7       | Comma separated taxCodes list.
stockStatus   | no  | String      | 0,1                | Comma separated stockStatus list.
isNetPrice    | no  | Boolean     | true               | Net/Gross price.
base          | no  | String List | Ji4g3fACrH         | Comma separaded Product ids list.
categories    | no  | String List | SkeZVQsV, BJ4SBQsE | Comma separaded Categories ids list.
fields        | no  | String List | title,price        | Comma separated field list to return.

# Response

Returns a page:

```javascript
{
  "ok": true,
  "page": {
    "limit": 10,
    "skip": 0
  },
  "data": [
    { 
        "id" : "HJ4g4fACrH", 
        "title" : "Noosa Tri 11", 
        "price" : 119.95, 
    },
    { 
        "id" : "WfR5TfACr1", 
        "title" : "Gel", 
        "price" : 99.99, 
    }
  ]
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------


# Example
```bash
curl --request GET \
  --url 'http://localhost:3000/services/catalog/v1/category.list?title=frigo&fields=sku,title,path' \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```
