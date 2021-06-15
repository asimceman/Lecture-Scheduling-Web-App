const { student } = require('./db.js');
const db = require('./db.js')
db.sequelize.sync({force:true}).then(function(){
        inicializacija().then(function(){
        console.log("Gotovo kreiranje tabela!");
        process.exit();
        });
});

function inicializacija(){
        var studentiListaPromisea= [];
        var grupeListaPromisea = [];
        var predmetiListaPromisea = [];
        return new Promise(function(resolve,reject){
        grupeListaPromisea.push(db.grupa.create({naziv:"RMAgrupa1"}));
        grupeListaPromisea.push(db.grupa.create({naziv:"WTgrupa1"}));
        grupeListaPromisea.push(db.grupa.create({naziv:"WTgrupa2"}));
        grupeListaPromisea.push(db.grupa.create({naziv:"OISgrupa1"}));
        Promise.all(grupeListaPromisea).then(function(grupe){
                var RMA1=grupe.filter(function(a){return a.naziv==='RMAgrupa1'})[0];
                var WT1=grupe.filter(function(a){return a.naziv==='WTgrupa1'})[0];
                var WT2=grupe.filter(function(a){return a.naziv==='WTgrupa2'})[0];
                var OIS1=grupe.filter(function(a){return a.naziv==='OISgrupa1'})[0];

                predmetiListaPromisea.push(
                        db.predmet.create({naziv:'RMA'}).then(function(k){
                            k.setGrupePredmet([RMA1]);
                            return new Promise(function(resolve,reject){resolve(k);});
                        })
                );
                predmetiListaPromisea.push(
                        db.predmet.create({naziv:'OIS'}).then(function(k){
                            k.setGrupePredmet([OIS1]);
                            return new Promise(function(resolve,reject){resolve(k);});
                        })
                );
                predmetiListaPromisea.push(
                        db.predmet.create({naziv:'WT'}).then(function(k){
                                k.setGrupePredmet([WT1]);
                                k.setGrupePredmet([WT2])
                                return new Promise(function(resolve,reject){resolve(k);});
                        })
                );

                studentiListaPromisea.push(
                        db.student.create({ime:'Neko Nekić',index:"12345"}).then(function(k){
                                k.setGrupe([WT1]);
                                return new Promise(function(resolve,reject){resolve(k);});
                        })
                );

                studentiListaPromisea.push(
                        db.student.create({ime:'Četvrti Neko',index:"18009"}).then(function(k){
                                k.setGrupe([RMA1]);
                                return new Promise(function(resolve,reject){resolve(k);});
                        })
                );
                
                }).catch(function(err){console.log("Grupe greska "+err);}); 
        });
}