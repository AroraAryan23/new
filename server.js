/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aryan Arora        Student ID: ___155792203_________ Date: ______July 24 2022________
*
*  Heroku App URL: _______https://ancient-retreat-78280.herokuapp.com/blog________
* 
*  GitHub Repository URL: _______https://github.com/AroraAryan23/web322-app.git____
*
********************************************************************************/ 






var express = require("express")
var app = express()
var PORT = process.env.PORT || 8080
var path = require('path')
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var blogservice = require(__dirname + "/blog-service.js");
const blogData = require("./blog-service");
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const upload = multer();

cloudinary.config({
    cloud_name: 'de2ln9dvc',
    api_key: '843685913684167',
    api_secret: 'Y9C5K6DEKaZJD2kzzmNER5YIkN8',
    secure: true
});

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));

app.set('view engine', '.hbs');
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


app.get('/', (req, res) => {
    res.redirect('/blog')
});

app.get('/about', (req, res) => {
    res.render(path.join(__dirname + "/views/about.hbs"));
});

app.get('/blog', async (req, res) => {
    let viewData = {};

    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0];
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", { data: viewData })

});

app.get('/blog/:id', async (req, res) => {
    let viewData = {};

    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }

        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.post = await blogData.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();

        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", { data: viewData })
});

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blogservice.getPostsByCategory(req.query.category)
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", { posts: data })
                }
                else {
                    res.render("posts", { message: "no results" })
                }
            })
            .catch((err) => {
                res.render("posts", { message: "no results" });
            })
    }
    else if (req.query.minDate) {
        blogservice.getPostsByMinDate(req.query.minDate)
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", { posts: data })
                }
                else {
                    res.render("posts", { message: "no results" })
                }
            })
            .catch((err) => {
                res.render("posts", { message: "no results" });
            })
    }
    else {
        blogservice.getAllPosts()
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", { posts: data })
                }
                else {
                    res.render("posts", { message: "no results" })
                }
            })
            .catch((err) => {
                res.render("posts", { message: "no results" });
            })
    }
});

app.get('/post/:value', (req, res) => {
    blogservice.getPostById(req.params.value).then((data) => {
        res.json({ data });
    }).catch((err) => {
        res.json({ message: err });
    })
})

app.get('/posts/add', (req, res) => {
    blogservice.getCategories()
        .then(data => res.render("addPost", { categories: data }))
        .catch(err => res.render("addPost", { categories: [] }))
})



app.post("/posts/add", upload.single("featureImage"), (req, res) => {
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
        console.log(result);
        return result;
    }
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        blogservice.addPost(req.body).then(() => {
            res.redirect("/posts");
        })
    })
})


app.get("/categories", (req, res) => {
    blogservice.getCategories().then((data) => {
        res.render("categories", { categories: data });
    }).catch((err) => {
        res.render("categories", { message: "no results" });
    })
})


app.get("/categories/add", (req, res) => {
    res.render("addCategory");
});

app.post("/categories/add", (req, res) => {
    blogservice.addCategory(req.body).then((data) => {
        res.redirect("/categories");
    })
})
app.get('/categories/delete/:id', (req, res) => {
    blogservice.deleteCategoryById(req.params.id)
        .then(res.redirect("/categories"))
        .catch(err => res.status(500).send("Unable to Remove Category / Category not found"))
});


app.get('/post/delete/:id', (req, res) => {
    blogservice.deletePostById(req.params.id)
        .then(res.redirect("/posts"))
        .catch(err => res.status(500).send("Unable to Remove POST / Post not found"))
});

app.use(express.static('public'));

app.use((req, res) => {
    res.status(404).render("404")
});

blogservice.initialize().then(() => {
    app.listen(PORT, PORT_LISTEN());
}).catch(() => {
    console.log('PROMISE NOT KEPT! SERVER NOT STARTED ');
});

PORT_LISTEN = () => {
    console.log('Express HTTP server is listening to the port', PORT)
}