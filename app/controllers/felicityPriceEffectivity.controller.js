const db = require("../models");
const Account = db.accounts;
const Logging = require("./logging.controller.js");
const FelicityPriceEffectivity = db.felicitypriceeffectivity;
const FelicityPriceEffectivityLogging = db.felicitypriceeffectivityloggings;
const FelicityPriceList = require("./felicityPricelist.controller.js")

// Create and Save a new Felicity Price Effectivity
exports.create = async (req, res) => {
  const { start_effectivity_date, end_effectivity_date, creator_id } = req.body;
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  } else {
    const checkExisting = await FelicityPriceEffectivity.findOne({
      where: { start_effectivity_date: start_effectivity_date, end_effectivity_date:end_effectivity_date},
    });
    if (checkExisting) {
      res
        .status(409)
        .json({ success: false, message: "Price effectivity range already exist" });
    } else {
  
      // Save Price Effectivity in the database
      formData = {
        start_effectivity_date:start_effectivity_date,
        end_effectivity_date:end_effectivity_date,
        createdBy:creator_id,
      }
      FelicityPriceEffectivity.create(formData)
        .then(async (data) => {
          if (data) {
            const description = `Created felicity price effectivity range from "${start_effectivity_date}" to "${end_effectivity_date}"`;
            const formLog = {
              logging_type:'Create',
              description:null,
              price_effectivity_id:data.id,
              createdBy:creator_id
            }
            await FelicityPriceEffectivityLogging.create(formLog)
            await Logging.createLoggingData(creator_id, description);
            await FelicityPriceList.createAllProducts(data.id,creator_id);
            
            res.json({
              success: true,
              message: "Felicity price effectivity range created",
            });
          } else {
            res.json({
                success:false,
                message:"Error creating felicity price effectivity range"
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

// Retrieve all Felicity Price Range from the database.
exports.findAll = async (req, res) => {
  FelicityPriceEffectivity.findAll()
    .then(async (data) => {
      var finalpriceeffectivity = [];
      for (let priceeffectivity of data) {
        if (priceeffectivity.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(priceeffectivity.dataValues.createdBy);
          priceeffectivity.createdByEmail = sup.email;
        }
        priceeffectivity.dataValues.createdByEmail = priceeffectivity.createdByEmail;
        finalpriceeffectivity.push(priceeffectivity);
      }
      res.send(finalpriceeffectivity);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving superadmins",
      });
    });
};

// Find a single Price Effectivity range with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  FelicityPriceEffectivity.findByPk(id)
    .then(async (data) => {
      if (data) {
        var priceeffectivity = data.dataValues;
        if (priceeffectivity.createdBy !== null) {
          var sup = await Account.findByPk(priceeffectivity.createdBy);
          priceeffectivity.createdByEmail = sup.email;
        }
        res.send(priceeffectivity);
      } else {
        res.status(404).send({
          message: `Cannot find Price effectivity range with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Account with id=" + id,
      });
    });
};

// Update a Price Effectivity Range by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  var updateData = req.body;
  FelicityPriceEffectivity.update(updateData, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        
        res.send({
          message: "Felicty price effectivity range was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Felicity price effectivity with id=${id}. Maybe it was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Price effectivity range with id=" + id,
      });
    });
};  

// Delete an Felicity market competitor with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  FelicityPriceEffectivity.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Felicity price effectivity range deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Felicity price effecitivity range with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Felicity price effectivity range with id=" + id,
      });
    });
};

// Delete all Market Competitors from the database.
exports.deleteAll = (req, res) => {
  FelicityPriceEffectivity.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Felicity Price effectivity range were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Felicity price effectivity ranges.",
      });
    });
};
