let express = require("express");
let foodsRouter = express.Router();
let foodFromList = require("../models/foodFromList");
let User = require("../models/user");
let mongoose = require("mongoose");
// /api/foods

// GET /api/foods?searchTerm=butter
foodsRouter.get("/", function(req, res, next) {
  console.log("get api foods" + req.params);
  let searchTerm = req.query.searchTerm;
  // postman: testbeispiel localhost:5555/api/foods?searchTerm=olive_oil
  foodFromList
    .find({ name: { $regex: new RegExp(`^${searchTerm}`, "i") } })
    .populate("User")
    .then(response => {
      res.json(response);
      console.log("response from foodFromList", response);
    });
});

// POST /api/foods = user added auf profil
foodsRouter.post("/", (req, res, next) => {
  console.log("food POST is here");
  User.findByIdAndUpdate(
    { _id: req.user.id },
    { $set: { addedFooditems: req.body.addedFooditems } },
    { new: true }
  )
    .populate("addedFooditems")
    .then(userObj => {
      console.log("response from api/foods", userObj.addedFooditems);
      res.json(userObj.addedFooditems);
    });
});

// POST /api/foods/user-list = user added auf profil
foodsRouter.get("/user-list", (req, res, next) => {
  User.findById(req.user.id)
    .populate("addedFooditems")
    .then(userObj => {
      res.json(userObj.addedFooditems);
    });
});

// // POST /api/foods = user added auf profil
// foodsRouter.post("/", (req, res, next) => {
//   console.log("food POST is here");
//   User.findByIdAndUpdate(
//     { _id: req.user.id },
//     { $push: { addedFooditems: req.body.id } },
//     { new: true }
//   )
//     .populate("addedFooditems")
//     .then(userObj => {
//       console.log("response from api/foods", userObj.addedFooditems);
//       res.json(userObj.addedFooditems);
//     });
// });

// POST /api/foods  neues produkt
foodsRouter.post("/add-to-list", (req, res, next) => {
  console.log("REQUEST:", req);
  foodFromList.count({ name: req.body.name }).then(count => {
    if (count > 0) {
      res.json({ message: "food item already exists" });
      return;
    } else {
      foodFromList
        .create({
          name: req.body.name,
          emission: req.body.emission,
          group: req.body.group
        })
        .then(newFoodFromList => {
          console.log("newFoodFromList", newFoodFromList);
          res.json(newFoodFromList);
        })

        .catch(err => {
          res.json(err);
        });
    }
  });
});

// // // delete food for later /api/foods/id
// foodsRouter.delete("/delete/:id", (req, res, next) => {
//   console.log("food POST delete on its way " + req.params.id);

//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     res.status(400).json({ message: "Specified id is not valid" });
//     return;
//   }

//   User.findByIdAndUpdate(
//     { _id: req.user.id },
//     { $pull: { addedFooditems: req.params.id } },
//     { new: true }
//   )
//     .populate("addedFooditems")
//     .then(userObj => {
//       console.log("response from api/foods", userObj.addedFooditems);
//       res.json(userObj.addedFooditems);
//     });
// });
//   console.log("food POST delete on its way");
//   if (id.match(/^[0-9a-fA-F]{24}$/)) {
//     foodFromList
//       .findByIdAndRemove({ _id: req.params.id })
//       .catch(err => next(err));
//   }
// });
module.exports = foodsRouter;
