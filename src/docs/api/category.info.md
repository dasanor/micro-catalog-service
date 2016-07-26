# category.info

This method is used to obtain information about a Category

# Arguments

This method has the URL https://server/services/catalog/v1/category.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Example | Required | Description
---------|---------|----------|------------
token | Bearer xxxxx... | true | Authentication token
id | SJlkcsaQ | true | The Category id to get info on
withChildrens | true | false | Set to 'true' to obtain the children categories
recursive | false | true | Set to 'true' to recursively get the children children's 

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