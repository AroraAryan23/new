/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ____Aryan Arora__________________ Student ID: ______155792203________ Date: _____20 june 2022___________
*
*  Online (Heroku) URL: ________________________________________________________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 


var express = require("express")
var app = express()
var PORT = process.env.PORT || 8080
var path = require('path');
var blogservice = require(__dirname + "/blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: 'de2ln9dvc',
  api_key: '843685913684167',
  api_secret: 'Y9C5K6DEKaZJD2kzzmNER5YIkN8',
  secure: true
});

const multerUpload = multer()

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about')
});

app.get('/about', (req, res) => {
      res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/blog", (req, res) => {
    blogservice.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/posts", (req, res) => {
    if(req.query.category != undefined) {
        blogservice.getPostsByCategory(req.query.category) 
        .then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({message: err});
        })        
    } else if(req.query.mindate != undefined) {
        blogservice.getPostsByMinDate(req.query.mindate) 
        .then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({message: err});
        })
    } else {
        blogservice.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({message: err});
        })
    }
});

app.get("/categories", (req, res) => {
  blogservice.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })
});

app.post("/register-user", multerUpload.single("featureImage"), (req, res) => {    
    res.send("register")
});
  
app.get('/posts/add', (req,res) => {
    res.sendFile(path.join(__dirname + '/views/addPost.html'));
}) 

app.post('/posts/add',multerUpload.single("featureImage"), (req,res) => {
    if(req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl){
        req.body.featureImage = imageUrl;

        blogservice.addPost(req.body)
        .then(() => {
            res.redirect('/posts')
        })
    } 
});

app.get("/posts/:id", (req,res) => {
    blogservice.getPostById(req.params.id) 
    .then(data => {
        res.json(data)
    }).catch( err => {
        res.json({ message: err })
    })
})

PORT_LISTEN = () => {
  console.log('Express HTTP server is listening to the port', PORT)
}

app.use((req, res) => {
    res.status(404).send("Page error");
});

 blogservice.initialize().then(() => {
    app.listen(PORT, PORT_LISTEN());
}).catch (() => {
    console.log('PROMISE NOT KEPT! SERVER NOT STARTED');
});