/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ____Aryan Arora__________________ Student ID: ______155792203________ Date: _____3 june 2022___________
*
*  Online (Heroku) URL: _______________https://enigmatic-everglades-94412.herokuapp.com/about_________________________________________
*
*  GitHub Repository URL: _________________________________https://github.com/AroraAryan23/web322-app.git_____________________
*
********************************************************************************/ 


var express = require("express")
var app = express()
var PORT = process.env.PORT || 8080
var path = require('path');
var blogservice = require(__dirname + "/blog-service.js");

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about')
});
 app.get('/about', (req, res) => {
      res.sendFile(path.join(__dirname + "/views/about.html"));
  });

  app.get("/blog", (req, res) => {
    blogservice.getPublishedPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/posts", (req, res) => {
  blogservice.getAllPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/categories", (req, res) => {
  blogservice.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

PORT_LISTEN = () => {
  console.log('Express HTTP server is listening to the port', PORT)
}
app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

  blogservice.initialize().then(() => {
    app.listen(PORT, PORT_LISTEN());
}).catch (() => {
    console.log('PROMISE NOT KEPT! SERVER NOT STARTED ');
});