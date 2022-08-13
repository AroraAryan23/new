const Sequelize = require('sequelize')
var sequelize = new Sequelize('ddnk3hrapfvc2p', 'hcwvakwnzwbtce', '5aaf837b81d44a1c4b9f979379e91482f8d52a6d97defebd52d953e262ac41b6', {
    host: 'ec2-34-193-44-192.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define("post", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define("category", {
    category: Sequelize.STRING
})
Post.belongsTo(Category, { foreignKey: 'category', as: 'Category' });
//Post.belongsTo(Category, {foreignKey: 'category'})

exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(resolve('Success! database synced! '))
            .catch(reject('unable to sync the database'));
    })
}

exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll()
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject("no results returned")
            })
    })
}

exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        })
            .then(data => {
                resolve(data)
            })
            .catch('no results returned')
    })
}

exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject("no results returned")
            })
    })
}

exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (const i in postData) {
            if (i == "") {
                i = null
            }
        }
        postData.postDate = new Date()

        Post.create(postData)
            .then(resolve(Post.findAll()))
            .catch(reject('unable to create post'))
    });
}

exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        })
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject("no results returned")
            })

    })
}

exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject("no results returned")
            });
    })
}

exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        })
            .then(data => {
                resolve(data[0])
            })
            .catch(err => {
                reject("no results returned")
            });
    })

}

exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        })
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject("no results returned")
            })
    })
}

exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (var i in categoryData) {
            if (categoryData[i] == "") { categoryData[i] = null; }
        }
        Category.create(categoryData)
            .then(resolve(Category.findAll()))
            .catch(reject('unable to create category'))
    })
};

exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
            .then(resolve())
            .catch(reject('unable to delete'))
    })
}

exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
            .then(resolve())
            .catch(reject('unable to delete'))
    })
}
