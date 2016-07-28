# Catalog Service

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

```javascript
{ 
    "id" : "HJ4g4fACrH", 
    "base" : "SJ64fAAHH", 
    "sku" : "001017730838228085", 
    "title" : "Gel Noosa Tri 11", 
    "description" : "A long description for this shoes", 
    "brand" : "Asics", 
    "price" : 119.95, 
    "salePrice" : 99.95, 
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

```javascript
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
  
## Variant
  
  Products that belong to a Base Product and differ in some 
  characteristic (like color or size)
  
## Variant example

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

# Classifications

The Products can belong to Categories with a Classification System 
defined. In that case, the Product must fill the classifications defined 
in the category.
The Classification System could be used to provide a "faceted" 
navigation when the user search Products.
 
## Category example

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

## Product with Classifications example

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

# Indexing

The system uses [elasticsearch](https://www.elastic.co/products/elasticsearch) 
to index and search Products.
