express = require("express");
app = express();
bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/ToDoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Type and click on button to add to the list."
});
const item2 = new Item({
  name: "<------ Click to Delete items."
});
const defaultItems = [item1, item2];


app.listen(3000, function() {
  console.log("Server up on port 3000.");
});

var options = {
  weekday: "long",
  day: "numeric",
  month: "long"
};

var today = new Date();
var currentDay = today.getDay();
var day = today.toLocaleDateString("en-US", options);

const _ = require("lodash");
app.get("/", function(req, res) {
  Item.find({}, function(err, found) {
    if (found.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("Oops");
        } else {
          console.log("Added items.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {kindOfDay:"Today", newItems: found});
    }
  });
});

app.get("/:topic", function(req,res){
  const topicName = _.capitalize(req.params.topic);
  List.findOne({name: topicName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: topicName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+topicName);
      }
      else{
        res.render("list", {kindOfDay: foundList.name, newItems: foundList.items})
      }
    }
  });



})

app.post("/delete", function(req, res) {
  const listName = req.body.listName;
  const item = req.body.checkbox;

  if(listName=="Today"){
    Item.findByIdAndRemove(item, function(err) {
      if (err)
        console.log(err);
      else {
        console.log("Done");
      }
      res.redirect("/")
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: req.body.checkbox}}}, function(err, foundList){
      if(!err)
        res.redirect("/"+listName);
    })
  }

})


app.post("/", function(req, res) {
  let itemName = req.body.newItem;
  let listName = req.body.button;
  const item = new Item({
    name: itemName
  })
  if(listName=="Today"){
    item.save();
    res.redirect("/");
  }else{
      List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+foundList.name);
    })
  }


})
