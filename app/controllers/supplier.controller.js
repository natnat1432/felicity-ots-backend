const db = require("../models");
const Supplier = db.suppliers;
const SupplierLog = db.supplierloggings
const Op = db.Sequelize.Op;
require("dotenv").config();
const { getPagination, getPagingData,generateCode  } = require("../utils/util");

const Logging = require("../controllers/logging.controller.js");

const Account = db.accounts;

// Create and Save a new Supplier
exports.create = async (req, res) => {
  if (
    !req.body
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  } else {
    const supplierData = req.body
      // Save Supplier in the database
      Supplier.create(supplierData)
        .then(async (data) => {
          if (data) {
            const description = `Created supplier ${supplierData.registered_name}`;
            const createLogging = Logging.createLoggingData(supplierData.createdBy, description);
            const supplier_code = generateCode(data.id,process.env.SUPPLIER_CODE, parseInt(process.env.SUPPLER_DIGIT_LENGTH))

            updateItemCode = {
              code:supplier_code
            }
            Supplier.update(updateItemCode, { where: { id: data.id } })
            res.json({
              success: true,
              message: "Supplier created successfully",
            });
          } else {
            res
              .status(400)
              .json({ success: false, message: "Error creating supplier" });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message ||
              "Some error occurred while creating the Supplier.",
          });
        });
    
  }
};

// Retrieve all Suppliers from the database.
exports.findAll = async (req, res) => {
  const { page, size, query, category} = req.query;
  var name_condition = query?{registered_name:{[Op.substring]:query}}:null
  var category_condition = category!='All'?{supply_category:{[Op.substring]:category}}:null
  var condition =  {
        [Op.and]: [
            name_condition,
            category_condition,
        ],
      }
  const { limit, offset } = getPagination(page, size);
  Supplier.findAndCountAll({ limit: limit, offset: offset, where: condition })
    .then(async (data) => {
      var finalsuppliers = [];
      
      for (let supplier of data.rows) {
        if (supplier.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(supplier.dataValues.createdBy);
          supplier.createdByEmail = sup.email;
        }
    
        supplier.dataValues.createdByEmail = supplier.createdByEmail;
        finalsuppliers.push(supplier);
      }
      var supplierData = { count: data.count, data: finalsuppliers };
      const response = getPagingData(supplierData, page, limit);
      res.send(response);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving suppliers",
      });
    });
};

// Find a single Supplier with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Supplier.findByPk(id)
    .then(async (data) => {
      if (data) {
        var supplier = data.dataValues
        if (supplier.createdBy !== null) {
          var sup = await Account.findByPk(supplier.createdBy);
          supplier.createdByEmail = sup.email;
        }
        res.send(supplier);
      } else {
        res.status(404).send({
          message: `Cannot find Supplier with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Supplier with id=" + id,
      });
    });
};

// Retrieve all Suppliers from the database.
exports.getAll = async (req, res) => {

  Supplier.findAll()
    .then(async (data) => {
      var finalsuppliers = [];
      
      for (let supplier of data) {
        if (supplier.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(supplier.dataValues.createdBy);
          supplier.createdByEmail = sup.email;
        }
    
        supplier.dataValues.createdByEmail = supplier.createdByEmail;
        finalsuppliers.push(supplier);
      }
      var supplierData = { count: data.count, data: finalsuppliers };
      res.send(supplierData);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving suppliers",
      });
    });
};
// Retrieve all Suppliers from the database.
exports.getByCategory = async (req, res) => {
  const {category} = req.params;
  Supplier.findAll({where:{supply_category:category}})
    .then(async (data) => {
      var finalsuppliers = [];
      
      for (let supplier of data) {
        if (supplier.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(supplier.dataValues.createdBy);
          supplier.createdByEmail = sup.email;
        }
    
        supplier.dataValues.createdByEmail = supplier.createdByEmail;
        finalsuppliers.push(supplier);
      }
      var supplierData = { count: data.count, data: finalsuppliers };
      res.send(supplierData);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving suppliers",
      });
    });
};

// Update an Supplier by the id in the request
exports.update = async(req, res) => {
  const id = req.params.id;
  const creator_id = req.query.creator_id
  var updateData = req.body.editSupplier
  var changes = req.body.changes
  if(!id){res.status(404).send({message:'Missing Supplier ID'}); return}
  if(!updateData){res.status(404).send({message:'Missing Supplier Data'}); return}
  if(!changes){res.status(404).send({message:'Missing Supplier Changes'}); return}
  if(!creator_id){res.status(404).send({message:'Missing Creator ID'}); return}
  var supplier = await Supplier.findByPk(id)
  Supplier.update(updateData, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        logData = {
          supplier_id:updateData.id,
          supplier_code:updateData.code,
          logging_type:'Edit',
          description:changes,
          createdBy:creator_id
        }
        SupplierLog.create(logData)
        Logging.createLoggingData(creator_id,`Edited supplier ${supplier.registered_name}'s info`)
        res.send({
          message: "Supplier was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Supplier with id=${id}. Maybe Suppleir was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Supplier with id=" + id,
      });
    });
};
// Delete an Account with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  await SupplierLog.destroy({where:{supplier_id:id}})
  Supplier.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Supplier was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Supplier with id=${id}. Maybe Supplier was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Supplier with id=" + id,
      });
    });
};

// Delete all Suppliers from the database.
exports.deleteAll = (req, res) => {
  Supplier.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Suppliers were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Suppliers.",
      });
    });
};

