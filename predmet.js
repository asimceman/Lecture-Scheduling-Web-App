const Sequelize = require("sequelize");
const sequelize = require("./db.js");
 
module.exports = function (sequelize, DataTypes) {
    const Predmet = sequelize.define('Predmet', {
       naziv: Sequelize.STRING
   });
   return Predmet;
}
