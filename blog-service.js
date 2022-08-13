const fs = require("fs");
var posts = [];
var categories = [];
const { resolve } = require("path");

exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', (err, data) => {
            if (err) {
                reject('unable to read file');
            }
            else {
                posts = JSON.parse(data);
            }
        });

        fs.readFile('./data/categories.json', (err, data) => {
            if (err) {
                reject('unable to read file');
            }
            else {
                categories = JSON.parse(data);
            }
        })
        resolve();
    })
};
exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(posts);
        }
    })
};
exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        var publishedPost = posts.filter(post => post.published == true);
        if (publishedPost.length == 0) {
            reject('no results returned');
        }
        resolve(publishedPost);
    })
};
exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(categories);
        }
    })
};

exports.addPost = (postData) => {
    postData.published == undefined ? postData.published = false : postData.published = true;
    postData.id = posts.length + 1;
    var today = new Date();
    postData.postDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    posts.push(postData);
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(posts);
        }
    })
}

exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        var post_Category = posts.filter(post => post.category == category);
        if (post_Category.length == 0) {
            reject('no results returned');
        }
        resolve(post_Category);
    })
}

exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        var post_Date = posts.filter(post => post.postDate >= minDateStr)

        if (post_Date.length == 0) {
            reject('no results returned');
        }
        resolve(post_Date)
    })
}

exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].id == id) {
                resolve(posts[i])
            }
        }
        reject('no results returned')
    })
}

exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        var publishedPost = posts.filter(post => post.published == true && post.category == category);
        if (publishedPost.length == 0) {
            reject('no results returned');
        }
        resolve(publishedPost);
    })
};