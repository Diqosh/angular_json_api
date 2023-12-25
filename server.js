const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults({static: "./build"});
const port = process.env.PORT || 3000;

server.use(jsonServer.bodyParser)

function getDb(req, res, next) {
    req.db = router.db; // Get a lowdb instance
    next();
}

server.post('/posts/like', (req, res) => {
    const postId = req.body.id;
    if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
    }

    const db = router.db; // Get a lowdb instance

    let post = db.get('posts').find({ id: postId }).value();

    if (!post) {
        // Post doesn't exist, create a new one with 1 like
        post = { ...req.body, id: postId, likes: 1 };
        db.get('posts').push(post).write();
    } else {
        // Post exists, update the likes
        post.likes = (post.likes || 0) + 1;
        db.get('posts').find({ id: postId }).assign(post).write();
    }

    res.jsonp(post);
});

server.post('/posts/unlike', (req, res) => {
    const postId = req.body.id;
    if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
    }

    const db = router.db; // Get a lowdb instance

    let post = db.get('posts').find({ id: postId }).value();
    console.log(post)
    if (!post) {
        // Post doesn't exist, create a new one with 1 like
        post = { ...req.body, id: postId, likes: 0 };
        db.get('posts').push(post).write();
    } else {
        // Post exists, update the likes
        post.likes = (post.likes || 0) - 1;
        db.get('posts').find({ id: postId }).assign(post).write();
    }

    res.jsonp(post);
});

// server.post('/posts', getDb, (req, res) => {
//     const post = req.body;
//     // if (!post.title) {
//     //     return res.status(400).json({error: 'Post title is required'});
//     // }
//
//     try {
//         const posts = req.db.get('posts');
//         const inserted = posts.insert(post).write();
//         res.jsonp(inserted);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({error: 'Internal server error'});
//     }
// });

server.delete('/comments/:id', getDb, (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        return res.status(400).json({error: 'Invalid comment ID'});
    }

    try {
        const deleted = req.db.get('comments').remove({id: commentId}).write();

        if (!deleted.length) {
            return res.status(404).json({error: 'Comment not found'});
        }

        res.json({id: commentId});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
});


server.use(middlewares);
server.use(router);
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
server.listen(port);