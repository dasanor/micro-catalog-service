# micro-catalog-service

Ecommerce Catalog service, part of the [microbase](http://microbase.io) 
ecosystem.

# Features

* Hierarchical Categories
* Category Classifications
* Variants
* Indexing and faceted search
* Taxes per product
* Stock status per product

## Products

Items you could add tothe Cart.

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique product identifier | String | yes | System generated
sku | Unique stock keeping unit identifier | String | yes  |  -
status| Status of the Product [ONLINE/DRAFT]. Only ONLINE Products are indexed and salable | String | yes | 'DRAFT' 
title | Product title to show in the store | String | yes | - 
description | Product description | String | no | - 
brand | The Product Brand | String | no |  -
categories | A list of categories the Product belongs to | String List | yes | - 
price | The Product base price | Number | yes |  -
salePrice | The Product sale price | Number | no | The Product price
isNetPrice | Defines the price as Net of Gross | Boolean | no | -
stockStatus | [0/1/2] (0: NORMAL, 1:UNLIMITED, 2:DISCONTINUED) | Number | yes | 0
medias | List of urls pointing to images [{id: '100x100', url: 'http://myserver.com/images/myimage100x100.jpg'}] | Object List | no | - 
classifications | If the Product belogs to a Category with classifications, a list of classification values [{id: 'color', value: 'Grey'}] | Object List | no | -
base | In a Variant Product, the Parent Product id | String | no | -
variations | In a Variant Product, the value of the modifiers [{id: 'color', value: 'Blue'}, {id: 'size', value: '15'}] | Object List | no | - 
variants | In a Base Product, a list of child Variant Products ids | String List | no | - 
modifiers | In a Base Product, a list of product modifiers [{'color', 'size'}] | Object List | no | -
taxCode | Tax code applicable to this product | String | no | 'default'  
  
## Categories

The Categories allows the Product organization in an hierarchically way. 
The `ROOT` default Category is the parent of all Categories.
   
```
ROOT
  +--- Electronics
       +--- Televisions
            +--- 4K
            +--- OLED
       +--- Audio
       +--- Cameras
  +--- Computers
       +--- Monitors
       +--- Networking
```

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique category identifier | String | yes | System generated
title | Category title to show in the store | String | yes | - 
description | Category description | String | no | - 
slug | String to be used in the url | String | yes | - 
parent | Parent Category | String | no | ROOT 
path | Representation of the Category hierarchy with their ids. i.e: `ROOT.rJWB4cSr.B1-Zr45Br` | String | no | - 
classifications | List of classifications the product must have to belog to this Category | String List | no | - 

## Variants
  When you have the same product in several sizes and/or color you could 
  use the Variants System.
  
  The Variants System allows to create a parent product and one or more 
  child products, each of one have a different set of characteristics.
   
  * Base product
  
  Not salable Product that serves as a parent for Variants Products. 
  They define the set of characteristic the Variants will differ

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
  
  Products that belong to a Base Product and differ in some 
  characteristic (like color or size)
  
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

The Products can belong to Categories with a Classification System 
defined. In that case, the Product must fill the classifications defined 
in the category.
The Classification System could be used to provide a "faceted" 
navigation when the user search Products.
 
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

The system uses [elasticsearch](https://www.elastic.co/products/elasticsearch) 
to index and search Products.

## API

The full API documentation can be accessed in the microbase web http://api.microbase.io 
and provide access to the Products and Categories endpoints to create, 
modify and delete them:

### Categories

Name | Description | Method | Endpoint
-----|-------------|--------|---------
catalog:createCategory | Creates a Category | `POST` | `/services/catalog/v1/category`
catalog:getCategory | Retrieves a Category | `GET` | `/services/catalog/v1/category/{categoryId}`
catalog:updateCategory | Updates a Category | `PUT` | `/services/catalog/v1/category/{categoryId}`
catalog:removeCategory | Removes a Category | `DELETE` | `/services/catalog/v1/category/{categoryId}`
catalog:listCategories | Search Categories and filter fields | `GET` | `/services/catalog/v1/category`
catalog:getCategoryChildren | Get a Category child Categories recursively | `GET` | `/services/catalog/v1/category/{categoryId}/children`

### Products

Name | Description | Method | Endpoint
-----|-------------|--------|---------
catalog:createProduct | Creates a Product | `POST` | `/services/catalog/v1/product`
catalog:getProduct | Retrieves a Product | `GET` | `/services/catalog/v1/product/{productId}`
catalog:updateProduct | Updates a Product | `PUT` | `/services/catalog/v1/product/{productId}`
catalog:removeProduct | Removes a Product | `DELETE` | `/services/catalog/v1/product/{productId}`
catalog:listProducts | Search Products and filter fields | `GET` | `/services/catalog/v1/product`