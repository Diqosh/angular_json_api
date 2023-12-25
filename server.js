const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults({ static: "./build" });
const port = process.env.PORT || 3000;

server.use(jsonServer.bodyParser)

server.post('/posts/like', (req, res) => {
    const postId = req.body.id
    const db = router.db; // Get a lowdb instance
    console.log(postId)
    let post = db.get('posts').find({ id: postId }).value();
    console.log(post)
    if (!post) {
        post = { ...req.body, id: postId, likes: 0 };
        db.get('posts').push(post).write();
    }

    const updatedPost = { ...post, likes: (post.likes || 0) + 1, id: postId };
    db.get('posts').find({ id: postId }).assign(updatedPost).write();
    res.jsonp(updatedPost);
});



server.use(middlewares);
server.use(router);
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
server.listen(port);