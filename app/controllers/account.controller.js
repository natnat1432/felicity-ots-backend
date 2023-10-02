const db = require("../models");
const Account = db.accounts;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { generateRandomPassword } = require("../utils/util");
const { sendEmail,sendPasswordResetEmail } = require("../utils/emailSender.js");
const { getPagination, getPagingData } = require("../utils/util");

const Logging = require("../controllers/logging.controller.js");

// Create and Save a new Superadmin
exports.create = async (req, res) => {
  const { creator_id, user_email, user_category, user_system_category, tabs } =
    req.body;
  // Validate request
  if (
    !req.body
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  } else {
    const password = generateRandomPassword();
    var hashedPassword;
    await bcrypt
      .hash(password, saltRounds)
      .then((hash) => {
        hashedPassword = hash;
      })
      .catch((err) => console.error(err.message));
    const checkEmail = await Account.findOne({ where: { email: user_email } });
    if (checkEmail !== null) {
      res.status(409).json({ success: false, message: "Email already exist" });
    } else {
      // Create an account
      const create_account = {
        email: user_email,
        password: hashedPassword,
        active: true,
        tabs:tabs,
        user_category: user_category,
        reset_password: false,
        system_category: user_system_category,
        createdBy: creator_id,
      };
      // Save Account in the database
      Account.create(create_account)
        .then(async (data) => {
          const sendEm = await sendEmail(user_email, password);
          if (sendEm && data) {
            const description = `Created ${user_category} with an email ${user_email}`;
            const createLogging = Logging.createLoggingData(creator_id, description);
            res.json({
              success: true,
              message: "Account created successfully",
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
              err.message ||
              "Some error occurred while creating the Superadmin.",
          });
        });
    }
  }
};

// Retrieve all Accounts from the database.
exports.findAll = async (req, res) => {
  const { page, size, query, system_category, tabs, user_type, tableTab } = req.query;
  var department = req.query.department
  var tabsArray = tabs.split(",")
  var email_condition = query?{email:{[Op.substring]:query}}:null
  var sys = system_category !== "null"?{system_category:{[Op.substring]:system_category}} : null;
  var users = user_type == 'All'?null:{user_category:{[Op.substring]:user_type}}
  var departments = department !== 'All'?{department:{[Op.substring]:`${department}`}}:null
  var active = {active:true}
  var viewerTabs = tableTab == 'All'  ?tabsArray?{ tabs:{ [Op.or]: tabsArray.map(tab => ({ [Op.contains]: [tab] })) } }:null:{ tabs:{[Op.contains]: [tableTab] } } 
  var condition =  {
        [Op.and]: [
          email_condition,
          sys,
          viewerTabs,
          users,
          departments,
          // active,
        ],
      }
  const { limit, offset } = getPagination(page, size);
  Account.findAndCountAll({ limit: limit, offset: offset, where: condition })
    .then(async (data) => {
      var finalaccounts = [];
      
      for (let account of data.rows) {
        if (account.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(account.dataValues.createdBy);
          account.createdByEmail = sup.email;
        }
        delete account.dataValues.password;
        account.dataValues.createdByEmail = account.createdByEmail;
        finalaccounts.push(account);
      }
      var accountData = { count: data.count, data: finalaccounts };
      const response = getPagingData(accountData, page, limit);
      res.send(response);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving superadmins",
      });
    });
};

// Find a single Account with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Account.findByPk(id)
    .then(async (data) => {
      if (data) {
        var account = data.dataValues
        if (account.createdBy !== null) {
          var sup = await Account.findByPk(account.createdBy);
          account.createdByEmail = sup.email;
        }
        delete account.password;
        res.send(account);
      } else {
        res.status(404).send({
          message: `Cannot find Account with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Account with id=" + id,
      });
    });
};

// Update an Account by the id in the request
exports.update = async(req, res) => {
  const id = req.params.id;
  var updateData = req.body
  if(updateData.password)
  {
    updateData.password 
    await bcrypt
      .hash(updateData.password , saltRounds)
      .then((hash) => {
        updateData.password  = hash;
      })
      .catch((err) => console.error(err.message));
  }
  Account.update(updateData, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Account was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Account with id=${id}. Maybe Account was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Account with id=" + id,
      });
    });
};
// Reset an Account by the id in the request
exports.resetPassword = async(req, res) => {
  const id = req.params.id
  const creator_id = req.body.creator_id
  const password = generateRandomPassword();
  var hashedPassword;
  await bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      hashedPassword = hash;
    })
    .catch((err) => console.error(err.message));
  
  const updateData = {
    password:hashedPassword,
    reset_password:true,
  }
  var user = await Account.findByPk(id);
  Account.update(updateData, {
    where: { id: id },  
  })
    .then(async(num) => {
      if (num == 1) {
        const sendEm = await sendPasswordResetEmail(user.email, password);
        if (sendEm) {
          
          const description = `Resets ${user.email}'s password`;
          const createLogging =  Logging.createLoggingData(creator_id, description);
            res.json({
              success: true,
              message: "Account password reset successful.",
            });
        
        }
      } else {
        res.send({
          message: `Cannot reset Account password with id=${id}. Maybe Account was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error Account password reset with id=" + id,
      });
    });
};

// Delete an Account with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Account.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Account was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Account with id=${id}. Maybe Account was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Account with id=" + id,
      });
    });
};

// Delete all Accounts from the database.
exports.deleteAll = (req, res) => {
  Account.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Accounts were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Accounts.",
      });
    });
};

// Find all active Accounts
exports.findAllActive = (req, res) => {
  Account.findAll({ where: { active: true } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving accounts.",
      });
    });
};

