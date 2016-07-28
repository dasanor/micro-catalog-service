# product.remove

This method is used to remove a Product.

# Arguments

This method has the URL https://server/services/catalog/v1/product.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token         | yes | Token  | Bearer xxxxx... | Authentication token.
id            | no  | String | HJ4g4fACrH      | The id of the Product to remove.

# Response

Returns a default response:

```javascript
{
    "ok": true
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
product_not_found | The id not found | The Product was not found

# Example

```bash
curl --request POST \
  --url 'http://localhost:3000/services/catalog/v1/product.remove?id=HJ4g4fACrH \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```

# Events

A Product creation fires a `REMOVE` event in the `PRODUCTS` channel.

## Payload

Property | Description
---------|------------
old  | The Product deleted