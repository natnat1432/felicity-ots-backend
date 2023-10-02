const db = require("../models");
const Account = db.accounts;
const Logging = require("./logging.controller.js");
const FelicityCompetitor = db.felicitycompetitors;

// Create and Save a new Felicity Competitor
exports.create = async (req, res) => {
  const { market_name, creator_id } = req.body;
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  } else {
    const checkCompetitor = await FelicityCompetitor.findOne({
      where: { market_name: market_name },
    });
    if (checkCompetitor) {
      res
        .status(409)
        .json({ success: false, message: "Felicity already exist" });
    } else {
      // Save Competitor in the database
      formData = {
        market_name:market_name,
        createdBy:creator_id,
      }
      FelicityCompetitor.create(formData)
        .then(async (data) => {
          if (data) {
            const description = `Created felicity market competitor ${market_name}`;
            await Logging.createLoggingData(creator_id, description);
            res.json({
              success: true,
              message: "Felicity market competitor created successfully",
            });
          } else {
            res.json({
                success:false,
                message:"Error creating felicity market competitor"
            })
          }
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message ||
              "Some error occurred while creating the Felicity Competitor.",
          });
        });
    }
  }
};

// Retrieve all Felicity Competitors from the database.
exports.findAll = async (req, res) => {
  FelicityCompetitor.findAll()
    .then(async (data) => {
      var finalcompetitor = [];
      for (let competitor of data) {
        if (competitor.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(competitor.dataValues.createdBy);
          competitor.createdByEmail = sup.email;
        }
        competitor.dataValues.createdByEmail = competitor.createdByEmail;
        finalcompetitor.push(competitor);
      }
      res.send(finalcompetitor);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving superadmins",
      });
    });
};

// Find a single Competitor with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  FelicityCompetitor.findByPk(id)
    .then(async (data) => {
      if (data) {
        var competitor = data.dataValues;
        if (competitor.createdBy !== null) {
          var sup = await Account.findByPk(competitor.createdBy);
          competitor.createdByEmail = sup.email;
        }
        res.send(competitor);
      } else {
        res.status(404).send({
          message: `Cannot find Competitor with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Account with id=" + id,
      });
    });
};

// Update a Competitor by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  var updateData = req.body;
  FelicityCompetitor.update(updateData, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Felicty market competitor was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Felicity Market Competitor with id=${id}. Maybe Competitor was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Account with id=" + id,
      });
    });
};  

// Delete an Felicity market competitor with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  FelicityCompetitor.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Felicity market competitor deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Account with id=${id}. Maybe Account was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Felicity Competitor with id=" + id,
      });
    });
};

// Delete all Market Competitors from the database.
exports.deleteAll = (req, res) => {
  FelicityCompetitor.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Felicity Market Competitors were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Felicity Market Competitors.",
      });
    });
};
