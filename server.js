/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aryan Arora        Student ID: ___155792203_________ Date: ______12 Aug 2022________
*
*  Heroku App URL: _______https://infinite-lowlands-62862.herokuapp.com/________
* 
*  GitHub Repository URL: _______https://github.com/AroraAryan23/web322-app.git____
*
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const blogData = require("./blog-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const path = require("path");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const clientSessions = require("client-sessions");
const authData = require("./auth-service");
const app = express();
const upload = multer();
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.set("view engine", "hbs");

app.use(express.static("public"));

cloudinary.config({
    cloud_name: 'de2ln9dvc',
    api_key: '843685913684167',
    api_secret: 'Y9C5K6DEKaZJD2kzzmNER5YIkN8',
    secure: true
});

app.use(
    clientSessions({
        cookieName: "session",
        secret: "week10example_web322",
        duration: 2 * 60 * 1000,
        activeDuration: 1000 * 60,
    })
);

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}
app.engine(
    "hbs",
    exphbs.engine({
        defaultLayout: "main",
        extname: ".hbs",
        helpers: {
            navLink: function (url, options) {
                return (
                    "<li" +
                    (url == app.locals.activeRoute ? ' class="active" ' : "") +
                    '><a href="' +
                    url +
                    '">' +
                    options.fn(this) +
                    "</a></li>"
                );
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
                return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            },
        },
    })
);

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute =
        "/" +
        (isNaN(route.split("/")[1])
            ? route.replace(/\/(?!.*)/, "")
            : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/blog", async (req, res) => {
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
        viewData.categoriesMessage = "no results";
    }
    res.render("blog", { data: viewData });
});

app.get("/blog/:id", async (req, res) => {
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
        viewData.categoriesMessage = "no results";
    }
    res.render("blog", { data: viewData });
});

app.get("/posts", ensureLogin, (req, res) => {
    let queryPromise = null;

    if (req.query.category) {
        queryPromise = blogData.getPostsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = blogData.getPostsByMinDate(req.query.minDate);
    } else {
        queryPromise = blogData.getAllPosts();
    }

    queryPromise
        .then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results" });
            }
        })
        .catch((err) => {
            res.render("posts", { message: "no results" });
        });
});

app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {
    if (req.file) {
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
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;

        blogData
            .addPost(req.body)
            .then((post) => {
                res.redirect("/posts");
            })
            .catch((err) => {
                res.status(500).send(err);
            });
    }
});

app.get("/posts/add", ensureLogin, (req, res) => {
    blogData
        .getCategories()
        .then((categories) => {
            res.render("addPost", { categories: data });
        })
        .catch(() => {
            res.render("addPost", { categories: [] });
        });
});

app.get("/post/:id", ensureLogin, (req, res) => {
    blogData
        .getPostById(req.params.id)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

app.get("/categories", ensureLogin, (req, res) => {
    blogData
        .getCategories()
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", { categories: data });
            } else {
                res.render("categories", { message: "no results" });
            }
        })
        .catch((err) => {
            res.render("categories", { message: "no results" });
        });
});

app.get("/categories/add", ensureLogin, function (req, res) {
    res.render("addCategory");
});

app.post("/categories/add", ensureLogin, function (req, res) {
    blogData
        .addCategory(req.body)
        .then((post) => {
            res.redirect("/categories");
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

app.get("/categories/delete/:id", ensureLogin, function (req, res) {
    blogData
        .deleteCategoryById(req.params.id)
        .then(() => {
            res.redirect("/categories");
        })
        .catch(() => {
            res.status(500).send("Cannot remove category");
        });
});

app.get("/posts/delete/:id", ensureLogin, function (req, res) {
    blogData
        .deletePostById(req.params.id)
        .then(() => {
            res.redirect("/posts");
        })
        .catch(() => {
            res.status(500).send("Cannot remove post");
        });
});


app.get('/login', function (req, res) {
    res.render('login');
})

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    authData.registerUser(req.body).then((success) => {
        res.render("register", { successMessage: "User created" });
    }).
        catch((error) => {
            res.render("register", {
                errorMessage: error,
                userName: req.body.userName,
            });
        })
});

app.post('/login', function (req, res) {
    req.body.userAgent = req.get("User-Agent");
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }

        res.redirect('/posts');
    }).catch((error) => {
        res.render('login', { errorMessage: error, userName: req.body.userName })
    })
});

app.get('/logout', ensureLogin, function (req, res) {
    req.session.reset();
    res.redirect("/login");
})

app.get('/userHistory', ensureLogin, function (req, res) {
    res.render('userHistory');
})

app.use((req, res) => {
    res.status(404).render("404");
});

blogData
    .initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("server listening on: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.log(err);
    });
