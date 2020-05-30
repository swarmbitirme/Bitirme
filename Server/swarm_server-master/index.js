var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  pingTimeout: 0,
  pingInterval: 500,
  origins: "*:*",
});
var { db } = require("./firebaseConfig");
const { types, typeKeys } = require("./transactionTypeHelper");
const port = 5000;

app.get("/", function (req, res) {
  res.end();
});

io.on("connection", function (socket) {
  socket.on("joinGroup", (groupID) => {
    socket.join(groupID);
  });
  console.log("a user connected");

  socket.on("disconnect", function () {
    console.log("disconnect");
    socket.disconnect();
  });

  socket.on("completed", (obj) => {
    //TODO: handle completing
    //TODO: send completed signal to ui, remove spinner

    db.collection("Duties")
      .doc(obj.id)
      .get()
      .then((doc) => {
        doc.ref.update({ isCompleted: true });
        db.collection("Locations")
          .where("Location", "==", obj.location)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              doc.ref.update({ OnDuty: false });
            });
          });
        db.collection("Cars")
          .where("id", "in", doc.data().Cars)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              //help eden araç silinöyior
              doc.ref.update({ OnDuty: false });
            });
          })
          .then(() => {
            const newTransaction = {
              DutyId: obj.id,
              Cars: doc.data().Cars,
              Created_At: new Date(),
              Location: obj.location,
              Type: typeKeys.Completed,
              Description: types[typeKeys.Completed],
            };
            db.collection("DutyTransactions")
              .add(newTransaction)
              .then(() => {
                socket.emit("progress", {
                  Location: obj.location,
                  OnDuty: false,
                });
              });
          });
      });
  });

  socket.on("help", (obj) => {
    let cars = [];
    db.collection("Cars")
      .where("OnDuty", "==", false)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          cars.push({ ref: doc.ref, ...doc.data() });
          cars.sort((a, b) => a.id - b.id);
        });
      })
      .then(() => {
        //TODO: error and null handling
        //update car
        cars[0].ref.update({ OnDuty: true }).then(() => {
          db.collection("Duties")
            .doc(obj.id)
            .get()
            .then((doc) => {
              doc.ref
                .update({ Cars: [...doc.data().Cars, cars[0].id] })
                .then(() => {
                  const newTransaction = {
                    DutyId: obj.id,
                    Cars: [...doc.data().Cars, cars[0].id],
                    Created_At: new Date(),
                    Location: doc.data().Location,
                    Type: typeKeys.Helped,
                    Description: types[typeKeys.Helped],
                  };
                  db.collection("DutyTransactions")
                    .add(newTransaction)
                    .then(() => {
                      socket.broadcast.to(cars[0].id).emit("helped", {
                        id: doc.id,
                        location: obj.location,
                        car: doc.data().Cars,
                      });
                    });
                });
            });
        });
      });
  });

  socket.on("order", (obj) => {
    let cars = [];
    db.collection("Cars")
      .where("OnDuty", "==", false)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          cars.push({ ref: doc.ref, ...doc.data() });
          cars.sort((a, b) => a.id - b.id);
        });
      })
      .then(() => {
        if (!!cars[0]) {
          //update car
          cars[0].ref.update({ OnDuty: true }).then(() => {
            //add duty
            const newDuty = {
              Cars: [cars[0].id],
              Created_At: new Date(),
              Location: obj.Location,
              isCompleted: false,
            };
            db.collection("Duties")
              .add(newDuty)
              .then((doc) => {
                //add dutyTransaction "started"
                const newTransaction = {
                  DutyId: doc.id,
                  Cars: [cars[0].id],
                  Created_At: new Date(),
                  Location: obj.Location,
                  Type: typeKeys.Started,
                  Description: types[typeKeys.Started],
                };
                db.collection("DutyTransactions")
                  .add(newTransaction)
                  .then(() => {
                    db.collection("Locations")
                      .where("Location", "==", obj.Location)
                      .get()
                      .then((querySnapshot) => {
                        let loc = {};
                        querySnapshot.forEach((doc) => {
                          loc = doc;
                        });
                        loc.ref.update({ OnDuty: true }).then(() => {
                          socket.emit("progress", {
                            Location: obj.Location,
                            OnDuty: true,
                          });
                          socket.broadcast.to(cars[0].id).emit("ordered", {
                            id: doc.id,
                            location: obj.Location,
                          });
                        });
                      });
                  });
              });
          });
        } else {
          socket.emit("alert", "There is not any available car");
        }
      });
  });
});

http.listen(process.env.PORT || port, function () {
  console.log("listening on *****");
});
