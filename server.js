const http = require("http");
const url = require("url");
const connectDB = require("./db");
const {ObjectId} = require("mongodb");
async function handler(req, res) {
  let parsedUrl = url.parse(req.url, true);
  //GET, POST, PATCH, PUT, DELETE
  const method = req.method;
  const db = await connectDB();
  const Post = db.collection("posts");

  //Api => RestFul, XML(Soap), GraphQL, Socket
  res.setHeader("Content-Type", "application/json");

  //read all posts from posts collection
  if (method === "GET" && parsedUrl.pathname === "/posts") {
    const posts = await Post.find().toArray();
    res.end(JSON.stringify(posts));
    return;
  }

  //create or write new post to posts collection
  if (method === "POST" && parsedUrl.pathname === "/posts/create") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const post = JSON.parse(body);
      post.createdAt = new Date();
      await Post.insertOne(post);
      console.log(post);
      res.end(JSON.stringify({message: "post created!"}));
    });
    return;
  }
  //update an exist post from posts collection
  if (method === "PUT" && parsedUrl.pathname.startsWith("/posts/")) {
    // const id = parsedUrl.pathname.split("/").pop();
    const id = parsedUrl.pathname.split("/")[2];
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const updatedPost = JSON.parse(body);
      updatedPost.updatedAt = new Date();
      await Post.updateOne({_id: new ObjectId(id)}, {$set: updatedPost});
      res.end(JSON.stringify({message: "post updated!"}));
    });
    return;
  }
  //remove an exist post from posts collection
  if (method === "DELETE" && parsedUrl.pathname.startsWith("/posts/")) {
    // const id = parsedUrl.pathname.split("/").pop();
    const id = parsedUrl.pathname.split("/")[2];
    await Post.deleteOne({_id: new ObjectId(id)});
    res.end(JSON.stringify({message: "post deleted!"}));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({error: "Not found!"}));
}

http.createServer(handler).listen(3200, () => {
  console.log("Server running at http://localhost:3200");
});
