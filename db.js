const Sequelize = require("sequelize");
const path = require('path');
const sequelize = new Sequelize("wt2018416", "root", "root", {
   host: "127.0.0.1",
   dialect: "mysql"
});
const db={};
db.Sequelize = Sequelize;  
db.sequelize = sequelize;

//import modela
db.predmet = require(path.join(__dirname+'/predmet.js'))(sequelize, Sequelize.DataTypes);
db.grupa = require(path.join(__dirname+'/grupa.js'))(sequelize, Sequelize.DataTypes);
db.aktivnost = require(path.join(__dirname+'/aktivnost.js'))(sequelize, Sequelize.DataTypes);
db.dan = require(path.join(__dirname+'/dan.js'))(sequelize, Sequelize.DataTypes);
db.tip = require(path.join(__dirname+'/tip.js'))(sequelize, Sequelize.DataTypes);
db.student = require(path.join(__dirname+'/student.js'))(sequelize, Sequelize.DataTypes);

//relacije
// Predmet 1-N Grupa
db.predmet.hasMany(db.grupa,{as:'grupePredmet'}, {foreignKey:{allowNull:false}});
db.grupa.belongsTo(db.predmet);

//Aktivnost N-1 Predmet
db.predmet.hasMany(db.aktivnost,{as:'aktivnostiPredmet'}, {foreignKey:{allowNull:false}});
db.aktivnost.belongsTo(db.predmet);

//Aktivnost N-0 Grupa
db.grupa.hasMany(db.aktivnost,{as:'aktivnostiGrupe'})
db.aktivnost.belongsTo(db.grupa, {foreignKey:{allowNull:true}});

//Aktivnost N-1 Dan
db.dan.hasMany(db.aktivnost,{as:'aktivnostiDan'}, {foreignKey:{allowNull:false}});
db.aktivnost.belongsTo(db.dan);

//Aktivnost N-1 Tip
db.tip.hasMany(db.aktivnost,{as:'aktivnostiTip'}, {foreignKey:{allowNull:false}});
db.aktivnost.belongsTo(db.tip);

//Student N-M Grupa
db.studentGrupa=db.grupa.belongsToMany(db.student,{as:'studenti',through:'student_grupa',foreignKey:'grupaId'});
db.student.belongsToMany(db.grupa,{as:'grupe',through:'student_grupa',foreignKey:'studentId'});


module.exports=db;