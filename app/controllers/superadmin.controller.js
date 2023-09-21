const db = require("../models");
const Superadmin = db.superadmins;
const { Op } = require("sequelize");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const { generateRandomPassword } = require("../utils/util");
const { sendEmail } = require("../utils/email-sender.js");

const { createLoggingData } = require("../controllers/logging.controller.js");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (fetchedData, page, limit) => {
  const { count: totalItems, data } = fetchedData;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, data, totalPages, currentPage };
};

// Create and Save a new Superadmin
exports.create = async (req, res) => {
  // create user body
  // superadmin_id
  // user_email
  // user_category
  // user_system_category
  const {superadmin_id, user_email, user_category, user_system_category} = req.body
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const password = generateRandomPassword();
  var hashedPassword;
  await bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      hashedPassword = hash;
    })
    .catch((err) => console.error(err.message));
  const checkEmail = await Superadmin.findOne({ where: { email: email } });
  if (checkEmail !== null) {
    res.status(409).json({ success: false, message: "Email already exist" });
  } else {
    // Create a Superadmin
    const superadmin = {
      email: req.body.email,
      password: hashedPassword,
      active: true,
      createdBy: superadmin_id,
    };

    // Save Superadmin in the database
    Superadmin.create(superadmin)
      .then(async (data) => {
        const sendEm = await sendEmail(email, password);
        if (sendEm && data) {
          const description = `Created a superadmin with an email ${email}`;
          const createLogging = createLoggingData(
            superadmin_id,
            "superadmin",
            description
          );
            res.json({
              success: true,
              message: "Superadmin created successfully",
            });
        
       
        } else {
          res
            .status(400)
            .json({ success: false, message: "Error creating superadmin" });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Superadmin.",
        });
      });
  }
};


// Retrieve all Superadmins from the database.
exports.findAll = async (req, res) => {
  const { page, size, query } = req.query;

  console.log("page", page);
  console.log("size", size);
  var condition = query ? { email: { [Op.substring]: query } } : null;
  const { limit, offset } = getPagination(page, size);
  Superadmin.findAndCountAll({ limit: limit, offset: offset, where: condition })
    .then(async (data) => {
      var finalsuperadmin = [];
      for (let superadmin of data.rows) {
        if (superadmin.createdBy !== null) {
          var sup = await Superadmin.findByPk(superadmin.createdBy);
          superadmin.createdByEmail = sup.email;
        }
        delete superadmin.dataValues.password;
        superadmin.dataValues.createdByEmail = superadmin.createdByEmail;
        finalsuperadmin.push(superadmin);
      }
      var superadminData = { count: data.count, data: finalsuperadmin };
      const response = getPagingData(superadminData, page, limit);
      res.send(response);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving superadmins",
      });
    });
};

// Find a single Superadmin with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Superadmin.findByPk(id)
    .then(async (data) => {
      if (data) {
        finalData = {}
        for(let key of data){
          if(data.hasOwnProperty(key)){
            value = data[key]
            finalData[`${key}`] =  value
          }
        }
        res.send(finalData);
      } else {
        res.status(404).send({
          message: `Cannot find Superadmin with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Superadmin with id=" + id,
      });
    });
};

exports.findByEmail = (req, res) => {
  const email = req.body.email;

  Superadmin.findOne({
    where: {
      email: email,
    },
  })
    .then((data) => {
      if (data) {
        console.log("EMAIL GATHERED", data.dataValues);
        return data.dataValues;
      } else {
        res.status(404).send({
          message: `Cannot find Superadmin with email=${email}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Superadmin with email=" + email,
      });
    });
};

// Update a Superadmin by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Superadmin.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Superadmin was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Superadmin with id=${id}. Maybe Superadmin was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Superadmin with id=" + id,
      });
    });
};

// Delete a Superadmin with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Superadmin.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Superadmin was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Superadmin with id=${id}. Maybe Superadmin was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Superadmin with id=" + id,
      });
    });
};

// Delete all Superadmins from the database.
exports.deleteAll = (req, res) => {
  Superadmin.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Superadmins were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all superadmins.",
      });
    });
};

// Find all active Superadmins
exports.findAllActive = (req, res) => {
  Superadmin.findAll({ where: { active: true } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving superadmins.",
      });
    });
};
