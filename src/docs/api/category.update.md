# category.update

This method is used to update Category data

# Arguments

This method has the URL https://server/services/catalog/v1/category.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token         | yes | Token  | Bearer xxxxx... | Authentication token.
id            | no  | String | SJlkcsaQ        | The id of the Category to update.

## Updatable fields

See [category.create](./category.create.html) for a fields description.

Name |
-----|
title
description
slug
classification
parent

# Response

Category object
```javascript
{
    "ok": true,
    "category": {
        "id": "SJlkcsaQ",
        "level": 3,
        "title": "Category title modified",
        "description": "This is the Category description",
        "slug": "categorywithclass01",
        "parent": "S1_B6X97",
        "path": "ROOT.S1_B6X97.SJlkcsaQ"
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
parent_category_not_found | The id not found | Parent Category not found
duplicate_key | Index name and data causing the error | Some unique key violation
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/catalog/v1/category.update?id=SJlkcsaQ \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{"title": "Category title modified", "parent": "S1_B6X97"}'
```