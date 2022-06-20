const fs = require("fs"); 
var posts = [];
var categories = [];

exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        fs.readFile('./data/posts.json', (err,data) => {
            if (err) {
                reject ('unable to read file');
            }
            else {
                posts = JSON.parse(data);
            }
        });

        fs.readFile('./data/categories.json', (err,data)=> {
            if (err) {
                reject ('unable to read file');
            }
            else {
                categories = JSON.parse(data);
            }
        })
        resolve();
    })
};
exports.getAllPosts = () => {
    return new Promise ((resolve,reject) => {
        if (posts.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(posts);
        }
    })
};
exports.getPublishedPosts = () => {
    return new Promise ((resolve, reject) => {
        var publishPost = posts.filter(post => post.published == true);
        if (publishPost.length == 0) {
            reject('no results returned');
        }
        resolve(publishPost);
    })
};

exports.getCategories = () => {
    return new Promise((resolve,reject) => {
        if (categories.length == 0) {
            reject ('no results returned');
        }
        else {
            resolve (categories);
        }
    })
};

exports.addPost = (postData) => {
    return new Promise ((resolve,reject) => {
        if(postData.published == undefined)
            postData.published = false
        else
            postData.published = true

        postData.id = posts.length + 1
        posts.push(postData)
        resolve(postData)
    })    
};

exports.getPostsByCategory = (category) => {
    return new Promise( (resolve,reject) => {
        let filtredPosts = posts.filter( post => {
            return post.category == category
        })

        resolve(filtredPosts)
    })
}

exports.getPostsByMinDate = (minDateStr) => {
    return new Promise( (resolve,reject) => {
        let filtredPosts = posts.filter( post => {
            return (new Date(post.postDate) >= new Date(minDateStr))
        })

        resolve(filtredPosts)
    })
} 

exports.getPostById = (id) => {
    return new Promise( (resolve,reject) => {
        let filtredPost = posts.filter( post => {
            return post.id == id
        })

        if(filtredPost.length == 1)
            resolve(filtredPost[0])
        else 
            reject("no result returned")
    })
} 