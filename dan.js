const Sequelize = require("sequelize");
const sequelize = require("./db.js");
 
module.exports = function (sequelize, DataTypes) {
    const Dan = sequelize.define('Dan', {
       naziv: Sequelize.STRING
   });
   return Dan;
}
