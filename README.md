# Catalog Service

[![NPM version][npm-image]][npm-url] 
[![Downloads][downloads-image]][npm-url] 
[![Build Status][travis-image]][travis-url] 
[![Coverage Status][coveralls-image]][coveralls-url] 
[![bitHound Overall Score][bithound-overal-image]][bithound-url]
[![bitHound Code][bithound-code-image]][bithound-url]
[![Dependency status][bithound-image]][bithound-url] 
[![Dev Dependency status][bithound-dev-image]][bithound-url] 

[npm-url]:https://npmjs.org/package/microbase
[downloads-image]:http://img.shields.io/npm/dm/microbase.svg
[npm-image]:http://img.shields.io/npm/v/microbase.svg

[travis-url]:https://travis-ci.org/ncornag/micro-catalog-service
[travis-image]:http://img.shields.io/travis/ncornag/micro-catalog-service/develop.svg
[coveralls-url]:https://coveralls.io/r/ncornag/micro-catalog-service
[coveralls-image]:https://img.shields.io/coveralls/ncornag/micro-catalog-service/develop.svg

[bithound-url]:https://www.bithound.io/github/ncornag/micro-catalog-service/develop
[bithound-overal-image]:https://www.bithound.io/github/ncornag/micro-catalog-service/badges/score.svg
[bithound-image]:https://img.shields.io/bithound/dependencies/github/ncornag/micro-catalog-service.svg
[bithound-dev-image]:https://img.shields.io/bithound/devDependencies/github/ncornag/micro-catalog-service.svg
[bithound-code-image]:https://www.bithound.io/github/ncornag/micro-catalog-service/badges/code.svg

Ecommerce Catalog service, part of the [microbase](http://microbase.io) 
ecosystem.

# Features

* Hierarchical Categories
* Category Classifications
* Variants
* Indexing and faceted search
* Taxes per product
* Stock status per product

# Entities

## Product

Items you could add to the Cart.

```json
{ 
    "id" : "HJ4g4fACrH", 
    "base" : "SJ64fAAHH", 
    "sku" : "001017730838228085", 
    "title" : "Gel Noosa Tri 11", 
    "description" : "A long description for this shoes", 
    "brand" : "Asics", 
    "prices" : [
      {
        "amount": 119.95,
        "currency": "EUR",
        "country": "DK"  
      } 
    ],
    "isNetPrice" : false, 
    "taxCode" : "default", 
    "status" : "ONLINE", 
    "stockStatus" : 0,
    "classifications" : [
        { "id" : "color", "value" : "Multicolor" }, 
        { "id" : "genre", "value" : "hombre" }
    ], 
    "medias" : [
        {"id": "100x100", "url": "http://placehold.it/100x100"},
        {"id": "350x150", "url": "http://placehold.it/350x150"}    
    ], 
    "categories" : [
        "B1-Zr45Br"
    ] 
}
```

## Category

The Categories allows the Product organization in an hierarchically way. 

```json
{ 
    "id" : "B1-Zr45Br", 
    "path" : "ROOT.rJWB4cSr.Bkx-rNcHH.B1-Zr45Br", 
    "parent" : "Bkx-rNcHH", 
    "title" : "Sport Shoes", 
    "description" : "Sport Shoes", 
    "slug" : "sport-shoes", 
    "classifications" : [
        {
            "id" : "color", 
            "description" : "Color", 
            "type" : "STRING", 
            "mandatory" : true
        }, 
        {
            "id" : "genre", 
            "description" : "Female/Male/Kids", 
            "type" : "STRING", 
            "mandatory" : false
        }, 
        {
            "id" : "footprint", 
            "description" : "Motion mechanics", 
            "type" : "STRING", 
            "mandatory" : false
        }
    ]
}
```

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

# Variants

  When you have the same product in several sizes and/or color you could 
  use the Variants System.
  
  The Variants System allows to create a parent product and one or more 
  child products, each of one have a different set of characteristics.
   
## Base product
  
  Not salable Product that serves as a parent for Variants Products. 
  They define the set of characteristic the Variants will differ

## Base example

```json
{
  "sku": "0001",
  "title": "Very nice shoe",
  "modifiers": [
    "color",
    "size"
  ],
  "variants": [
    "10001",
    "10002",
    "10003"
  ]
}
```
  
## Variant
  
  Products that belong to a Base Product and differ in some 
  characteristic (like color or size)
  
## Variant example

```json
{
  "sku": "1001",
  "title": "Very nice blue shoes",
  "base": "0001",
  "variations": [
    {"id": "color", "value": "Blue"},
    {"id": "size", "value": "15"}
  ]
}
```

```json
{
  "sku": "1002",
  "title": "Very nice green shoes",
  "base": "0001",
  "variations": [
    {"id": "color", "value": "Green"},
    {"id": "size", "value": "15"}
  ]
}
```

```json
{
  "sku": "1002",
  "title": "Very nice green big shoes",
  "base": "0001",
  "variations": [
    {"id": "color", "value": "Green"},
    {"id": "size", "value": "25"}
  ]
}
```

# Classifications

The Products can belong to Categories with a Classification System 
defined. In that case, the Product must fill the classifications defined 
in the category.
The Classification System could be used to provide a "faceted" 
navigation when the user search Products.
 
## Category example

```json
{ 
  "id": "C1", 
  "title": "Sports Shoes", 
  "classifications": [
    {"id": "color", "description": "Color", "type": "STRING", "mandatory": false}, 
    {"id": "genre", "description": "Female/Male/Kids", "type": "STRING", "mandatory": true}, 
    {"id": "footprint", "description": "Motion mechanics", "type": "STRING", "mandatory": false} 
  ] 
}
```

## Product with Classifications example

```json
{
  "sku": "2001",
  "title": "Very nice running shoes",
  "categories":[ "C1" ]
  "classifications": [
    {"id": "color", "value": "Blue"},
    {"id": "genre", "value": "Kids"},
    {"id": "footprint", "value": "Supinator"}
  ]
}
```

# Indexing

The system uses [elasticsearch](https://www.elastic.co/products/elasticsearch) 
to index and search Products.

# API

The full API documentation can be accessed in the microbase web http://docs.microbase.io