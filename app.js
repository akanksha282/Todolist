//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://priya:Test123@cluster0.8bbrqgq.mongodb.net/todolistDB", {useNewUrlParser: true});
const itemsSchema={
  name: String
}

const Item = mongoose.model("Item",itemsSchema)

const item1 =new Item({
  name:"welcome to mt todolist"
});

const item2 =new Item({
  name:"Hit to add new item"
});
const item3 =new Item({
  name:"hit to delete"
});

const defaultItems=[item1,item2,item3];

//  to create new schema for route or new route be created on srver site
const listSchema ={
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema)
// Item.insertMany(defaultItems) .then(function (){
//   console.log("Successfully saved default items to DB!");
// })
// .catch(function (err) {
//   console.log(err);
// });


app.get("/",function(req,res)
{
  Item.find({}).then(function(foundItems){
    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems).then(function()
      {
        console.log("Added");
       
      }).catch(function(err)
      {
        console.log(err);
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  }).catch(function(err)
  {
    console.log(err);
  });
});


// create dynamic route using express route parameter
app.get("/:customerListName",function(req,res)
{
  const customerListName = _.capitalize(req.params.customerListName);
// we have check whether theif a list with that name input alredy exit or not if it dose we have to simply display it otherwise input it
// findone function bty mongoose to check whether it exit or not
List.findOne({name:customerListName})
.then(function(foundList)
{
  if(!foundList)
  {
    // Create a new list
    const list =new List({
      name:customerListName,
      items:defaultItems
    })
    list.save();

            res.redirect("/"+customerListName);

  }
  else
  {
    //  showing existing list
    res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
  }
})
.catch(function(err){
  console.log(err);
})
  
})

 
// app.get("/", function(req, res) {

//   Item.find({}).then(function(foundItems)
//   {
   
//   //   res.render("list", {listTitle: "Today", newListItems: foundItems});
//   // }).catch(function(err){
//   //   console.log(err);
//   console.log(foundItems)
//   })


 

// });

// while adding new items it crash
// app.post("/", function(req, res){

//   const item = req.body.newItem;

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });
app.post("/",function(req,res)
{
  const itemName =req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName==="Today")
  {
// it save the item into item collection
  item.save(); 
   res.redirect("/");
  }
  else{
    // comes from custom list
    List.findOne({name:listName})
    .then(function(foundList)
    {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" +listName);
    }).catch(function(err)
    {
      console.log(err);
    })
  }
  

});

app.post("/delete",function(req,res)
{
  const checkedItemId=(req.body.checkbox)
  const listName=req.body.listName;
// check from where we are deleting fromcustom or default
 if(listName==="Today")
 {
  Item.findByIdAndRemove(checkedItemId)
  .then(function(err)
  {
    console.log("Successfully deleted");
    res.redirect("/");
  }).catch(function(err)
  {
    console.log(err);
  });
 }
 else{
      List.findOneAndUpdate({name:listName},{$pull:  {items: {_id: checkedItemId}}},{
        new:true
      }).then(function(foundlist)
      {
        res.redirect("/" +listName)
      }).catch(function(err)
{
  console.log(err);
}) }
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
