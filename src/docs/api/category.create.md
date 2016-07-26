# category.create

This method is used to create a Category.

# Arguments

This method has the URL https://server/services/catalog/v1/category.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Example | Required | Description
---------|---------|----------|------------
token | Bearer xxxxx... | true | Authentication token

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
parent_category_not_found | The id not found | Parent Category not found
duplicate_key | Index name and data causing the error | Some unique key violation
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/catalog/v1/category.create \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{"title": "Category 02", "description": "This is the Category 02",
           "slug": "category02", "parent": "S1_B6X97"}'
```