import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;
const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATA_BASE,
  password: process.env.DB_PASSWORD,
  port: 5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

async function addItems(){
  items = []
  const data = await db.query("SELECT * FROM items ORDER BY id ASC");
  data.rows.forEach((item) => {
    items.push(item);
  });
}
await addItems();
app.get("/", async (req, res) => {
  try{
    console.log(items);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
}
catch(error){
  console.error(`Помилка БД ${error}`)
}
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items (title) VALUES ($1)" ,[item]);
  await addItems();
  //items.push({ title: item });
  res.redirect("/");
});

app.post("/edit", async  (req, res) => {
  try{
  const item = req.body.updatedItemTitle ; 
  const id = req.body.updatedItemId;
  await db.query("UPDATE items SET title = $1 WHERE id = $2" , [item , id]);
  await addItems();
  res.redirect("/");
  }
  catch(error){
    console.error(`Помилка БД ${error}`)
  }
});

app.post("/delete", async (req, res) => {
  try{
    const deleteId = req.body.deleteItemId;
    await db.query("DELETE FROM items WHERE id = $1 ;" , [deleteId]);
    await addItems();
    res.redirect("/");
  }
  catch(error){
    console.error(`Помилка БД ${error}`)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
