const Sequelize = require("sequelize");
const sequelize = require("./db.js");
 
module.exports = function (sequelize, DataTypes) {
    const Tip = sequelize.define('Tip', {
       naziv: Sequelize.STRING
   });
   return Tip;
}
