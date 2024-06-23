const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// Routes
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple blog created with NodeJs, Express & MongoDb."
        };

        let perPage = 3;
        let page = parseInt(req.query.page) || 1;

        const data = await Post.aggregate([{$sort: {createdAt: -1 }}])
            .skip(perPage * (page - 1))
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments();
        const nextPage = page + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null
        });

    } catch (error) {
        console.log(error);
    }
});

// Get Post ID
router.get('/post/:id', async (req, res) => {
    let slug = req.params.id;

    try {
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "Simple blog created with Nodejs, Express and Mongo Db."
        };
        res.render('post', { locals, data });
    } catch (error) {
        console.log(error);
    }
});

// Post Search Term
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple blog created with Node Js, express and MongoDb"
        };

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });

        res.render("search", {
            data,
            locals
        });

    } catch (error) {
        console.log(error);
    }
});

router.get('/about', (req, res) => {
    res.render('about');
});

module.exports = router;
