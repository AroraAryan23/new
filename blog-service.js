const Sequelize = require('sequelize')
var sequelize = new Sequelize('df5rek9oplodm3', 'nbxfopilpptswd', 'f2208c990264115aedda17586a2a1198f8b6c731956e74a11ba787452db4ae52', {
    host: 'ec2-3-223-242-224.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize
    .authenticate()
    .then(function () {
        console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve('operation completed successfully');
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll().then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

const { gte } = Sequelize.Op;

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;

        for (const key in postData) {
            if (Object.hasOwnProperty.call(postData, key)) {
                const value = postData[key];
                if (value === "") {
                    postData[key] = null;
                }
            }
        }

        postData.postDate = new Date();

        Post.create().then(() => {
            resolve('operation completed successfully');
        }).catch(() => {
            reject("cannot creaate post");
        });
    });
}

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
        if (categoryData.category === "") {
            categoryData.category
        }

        Category.create().then(() => {
            resolve('operation completed successfully');
        }).catch(() => {
            reject("cannot create category");
        });
    });
}

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("category removed");
        }).catch(() => {
            reject("cannot delete category");
        });
    });
}

module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("post removed");
        }).catch(() => {
            reject("cannot delete post");
        });
    });
}