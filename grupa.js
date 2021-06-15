const Sequelize = require("sequelize");
const sequelize = require("./db.js");
 
module.exports = function (sequelize, DataTypes) {
    const Grupa = sequelize.define('Grupa', {
       naziv: Sequelize.STRING
   });
   return Grupa;
}
