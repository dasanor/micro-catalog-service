# micro-catalog-service

Ecommerce Catalog service using micro-base framework (beta).

Micro-base is a small framework to define and call services, and gives some basic utilities like config, logging, jobs and MongoDB access.
More info abot the framework [here](https://github.com/ncornag/micro-base/tree/develop).

# Features

## Products

Items with stock to add to the Cart. They have several characteristics:

Field | Description| Required | Default
------|------------|----------|--------
id | Internal unique product identifier | yes | System generated
sku | Unique stock keeping unit identifier | yes  |  -
status| Status of the Product [ONLINE|DRAFT]. Only ONLINE Products are indexed and salable | yes | 'DRAFT' 
title | Product title to show in the store | yes | - 
description | Product description | no | - 
brand | The Product Brand | no |  -
categories | A list of categories the Product belongs to | yes | - 
price | The Product base price | yes |  -
salePrice | The Product sale price | no | The Product price
isNetPrice | Defines the price as Net of Gross | no | -
stockStatus | [0|1|2] (0: NORMAL, 1:UNLIMITED, 2:DISCONTINUED) | yes | 0
medias: | List of urls pointing to images [{id: '100x100', url: 'http://myserver.com/images/myimage100x100.jpg'}] | no | - 
classifications | If the Product belogs to a Category with classifications, a list of classification values [{id: 'color', value: 'Grey'}] | no | -
base: | In a Variant Product, the Parent Product id | no | -
variations | In a Variant Product, the value of the modifiers [{id: 'color', value: 'Blue'}, {id: 'size', value: '15'}] | no | - 
variants | In a Base Product, a list of child Variant Products ids | no | - 
modifiers | In a Base Product, a list of product modifiers [{'color', 'size'}] | no | -
taxCode | Tax code applicable to this product | No | 'default'  
  
## Categories

The products should belong to Categories. The Categories allows the Product organization in an hierarchically way. 

Field | Description| Required | Default
------|------------|----------|--------
id | Internal unique category identifier | yes | System generated
title | Category title to show in the store | yes | - 
description | Category description | no | - 
slug | String to be used in the url | yes | - 
classifications | List of classifications the product must have to belog to this Category | no | - 

## Variants
  When you have the same product in several sizes and/or color you could use the Variants System.
  The Variants System allows to create a parent product and one or more child products, each of one have a different set of characteristics.
   
  * Base product
  Not salable Product that serves as a parent for Variants Products. They define the set of characteristic the Variants will differ

**Base example**
```javascript
{
  sku: '0001',
  title: 'Very nice shoe',
  modifiers: [
  'color',
  'size'
  ],
  variants: [
  '10001',
  '10002',
  '10003'
  ]
}
```
  
  * Variant
  Products that belong to a Base Product and differ in some characteristic (like color or size)
  
**Variant example**
```javascript
{
  sku: '1001',
  title: 'Very nice blue shoes',
  base: '0001'
  variations: [
    {id: 'color', value: 'Blue'},
    {id: 'size', value: '15'}
  ]
}

{
  sku: '1002',
  title: 'Very nice green shoes',
  base: '0001'
  variations: [
    {id: 'color', value: 'Green'},
    {id: 'size', value: '15'}
  ]
}

{
  sku: '1002',
  title: 'Very nice green big shoes',
  base: '0001'
  variations: [
    {id: 'color', value: 'Green'},
    {id: 'size', value: '25'}
  ]
}

```

## Classifications

The Products can belong to Categories with a Classification System defined. In that case, the Product must fill the classifications defined in the category.
The Classification System could be used to provide a "faceted" navigation when the user search Products.
 
**Category example**
```javascript
{ 
  id: 'C1', 
  title: 'Sports Shoes', 
  classifications: [
    {id: 'color', description: 'Color', type: 'STRING', mandatory: false}, 
    {id: 'genre', description: 'Female/Male/Kids', type: 'STRING', mandatory: true}, 
    {id: 'footprint', description: 'Motion mechanics', type: 'STRING', mandatory: false} 
  ] 
}
```

**Product with Classifications example**
```javascript
{
  sku: '2001',
  title: 'Very nice running shoes',
  categories:[ 'C1' ]
  classifications: [
    {id: 'color', value: 'Blue'},
    {id: 'genre', value: 'Kids'},
    {id: 'footprint', value: 'Supinator'}
  ]
}
```

## Indexing

The system uses [elasticsearch](https://www.elastic.co/products/elasticsearch) to index and search Products.