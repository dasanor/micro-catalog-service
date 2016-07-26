# category.list

This method is used to list the Categories, filering the results and selecting the fields returned

# Arguments

This method has the URL https://server/services/catalog/v1/category.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Example | Required | Description
---------|---------|----------|------------
token | Bearer xxxxx... | true | Authentication token
id | SJlkcsaQ | false | Comma separated ids list
title | refrigerator | false | Title /${title}/i regex expression
description | side by side | false | Description /${title}/i regex expression
slug | side-by-side-refrigerator | false | Comma separated slug list
parent | ROOT | false | Comma separated parent ids
path | ROOT.SJlkcsaQ | false | Start with path /^${path}/i regex expression
fields | sku,title,path | false | Comma separated field list to return

# Response

Returns a page
```javascript
{
  "ok": true,
  "page": {
    "limit": 10,
    "skip": 0
  },
  "data": [
    {
      "path": "ROOT.SkeZVQsV.BJ4SBQsE.HyS4SSXoE",
      "parent": "BJ4SBQsE",
      "title": "Side by Side Refrigerator",
      "description": null,
      "slug": "side-by-side-refrigerator",
      "classifications": [],
      "level": 4,
      "id": "HyS4SSXoE"
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
