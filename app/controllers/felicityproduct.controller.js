const db = require("../models");
const FelicityProduct = db.felicityproducts;
const Op = db.Sequelize.Op;


const Logging = require("../controllers/logging.controller.js");

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

// Create and Save a new Felicty Product Item
exports.create = async (req, res) => {
    const item = req.body
  if (
    !req.body
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  } else {
        var item_code;
      // Create an account
      const create_product = {
        item_code:item_code,
        item_type:item_type,
        item_name : item.item_name,
        item_category : item.item_category,
        item_brand : item.item_brand,
        item_packaging_unit : item.item_packaging_unit,
        item_quantity_per_unit : item.item_quantity_per_unit,
        item_unit_measure : item.item_unit_measure,
        active : true,
        createdBy : item.creator_id
      };
      // Save Product in the database
      FelicityProduct.create(create_product)
        .then(async (data) => {
        
            if(data){
            const description = `Created felicity product ${item.item_name} with an item code of ${item_code}`;
            const createLogging = Logging.createLoggingData(creator_id, description);
            res.json({
              success: true,
              message: "Product created successfully",
            });
          } else {
            res
              .status(400)
              .json({ success: false, message: "Error creating product" });
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
  console.log("TAB",tableTab)
  var condition =  {
        [Op.and]: [
          email_condition,
          sys,
          viewerTabs,
          users,
          departments,
          active,
        ],
      }
  console.log("CONDITIONS", condition)
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
        console.log(account)
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
  console.log("ID", id)
  console.log("CREATOR ID", creator_id)
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
  console.log("ACCOUNT USER", user)
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

