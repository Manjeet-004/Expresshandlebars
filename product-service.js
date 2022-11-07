const fs = require("fs");

let products = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/products.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                products = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllProducts = function(){
    return new Promise((resolve,reject)=>{
        (products.length > 0 ) ? resolve(products) : reject("no results returned"); 
    });
}

module.exports.getPublishedProducts = function(){
    return new Promise((resolve,reject)=>{
        (products.length > 0) ? resolve(products.filter(product => product.published)) : reject("no results returned");
    });
}

module.exports.getProductsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let filteredproducts = products.filter(product=>product.category == category);

        if(filteredproducts.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredproducts);
        }
    });
}

module.exports.getProductsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredproducts = products.filter(product => (new Date(product.postDate)) >= (new Date(minDateStr)))

        if (filteredproducts.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredproducts);
        }
    });
}

module.exports.getProductById = function(id){
    return new Promise((resolve,reject)=>{
        let foundproduct = products.find(product => product.id == id);

        if(foundproduct){
            resolve(foundproduct);
        }else{
            reject("no result returned");
        }
    });
}

module.exports.addProduct = function(productData){
    return new Promise((resolve,reject)=>{
        console.log('before, productData.published',productData.published)
        productData.published = productData.published ? true : false;
        console.log('after, productData.published',productData.published)
        
        productData.id = products.length + 1;
        console.log('productData.id',productData.id)
        products.push(productData);
        resolve();
    });
}


module.exports.getPublishedProductsByCategory = function(){
  return new Promise((resolve,reject)=>{
    let productpublished = products.find(category => products.category == category);

    if(productpublished == 0){
        resolve(productpublished);
    }else{
        reject("no result returned");
    }
});
}

module.exports.getProductdataByCategory = function(){
  return new Promise((resolve,reject)=>{
    let productdata = products.find(product => products.data == data);

    if(productData == 0){
        resolve(productdata);
    }else{
        reject("no result returned");
    }
});
}