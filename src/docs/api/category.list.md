# category.list

This method is used to list the Categories, filering the results and selecting the fields returned.

# Arguments

This method has the URL https://server/services/catalog/v1/category.list and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token         | yes | Token       | Bearer xxxxx...    | Authentication token.
id            | no  | String List | SJlkcsaQ, WER1YST2 | Comma separated Categories ids list.
title         | no  | String      | refrigerator       | Title /${title}/i regex expression.
description   | no  | String      | side by side       | Description /${title}/i regex expression.
slug          | no  | String List | side-by-side-refrigerator | Comma separated slugs list.
parent        | no  | String List | ROOT               | Comma separated parent ids.
path          | no  | String      | ROOT.SJlkcsaQ      | Start with path /^${path}/i regex expression.
fields        | no  | String List | title,path         | Comma separated field list to return.

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
