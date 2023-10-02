const db = require("../models");
const SuleatProduct = db.suleatproducts;
const SuleatProductLogging = db.suleatproductloggings;
const Account = db.accounts;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;
const Logging = require("./logging.controller.js");
const excelJS = require("exceljs");
const date = require('date-and-time');
const { getPagination, getPagingData, generateCode } = require("../utils/util");

// Create and Save a new Suleat Product Item
exports.create = async (req, res) => {
  const item = req.body;
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  } else {
    const create_product = {
      item_name: item.item_name,
      item_category: item.item_category,
      item_packaging_unit: item.item_packaging_unit,
      item_unit_measure: item.item_unit_measure,
      active: true,
      createdBy: item.creator_id,
    };

    // Save Product in the database
    SuleatProduct.create(create_product)
      .then(async (data) => {
        if (data) {
          var code;
          if (item.item_category == "Packed Meal") {
            code = process.env.SULEAT_PACKEDMEAL_CODE;
          }
          if (item.item_category == "Food Tray") {
            code = process.env.SULEAT_FOODTRAY_CODE;
          }

          const product_code_id = await SuleatProduct.count({
            where: { item_category: item.item_category },
          });
          const product_code = generateCode(
            product_code_id,
            code,
            parseInt(process.env.PRODUCT_DIGIT_LENGTH)
          );

          updateItemCode = {
            item_code: product_code,
          };
          SuleatProduct.update(updateItemCode, { where: { id: data.id } });
          const description = `Created suleat product ${item.item_name} with an item code of ${code}`;
          product_logging = {
            logging_type: "Create",
            description: null,
            product_id: data.id,
            createdBy: item.creator_id,
          };
          await SuleatProductLogging.create(product_logging);
          await Logging.createLoggingData(item.creator_id, description);
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
            err.message || "Some error occurred while creating the Superadmin.",
        });
      });
  }
};


exports.findAllActive = (req, res) => {
    const { item_category, query } = req.query;
    if (!item_category) {
      res.status(400).send({ message: "Item category is required" });
      return;
    }
  
    const searchCondition = query ? { item_name: { [Sequelize.Op.substring]: query } } : null;
    const itemCategoryCondition = item_category !== "All" ? { item_category } : null;
    const activeCondition = { active: true };
    const condition = {
      [Sequelize.Op.and]: [activeCondition, searchCondition, itemCategoryCondition],
    };
  
    SuleatProduct.findAll({
      where: condition,
      order: [
        [
        Sequelize.literal(`
          CASE 
               WHEN item_category = 'Packed Meal' THEN 1
               WHEN item_category = 'Food Tray'  THEN 2
               ELSE 3
          END
        `)],
        ['item_code', 'asc'],
      ],
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving products.",
        });
      });
  };
exports.findAllInactive = (req, res) => {
    const { item_category, query } = req.query;
    if (!item_category) {
      res.status(400).send({ message: "Item category is required" });
      return;
    }
  
    const searchCondition = query ? { item_name: { [Sequelize.Op.substring]: query } } : null;
    const itemCategoryCondition = item_category !== "All" ? { item_category } : null;
    const activeCondition = { active: false };
    const condition = {
      [Sequelize.Op.and]: [activeCondition, searchCondition, itemCategoryCondition],
    };
  
    SuleatProduct.findAll({
      where: condition,
      order: [
        [
        Sequelize.literal(`
          CASE 
               WHEN item_category = 'Packed Meal' THEN 1
               WHEN item_category = 'Food Tray'  THEN 2
               ELSE 3
          END
        `)],
        ['item_code', 'asc'],
      ],
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving products.",
        });
      });
  };

  // Retrieve all Felicity Products from the database.
exports.findAll = async (req, res) => {
    const { page, size, query, item_category, active } = req.query;
    if(!page){res.status(404).send({message:'Page not found'}); return}
    if(!size){res.status(404).send({message:'Size not found'}); return}
    if(!item_category){res.status(404).send({message:'Item category not found'}); return}
    if(!active){res.status(404).send({message:'Active condition not found'}); return}
  
    var search_condition = query?{item_name:{[Op.substring]:query}}:null
    var item_category_condition = item_category!='All'?{item_category:item_category}:null
    var active_condition = {active:active}
  
    var condition =  {
          [Op.and]: [
              search_condition,
              item_category_condition,
              active_condition
          ],
        }
    const { limit, offset } = getPagination(page, size);
    SuleatProduct.findAndCountAll({ limit: limit, offset: offset, where: condition })
      .then(async (data) => {
        var finalproducts = [];
        
        for (let product of data.rows) {
          if (product.dataValues.createdBy !== null) {
            var sup = await Account.findByPk(product.dataValues.createdBy);
            product.createdByEmail = sup.email;
          }
          product.dataValues.createdByEmail = product.createdByEmail;
          finalproducts.push(product);
        }
        var productData = { count: data.count, data: finalproducts };
        const response = getPagingData(productData, page, limit);
        res.send(response);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occured while retrieving products",
        });
      });
  };
  
  // Find a single Account with an id
  exports.findOne = (req, res) => {
    const id = req.params.id;
  
    SuleatProduct.findByPk(id)
      .then(async (data) => {
        if (data) {
          var product = data.dataValues
          if (product.createdBy !== null) {
            var sup = await Account.findByPk(product.createdBy);
            product.createdByEmail = sup.email;
          }
    
          res.send(product);
        } else {
          res.status(404).send({
            message: `Cannot find Product with id=${id}.`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error retrieving Product with id=" + id,
        });
      });
  };

  // Update an Product by the id in the request
exports.update = async(req, res) => {
    const id = req.params.id;
    const creator_id = req.query.creator_id
    var updateData = req.body.editSuleatProductForm
    var changes = req.body.changes
    if(!id){res.status(404).send({message:'Missing Product ID'}); return}
    if(!updateData){res.status(404).send({message:'Missing Product Data'}); return}
    if(!changes){res.status(404).send({message:'Missing Product Update Changes'}); return}
    if(!creator_id){res.status(404).send({message:'Missing Creator ID'}); return}
    
    var product = await SuleatProduct.findByPk(id)
    SuleatProduct.update(updateData, {
      where: { id: id },
    })
      .then(async(num) => {
        if (num == 1) {
          logData = {
            logging_type:"Edit",
            description:changes,
            product_id:id,
            createdBy:creator_id
          }
          await SuleatProductLogging.create(logData)
          await Logging.createLoggingData(creator_id,`Updated Suleat Product code ${product.item_code} | ${product.item_name}'s Info`)
          
          res.send({
            message: "Product was updated successfully.",
          });
        } else {
          res.send({
            message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating Product with id=" + id,
        });
      });
  };
  
  // Update an Product by the id in the request
  exports.updateStatus = async(req, res) => {
    const id = req.params.id;
    var updateData = req.body.product_form;
    var changes = req.body.changes;
    var {creator_id} = req.query;
    SuleatProduct.update(updateData, {
      where: { id: id },
    })
      .then(async(num) => {
        if (num == 1) {
          var productlogging = {
            logging_type:"Product Visiblity Edit",
            description: changes.description,
            product_id:id,
            createdBy:creator_id
          }
          await SuleatProductLogging.create(productlogging);
          var logging_description = `Updated Suleat Product code ${updateData.item_code} | ${updateData.item_name}'s Visibility`
          await Logging.createLoggingData(creator_id,logging_description);
          res.send({
            message: "Product status updated successfully.",
          });
        } else {
          res.send({
            message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating Product with id=" + id,
        });
      });
  };


  // Delete a Product with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;
    const creator_id = req.query.creator_id;

    if(!id){res.send({message:"Product ID Missing"});return;}
    if(!creator_id){res.send({message:"Creator ID Missing"});return;}

    const product = await SuleatProduct.findByPk(id)
    SuleatProduct.destroy({
      where: { id: id },
    })
      .then( async (num) => {
        if (num == 1) {
        var logging_description = `Deleted Suleat Product code ${product.item_code} | ${product.item_name}`
          await Logging.createLoggingData(creator_id,logging_description);
          res.send({
            message: "Suleat Product deleted successfully",
          });
        } else {
          res.send({
            message: `Cannot delete Suleat Product with id=${id}. Maybe Product was not found!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Could not delete Suleat product with id=" + id,
        });
      });
  };

  // Delete all Products from the database.
exports.deleteAll = async(req, res) => {
    const creator_id = req.query.creator_id;
    if(!creator_id){res.send({message:"Creator ID Missing"});return;}
    SuleatProduct.destroy({
      where: {},
      truncate: false,
    })
      .then(async(nums) => {
        var logging_description = `Deleted All Suleat Product`
        await Logging.createLoggingData(creator_id,logging_description);
        res.send({ message: `${nums} Products were deleted successfully!` });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Products.",
        });
      });
  };

  exports.exportExcel = async(req,res) => {
    const workbook = new excelJS.Workbook();

    const { item_category, query } = req.query;
    if (!item_category) {
      res.status(400).send({ message: "Item category is required" });
      return;
    }
  
    const searchCondition = query ? { item_name: { [Sequelize.Op.substring]: query } } : null;
    const itemCategoryCondition = item_category !== "All" ? { item_category } : null;
    const activeCondition = { active: true };
    const condition = {
      [Sequelize.Op.and]: [activeCondition, searchCondition, itemCategoryCondition],
    };
  
    const suleatproducts = await SuleatProduct.findAll({
      include:[
        {
          model:Account,
          attributes:["email"]
        },
      ],
      where: condition,
      order: [
        [
        Sequelize.literal(`
          CASE 
               WHEN item_category = 'Packed Meal' THEN 1
               WHEN item_category = 'Food Tray'  THEN 2
               ELSE 3
          END
        `)],
        ['item_code', 'asc'],
      ],
    })
    const now  =  new Date();
    const value = date.format(now,'DD_MM_YYYY');
    const worksheet = workbook.addWorksheet(`Suleat Product List ${value}`);
  
    const suleatProductItems = suleatproducts;


    worksheet.columns = [
      {header:'Item Code', key:'item_code', width:20},
      {header:'Item Name', key:'item_name', width:30},
      {header:'Item Category', key:'item_category', width:20},
      {header:'Item Packaging Unit', key:'item_packaging_unit', width:20},
      {header:'Item Unit Measurement', key:'item_unit_measure', width:20},
      {header:'Created By', key:'createdByEmail', width:30},
    
    ]
    var index = 2
    const row = worksheet.getRow(1)
    var rowLength = 6
    row.outlineLevel = 1;

    //Adding borders and alignments to each cell in row 1 Headers
    for(let i=1; i<=rowLength;i++)
    {
      row.getCell(i).border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      };
      row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
    }
    row.getCell(6).value = "Created By"

    suleatProductItems.forEach((item) => {
      worksheet.addRow(item.dataValues);
      // add a column of new values
      const row = worksheet.getRow(index);
      var rowLength = 6
      row.outlineLevel = 1;

      //Adding borders and alignments to each cell in row
      for(let i=1; i<=rowLength;i++)
      {
        row.getCell(i).border = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        };
        row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
      }
      row.getCell(6).value = item.account.email; 
      index++
    });
  
    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
  
      // Set the Content-Type and Content-Disposition headers.
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader(`Content-Disposition`, `attachment; filename=SuleatProductList.xlsx`);
  
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
  
  }