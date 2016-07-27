# category.info

This method is used to obtain information about a Category

# Arguments

This method has the URL https://server/services/catalog/v1/category.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token         | yes | Token   | Bearer xxxxx... | Authentication token.
id            | yes | String  | SJlkcsaQ        | The Category id to get info on.
withChildrens | no  | Boolean | true            | Set to 'true' to obtain the children categories. Defaults to 'false'.
recursive     | no  | Boolean | true            | Set to 'true' to recursively get the children children's. Defaults to 'false'. 

# Response

Returns a Category object:
```javascript
{
    "ok": true,
    "category": {
        "id": "SJlkcsaQ",
        "level": 2,
        "title": "Category with classifications 01",
        "description": "This is the Category with classifications 01",
        "slug": "categorywithclass01",
        "parent": "ROOT",
        "classifications": [
            {"id": "size", "description": "Size", "type": "NUMBER", "mandatory": true},
            {"id": "tech", "description": "Technology", "type": "STRING", "mandatory": true}
        ]
    }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
category_not_found | The id not found | The Category was not found

# Example

```bash
curl --request GET \
  --url http://localhost:3000/services/catalog/v1/category.info?id=SJlkcsaQ \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```