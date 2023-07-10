const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();


//   if we create a array of const type so that donesnot mean that we cant push new items there .. 

//   basically const array provide us the apportunity that we can push items in this that why we are  writing this  ...


const contactItems = [];

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');



const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect("mongodb+srv://Admin-Areeb:fastfive@cluster0.33yn1jn.mongodb.net/ToDoListDB", { useNewUrlParser: true, useUnifiedTopology: true });


const itemsSchema = new mongoose.Schema({
    name: String
});

const items = new mongoose.model("item", itemsSchema);

const item1 = new items({
    name: "Welcome to your todolist!"
});

const item2 = new items({
    name: "hit the + button to add new items"
});

const item3 = new items({
    name: "<--Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];





// let day = date.getDate();

app.get("/", function (req, res) {

    items.find({})
        .then(result => {
            if (result == 0) {
                items.insertMany(defaultItems)
                    .then(result => {
                        console.log("successfully done items added in db");
                    })
                    .catch(err => {
                        console.log(err);
                    });
                res.redirect("/");
            } else {
                res.render("list", {
                    listItem: "today",
                    addListItems: result
                });
            };
        })
        .catch(err => {
            console.log(err);
        });
});










const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const lists = new mongoose.model("lists", listSchema);


app.get("/:customListPageName", function (req, res) {
    const listNAme = _.capitalize(req.params.customListPageName);

    lists.findOne({ name: listNAme })
        .then(result => {
            if (!result) {
                const list = new lists({
                    name: listNAme,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + listNAme);

            } else {
                res.render("list", {
                    listItem: listNAme,
                    addListItems: result.items
                });
            };
        }).catch(err => {
            console.log(err);
        });

});








// app.get("/contact" , function(req,res){
//     res.render("list" , {
//         listItem : "contact list",
//         addListItems : contactItems
//     });
// });

// app.get("/about", function(req,res){
//     res.render("about");
// });


app.post("/", function (req, res) {

    let itemName = req.body.item;
    let listName = req.body.button;

    const item = new items({
        name: itemName
    });

    if (listName === "today") {
        item.save();
        res.redirect("/");
    } else {
        lists.findOne({name:listName})
        .then(result =>{
            result.items.push(item);
            result.save();
            res.redirect("/"+listName);
        }).catch(err =>{
            console.log(err);
        });
    }

});

app.post("/delete", function (req, res) {
    const checkbox_id = req.body.checkbox;
    const listName = req.body.listName ;


    if(listName === "today"){
        items.findByIdAndRemove(checkbox_id)
        .then(result => {
            console.log("successfully in deleting items from db");
            res.redirect("/");
        })
        .catch(err => {
            console.log(err);
        });
    }else{
        lists.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkbox_id}}})
        .then(result =>{
            res.redirect("/"+listName);
        }).catch(err =>{
            console.log(err);
        });
    }
});


app.listen(3000, function () {
    console.log("server started");
}); 