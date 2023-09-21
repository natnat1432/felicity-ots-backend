const db = require("../models");
const Logging = db.loggings;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");

exports.createLoggingData = async (userID, description) => {
  const logging = {
    description: description,
    account_id: userID,
  };
 Logging.create(logging).then(
  (data) => {
    return data
  },
  (err) => {
    console.log(err)
  }
);
};
exports.createLogging = (req, res) => {
  const { creator_id, description } = req.body;
  const logging = {
    description: description,
    account_id: creator_id,
  };
  Logging.create(logging).then(
    (data) => {
      res.send(data);
    },
    (err) => {
      res.status(404).send({ message: `Error creating logging` });
    }
  );
};
exports.findAllAccount = (req, res) => {
  const id = req.params.account_id;
  if (!id) {
    res.status(404).send({ message: `account_id not defined` });
  } else {
    Logging.findAll({ where: { account_id: id } })
      .then((data) => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Logging with id=${id}.`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error retrieving Account with id=" + id,
        });
      });
  }
};
