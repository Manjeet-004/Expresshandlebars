/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___________Manjeet Kaur___________ Student ID: ___162114219___________ Date: ________6 November 2022________
*
*  Online (Cyclic) Link: _________________https://nice-red-agouti-cap.cyclic.app
__________________________________
*
********************************************************************************/ 
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var multer = require("multer");
var bodyParser = require("body-parser");
var app = express();
var path = require('path');
var fs = require('fs');
var exphbs = require('express-handlebars');
var dataService = require('./data-service.js');
var cloudinary = require('cloudinary').v2
var streamifier = require('streamifier')

cloudinary.config({ 
    cloud_name: 'dh9zzfsyd', 
    api_key: '763859315776413', 
    api_secret: '78a9jgOkhqA9ZJcsXTi4bENZVZk' 
  });
  app.use(express.static('public'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.engine('.hbs',exphbs({
      extname:'.hbs', 
      defaultLayout:'main',
      helpers:{
        navLink: function(url, options){
          return '<li' + 
              ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
              '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      
          equal:function(lvalue, rvalue, options){
              if(arguments.length<3)
                  throw new Error("Handlerbars Helper equal needs 2 parameters");
              if(lvalue != rvalue){
                  return options.inverse(this);
              }else{
                  return options.fn(this);
              }
          }
      }
  }));
  app.set('view engine','.hbs');
  app.use(function(req,res,next){
      let route=req.baseUrl + req.path;
      app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
      next();
  });
  
app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/index.html"))
    res.render("home");
  });

app.get('/product/add', (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/addProduct.html"))
    res.render("addProducts");
  });

  app.get('/category', (req, res) => {
    dataService.getDepartments()
        .then((data) => res.render("category", {category: data}))
        .catch(() => res.render("category", {message: "no results"}));
})

  app.get('/demos', (req, res) => {
    dataService.getDepartments()
        .then((data) => res.render("demos", {demos: data}))
        .catch(() => res.render("demos", {message: "no results"}));
})

app.get('/product', (req, res) => {
  dataService.getDepartments()
      .then((data) => res.render("product", {product: data}))
      .catch(() => res.render("product", {message: "no results"}));
})

    
  app.post("/products/add", upload.single("featureImage"), function (req, res) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
  
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
  
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
  
    upload(req).then((uploaded) => {
      req.body.featureImage = uploaded.url;
    });
  
    
    productSrv.addProduct(req.body).then(() => {
      res.redirect("/demos"); 
    });
  });
  


  app.get("/products", function (req, res) {
    productSrv
      .getPublishedProducts()
      .then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.json({ message: err });
      });
  });
  
  
  app.get("/demos", function (req, res) {
    
    if (req.query.category) {
      productSrv
        .getProductByCategory(req.query.category)
        .then(function (data) {
          res.json(data);
        })
        .catch(function (err) {
          res.json({ message: err });
        });
      
    } else if (req.query.minDateStr) {
      productSrv
        .getProductsByMinDate(req.query.minDateStr)
        .then(function (data) {
          res.json(data);
        })
        .catch(function (err) {
          res.json({ message: err });
        });
  
      
    } else {
      productSrv
        .getAllProducts()
        .then(function (data) {
          res.json(data);
        })
        .catch(function (err) {
          res.json({ message: err });
        });
    }
  });
  
  
  app.get("/categories", function (req, res) {
    productSrv
      .getCategories()
      .then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.json({ message: err });
      });
  });
  
  
  app.get('/product', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare an empty array to hold "product" objects
        let products = [];

        // if there's a "category" query, filter the returned products by the category
        if(req.query.category){
            // Obtain the published "products" by category
            products = await productData.getPublishedProductsByCategory(req.query.category);
        }else{
            // Obtain the published "products"
            products = await productData.getPublishedProducts();
        }

        // sort the published products by the postDate
        products.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest product from the front of the list (element 0)
        let product = products[0]; 

        // store the "products" and "product" data in the viewData object (to be passed to the view)
        viewData.products = products;
        viewData.product = product;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await productData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "product" view with all of the data (viewData)
    res.render("product", {data: viewData})

});

app.get('/product/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare an empty array to hold "product" objects
      let products = [];

      // if there's a "category" query, filter the returned products by the category
      if(req.query.category){
          // Obtain the published "products" by category
          products = await productData.getPublishedProductsByCategory(req.query.category);
      }else{
          // Obtain the published "products"
          products = await productData.getPublishedProducts();
      }

      // sort the published products by postDate
      products.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "products" and "product" data in the viewData object (to be passed to the view)
      viewData.products = products;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the product by "id"
      viewData.product = await productData.getProductById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await productData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "product" view with all of the data (viewData)
  res.render("product", {data: viewData})
});
  
app.use((req,res)=>{
    res.status(404).send("404 - Page Not Found")
})

productData.initialize().then(()=>{
    app.listen(HTTP_PORT, () => { 
        console.log('server listening on: ' + HTTP_PORT); 
    });
}).catch((err)=>{
    console.log(err);
})