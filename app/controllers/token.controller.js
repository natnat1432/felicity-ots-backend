const db = require("../models");
const Token = db.tokens;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");


// Create and Save a new Token
exports.create = (req, res) => {
    // Validate request
    if (!req.body.refreshToken) {
     res.status(400).send({
       message: "Content can not be empty!"
     });
     return;
   }
 
   // Create a Token
   const token = {
     refreshToken: req.body.refreshToken,
     active: req.body.active ? req.body.active : true
   };
 
   // Save Token in the database
   Token.create(token)
     .then(data => {
       res.send(data);
     })
     .catch(err => {
       res.status(500).send({
         message:
           err.message || "Some error occurred while creating the token."
       });
     });
 };
 
 // Retrieve all Tokens from the database.
 exports.findAll = (req, res) => {
    const refreshToken = req.query.refreshToken;
   var condition = refreshToken ? { refreshToken: { [Op.iLike]: `%${refreshToken}%` } } : null;
 
   Token.findAll({ where: condition })
     .then(data => {
       res.send(data);
     })
     .catch(err => {
       res.status(500).send({
         message:
           err.message || "Some error occurred while retrieving tokens."
       });
     });
 };
 
 // Find a single Token with a refreshToken
 exports.findOne = (req, res) => {
     const id = req.params.id;
 
     Token.findByPk(id)
       .then(data => {
         if (data) {
           res.send(data);
         } else {
           res.status(404).send({
             message: `Cannot find Token with id=${id}.`
           });
         }
       })
       .catch(err => {
         res.status(500).send({
           message: "Error retrieving Superadmin with id=" + id
         });
       });
 };
 
 // Update a Token by the refreshToken in the request
 exports.update = (req, res) => {
     const refreshToken = req.params.refreshToken;
 
     Token.update(req.body, {
       where: { refreshToken: refreshToken }
     })
       .then(num => {
         if (num == 1) {
           res.send({
             message: "Token was updated successfully."
           });
         } else {
           res.send({
             message: `Cannot update Token with a refreshToken=${refreshToken}. Maybe the refreshToken was not found or req.body is empty!`
           });
         }
       })
       .catch(err => {
         res.status(500).send({
           message: "Error updating Token with refreshToken=" + refreshToken
         });
       });
 };
 
 // Delete a Token with the specified refreshToken in the request
 exports.delete = (req, res) => {
     const refreshToken = req.params.refreshToken;
 
   Token.destroy({
     where: { refreshToken: refreshToken }
   })
     .then(num => {
       if (num == 1) {
         res.send({
           message: "Token was deleted successfully!"
         });
       } else {
         res.send({
           message: `Cannot delete Token with refreshToken=${refreshToken}. Maybe Token was not found!`
         });
       }
     })
     .catch(err => {
       res.status(500).send({
         message: "Could not delete Token with refreshToken=" + refreshToken
       });
     });
 };
 
 // Delete all Tokens from the database.
 exports.deleteAll = (req, res) => {
     Token.destroy({
         where: {},
         truncate: false
       })
         .then(nums => {
           res.send({ message: `${nums} Tokens were deleted successfully!` });
         })
         .catch(err => {
           res.status(500).send({
             message:
               err.message || "Some error occurred while removing all tokens."
           });
         });
 };
 
 // Find all active Tokens
 exports.findAllActive = (req, res) => {
     Token.findAll({ where: { active: true } })
     .then(data => {
       res.send(data);
     })
     .catch(err => {
       res.status(500).send({
         message:
           err.message || "Some error occurred while retrieving tokens."
       });
     });
 };

 exports.authenticateToken = async(req, res, next) => {
     // Bearer TOKEN
     const authHeader = req.headers['authorization']
     const token = authHeader && authHeader.split(' ')[1]
 
     if (token == null) return res.sendStatus(401)
 
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
         if (err) return res.sendStatus(403)
         req.user = user
         next()
     })
}