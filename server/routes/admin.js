const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtsecret = process.env.JWT_SECRET;
const adminLayout = '../views/layouts/admin';



//Check Admin Login

const authMiddleware = (req,res,next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json ( {message: 'Unauthorized'});
    }

    try {
        const decoded = jwt.verify(token, jwtsecret);
        req.userId = decoded.userId;
        next();
    } catch(error) {
        res.status(401).json ( {message: 'Unauthorized'});

    }
}



// Get Home
router.get('/admin',async(req,res) => {
    
    try {
        const locals = {
            title: "Admin",
            description: "Simple blog created with NodeJs,express and MongoDb"
        }

        
        res.render('admin/index', {locals,layout : adminLayout});
    } catch (error) {
        console.log(error);
    }
});


//Admin -Check Login
router.post('/admin',async(req,res) => {
    
    try {
        
        const {username,password } = req.body;
        const user = await User.findOne({username});

        if(!user) {
            return res.status(401).json({message:'Invalid Credentials'});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({message:'Invalid Credentials'});

        }

        const token = jwt.sign({userId: user._id}, jwtsecret);
        res.cookie('token', token,{httpOnly: true});
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});



//Check Admin Dashboard

router.get('/dashboard',authMiddleware,async(req,res) => {

    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blog created with Nodejs, Express & MongoDb'
            }
            
            const data = await Post.find();
            res.render('admin/dashboard',{
                locals,
                data,
                layout: adminLayout
            });

        } catch(error) {
            console.log(error);
        }
    
});


// Admin - Create new post

router.get('/add-post',authMiddleware,async(req,res) => {

    try {
        const locals = {
            title: 'Add Post',
            description: 'Simple Blog created with Nodejs, Express & MongoDb'
            }
            
            const data = await Post.find();
            res.render('admin/add-post',{
                locals,
                layout: adminLayout
            });

        } catch(error) {
            console.log(error);
        }
    
});


//POST- Admin create new post

router.post('/add-post',authMiddleware,async(req,res) => {

    try {
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch(error){
            console.log(error);
        }



    //    console.log(req.body);
    //    res.redirect('/dashboard');

        } catch(error) {
            console.log(error);
        }
    
});





//Testing
// GET route to render edit form
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        const locals = {
            title: 'Edit Post',
            description: 'Simple Blog created with Nodejs, Express & MongoDb'
        };

        res.render('admin/edit-post', {
            locals,
            post,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// POST route to handle post update
router.post('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const { title, body } = req.body;
        await Post.findByIdAndUpdate(req.params.id, { title, body });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});
// DELETE route to handle post deletion
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin');
});


//Testing


// router.post('/admin',async(req,res) => {
    
//     try {
        
//         const {username,password } = req.body;

//         if(req.body.username === 'admin' && req.body.password === "password") {
//             res.send('You are loged in')
//         } else {
//             res.send('Wrong username or passsword');
//         }
//         console.log(req.body);
//         res.redirect('/admin');
//     } catch (error) {
//         console.log(error);
//     }
// });




//Admin Register

router.post('/register',async(req,res) => {
    
    try {
        
        const {username,password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({username,password:hashedPassword});
            res.status(201).json({message: 'User Created', user});
        } catch (error){
            if(error.code === 11000) {
                res.status(409).json({message: 'User already in use'});
            }
            res.status(500).json({message: 'Internal server error'});
        }
        
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;