const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require('fs');
const Sequelize = require('sequelize');
const sequelize = require('./db.js');
const db = require('./db.js');
const { debugPort } = require("process");

const app = express();
app.use(bodyParser.json());


function dajPredmete(allText) {
    var lines=allText.split("\n");

  var result = [];

  for(var i=1;i<lines.length;i++){
      var currentline=lines[i]
      result.push(currentline);
  }
  return result;
}

function processData(allText) {
    var lines=allText.split("\n");

  var result = [];
  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){
      var obj = {};
      var currentline=lines[i].split(",");
      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }
      result.push(obj);
  }
  return result;
}

//staticki fajlovi da se otvaraju na /imeFajla
app.use(express.static(path.join(__dirname, 'public')));

//GET /predmeti
app.get('/v1/predmeti',function(req,res){
    fs.readFile('predmeti.txt', function(err, podaci){
        if(err) throw err;
        var podaci1 = podaci.toString('utf-8');
        var predmeti = dajPredmete(podaci1);
        var niz = [];
        for (i=0; i<predmeti.length; i++){
            var noviObjekt = {
                naziv: predmeti[i]
            }
            niz.push(noviObjekt);
        }
        res.json(niz);
        res.end();
 });
});

//POST /predmet
app.post('/v1/predmet',function(req,res){
    let noviPredmet = '\n'+req.body.naziv;
    var ima = false;

    fs.readFile('predmeti.txt', function(err, podaci){
        if(err) throw err;
        var podaci1 = podaci.toString('utf-8');
        var predmeti = dajPredmete(podaci1);
        predmeti.forEach(predmet => {
            if(predmet === req.body.naziv){
                ima = true;
                res.json({message:"Naziv predmeta postoji!"});
                return;
            }
        });
            if(!ima){
            fs.appendFile('predmeti.txt', noviPredmet, function(err){
                if(err) throw err;
                res.json({message:"Uspješno dodan predmet!"});
            });
        }
     });
});

//GET aktivnosti
app.get('/v1/aktivnosti', function(req,res){
    fs.readFile('aktivnosti.txt', function(err, podaci){
        if(err) throw err;
        var podaci1 = podaci.toString('utf-8');
        var aktivnosti = processData(podaci1);
        var niz = [];
        for (i=0; i<aktivnosti.length; i++){
            var noviObjekt = {
                naziv: aktivnosti[i].naziv,
                tip:  aktivnosti[i].tip,
                pocetak: Number.parseFloat( aktivnosti[i].pocetak),
                kraj: Number.parseFloat(aktivnosti[i].kraj),
                dan: aktivnosti[i].dan
            }
            niz.push(noviObjekt);
        }
        res.json(niz);
        res.end();
 });
});

//POST aktivnost
app.post('/v1/aktivnost', function(req,res){
    let nazivAktivnost = req.body.naziv;
    let tipAktivnosti = req.body.tip;
    let pocetakAktivnosti = req.body.pocetak;
    let krajAktivnosti = req.body.kraj;
    let danAktivnosti = req.body.dan;
    var ima = false;
    const pocetakRasporeda = 8; //rekao asistent
    const krajRasporeda = 20; //

    if(pocetakAktivnosti<0 || pocetakAktivnosti>24 || !Number.isInteger(pocetakAktivnosti*2) 
    || krajAktivnosti<0 || krajAktivnosti>24 || !Number.isInteger(krajAktivnosti*2) || 
    krajAktivnosti<=pocetakAktivnosti || pocetakAktivnosti<pocetakRasporeda || pocetakAktivnosti>krajRasporeda
    || krajAktivnosti<pocetakRasporeda || krajAktivnosti>krajRasporeda){
        res.json({message: "Aktivnost nije validna!"})
        return;
    }

    fs.readFile('aktivnosti.txt', function(err, podaci){
        if(err) throw err;
        var podaci1 = podaci.toString('utf-8');
        var linije = processData(podaci1);
        
        //ako ima raspored onda treba provjeriti da li ima taj dan i da li je vrijeme unutar rasporeda, a sada cemo samo gledati za aktivnosti jednu po jednu

        for(let i=0; i<linije.length; i++){
            if(danAktivnosti == linije[i].dan)
                if((pocetakAktivnosti>linije[i].pocetak && pocetakAktivnosti<linije[i].kraj) || (krajAktivnosti>linije[i].pocetak && krajAktivnosti<linije[i].kraj)
                    || (pocetakAktivnosti==linije[i].pocetak && krajAktivnosti==linije[i].kraj) || (pocetakAktivnosti<linije[i].pocetak && krajAktivnosti>linije[i].kraj)
                    || (pocetakAktivnosti==linije[i].pocetak && krajAktivnosti>linije[i].kraj)
                    || (pocetakAktivnosti<linije[i].pocetak && krajAktivnosti==linije[i].kraj) ){
                    ima = true;
                    res.json({message:"Aktivnost nije validna!"});
                    return;
                }
        }
        if(!ima){
            let novaLinija = '\n' + nazivAktivnost + ',' + tipAktivnosti + ',' + pocetakAktivnosti + ',' + krajAktivnosti + ',' + danAktivnosti;
            fs.appendFile('aktivnosti.txt', novaLinija, function(err){
                if(err) throw err;
                res.json({message:"Uspješno dodana aktivnost!"});
            });
        }
    });
});

//GET /predmet/:naziv/aktivnost/
app.get('/v1/predmet/:naziv/aktivnost', function(req, res){
    fs.readFile('aktivnosti.txt', function(err, podaci){
        if(err) throw err;
        var predmet = req.params.naziv;
        var podaci1 = podaci.toString('utf-8');
        var aktivnosti = processData(podaci1);
        var niz = [];
        for(let i=0; i<aktivnosti.length; i++){
            if(predmet === aktivnosti[i].naziv){
                var noviObjekt = {
                    naziv: aktivnosti[i].naziv,
                    tip: aktivnosti[i].tip,
                    pocetak: Number.parseFloat(aktivnosti[i].pocetak),
                    kraj: Number.parseFloat(aktivnosti[i].kraj),
                    dan: aktivnosti[i].dan
                }
                niz.push(noviObjekt);
        }
        }
        res.json(niz);
        res.end();
    });
});

//DELETE /aktivnost/:naziv
//KAD IDE DA JE NEUSPJESNO OBRISANA
app.delete('/v1/aktivnost/:naziv', function(req,res){
    fs.readFile('aktivnosti.txt', function(err, podaci){
        if(err) throw err;
        var predmet = req.params.naziv;
        var podaci1 = podaci.toString('utf-8');
        var aktivnosti = processData(podaci1);
        var upis = "naziv,tip,pocetak,kraj,dan";
        var ima = false;
        for(let i=0; i<aktivnosti.length; i++){
             if(predmet !== aktivnosti[i].naziv){
                 upis +="\n" + aktivnosti[i].naziv+","+aktivnosti[i].tip+","+aktivnosti[i].pocetak+","+aktivnosti[i].kraj+","+aktivnosti[i].dan
         }
            else
                ima=true;
         }
        fs.writeFile('aktivnosti.txt', upis, (err) => {
            if(err){
                res.json({message:"Greška - aktivnost nije obrisana!"})
                throw err;
            }    
        });
        if(!ima) res.json({message:"Greška - aktivnost nije obrisana!"})
        else
        res.json({message:"Uspješno obrisana aktivnost!"})
    });
});

//DELETE /predmet/:naziv
app.delete('/v1/predmet/:naziv', function(req,res){
    fs.readFile('predmeti.txt', function(err, podaci){
        if(err) throw err;
        var predmet = req.params.naziv;
        var podaci1 = podaci.toString('utf-8');
        var predmeti = dajPredmete(podaci1);
        var upis = "naziv";
        var ima = false;
        for(let i=0; i<predmeti.length; i++){
             if(predmet !== predmeti[i]){
                 upis +="\n" + predmeti[i];
         }
            else if (predmet == predmeti[i])
                ima = true;
         }
        fs.writeFile('predmeti.txt', upis, (err) => {
            if(err){
                res.json({message:"Greška - predmet nije obrisan!"})
                throw err;
            }    
        });
        if(!ima) res.json({message:"Greška - predmet nije obrisan!"})
        else res.json({message:"Uspješno obrisan predmet!"})
    });
});

//DELETE /all
app.delete('/v1/all', function(req,res){
    fs.writeFile('predmeti.txt', "naziv", (err) => {
        if(err){
            res.json({message:"Greška - predmet nije obrisan!"})
            throw err;
        }    
    });

    fs.writeFile('aktivnosti.txt', "naziv,tip,pocetak,kraj,dan", (err) => {
        if(err){
            res.json({message:"Greška - predmet nije obrisan!"})
            throw err;
        }    
    });

    res.json({message:"Uspješno obrisan sadržaj datoteka!"})
})

//v2 CRUD za model Predmet
//CREATE predmet
app.post('/v2/predmet', async (req, res) =>{
    let naziv = req.body.naziv;
    await db.predmet.findOne({where:{naziv: naziv}}).then(async (nadjen) =>{
        if(nadjen==null){
            await db.predmet.create({naziv:naziv});
            res.json({message:"Uspješno dodan predmet!"})
        }
        else
            res.json({message:"Naziv predmeta postoji!"});
    })
})

//CREATE VISE PREDMETA
app.post('/v2/predmeti', async (req,res)=>{
    let niz = [];
    for(let i=0; i<req.body.length;i++){
        await db.predmet.findOne({where:{naziv: req.body[i].naziv}}).then(async (nadjen)=>{
            if(nadjen==null){
                await db.predmet.create({naziv:req.body[i].naziv})
            }
            else{
                    niz.push("Predmet " + req.body[i].naziv + " nije kreiran jer vec postoji predmet sa tim nazivom!");
            }
    })
}
    if(niz.length!=0)
        res.json(niz);
    else
        res.json({message: "Uspjesno kreirani svi predmeti!"})
})

//READ predmet
app.get('/v2/predmet/:id', function(req, res){
    let id = req.params.id;
    db.predmet.findOne({where:{id: id}}).then((nadjen) => {
        if(nadjen==null){
            res.json({message:"Ne postoji predmet kojeg pokusavate procitati!"})
        }
        res.json(nadjen);
        res.end();
    })
})

//READ SVE PREDMETE
app.get('/v2/predmeti', async(req, res)=>{
    rezultat = [];
    await db.predmet.findAll().then((predmeti) => {
        for(let i=0; i<predmeti.length; i++){
            var object = {
                id:predmeti[i].id,
                naziv:predmeti[i].naziv,
            }
            rezultat.push(object);
        }
        res.json(rezultat);
        res.end();
    })
})

//DELETE predmet
app.delete('/v2/predmet/:id', function(req, res){
    let id = req.params.id;
    db.predmet.destroy({where:{id: id}}).then((nadjen)=>{
        if(nadjen==0)
        res.json({message:"Ne postoji predmet koji pokusavate obrisati!"})
        else
        res.json({message:"Uspješno obrisan predmet!"})
    })
})

//UPDATE predmet
//DA LI SE SMIJE AZURIRATI UKOLIKO VEC POSTOJI PREDMET SA NAZIVOM NA KOJI ZELIMO DA AZRUIRAMO?
app.put('/v2/predmet/:id', async(req, res)=>{
    let id = req.params.id;
    let naziv = req.body.naziv;
    await db.predmet.findOne({where:{id:id}}).then(async (nadjen) => {
        if(nadjen !=null){
            await db.predmet.findOne({where:{naziv:naziv}}).then(async(nadjen2)=>{
                if(nadjen2==null){
                    nadjen.naziv = naziv;
                    nadjen.save();
                    res.json({message:"Uspješno ažuriran predmet!"})
                }
                else
                res.json({message:"Vec postoji predmet sa tim nazivom!"})
            })
        }
        else{
            res.json({message:"Ne postoji predmet koji pokusavate azurirati!"})
        }
    })
})


//v2 CRUD za model Grupa
//CREATE grupa
app.post('/v2/grupa', async (req, res)=>{
    let naziv = req.body.naziv;
    let idPredmeta =Number.parseFloat(req.body.PredmetId);
    await db.grupa.findOne({where:{naziv: naziv, PredmetId: idPredmeta}}).then(async (nadjen) =>{
        if(nadjen==null){
            await db.predmet.findOne({where:{id:idPredmeta}}).then(async(nadjen2)=>{
                if(nadjen2!=null){
                await db.grupa.create({naziv:naziv, PredmetId:idPredmeta});
                res.json({message:"Uspješno dodana grupa!"})
                }
                else
                res.json({message:"Ne postoji predmet sa unesenim id-om!"})
            })
        }
        else
            res.json({message:"Vec postoji grupa sa nazivom " + naziv +" za taj predmet!"});
    })
    
})

//CREATE VISE GRUPA
app.post('/v2/grupe', async (req,res)=>{
    let niz = [];
    for(let i=0; i<req.body.length;i++){
        await db.grupa.findOne({where:{naziv: req.body[i].naziv, PredmetId:req.body[i].PredmetId}}).then(async (nadjen)=>{
            if(nadjen==null){
                await db.grupa.create({naziv:req.body[i].naziv, PredmetId:req.body[i].PredmetId})
            }
            else{
                    niz.push("Grupa " + req.body[i].naziv + " nije kreirana jer vec postoji grupa sa tim nazivom za taj predmet!");
            }
    })
}
    if(niz.length!=0)
        res.json(niz);
    else
        res.json({message: "Uspjesno kreirane sve grupe!"})
})

//READ grupa
app.get('/v2/grupa/:id', function(req, res){
    let id = req.params.id;
    db.grupa.findOne({where:{id: id}}).then((nadjen) => {
        if(nadjen==null){
            res.json({message:"Ne postoji grupa koju pokusavate procitati!"})
        }
        res.json(nadjen);
        res.end();
    })
})

//READ sve grupe
app.get('/v2/grupe', async (req, res) =>{
    rezultat = [];
    await db.grupa.findAll().then((grupe) => {
        for(let i=0; i<grupe.length; i++){
            var object = {
                id:grupe[i].id,
                naziv:grupe[i].naziv,
                PredmetId:grupe[i].PredmetId
            }
            rezultat.push(object);
        }
        res.json(rezultat);
        res.end();
    })
})

//DELETE grupa
app.delete('/v2/grupa/:id', function(req, res){
    let id = req.params.id;
    db.grupa.destroy({where:{id:id}}).then((nadjen)=>{
        if(nadjen==0)
        res.json({message:"Ne postoji grupa koju pokusavate obrisati!"})
        else
        res.json({message:"Uspješno obrisana grupa!"})
    })
})

//UPDATE grupa
app.put('/v2/grupa/:id', async(req, res)=>{
    let id = req.params.id;
    let naziv = req.body.naziv;
    let predmetId=Number.parseFloat(req.body.predmetId);
    await db.grupa.findOne({where:{id:id}}).then(async (nadjen) => {
        if(nadjen !=null){
            await db.grupa.findOne({where:{naziv:naziv}}).then(async(nadjen2)=>{
                if(nadjen2==null){
                    await db.predmet.findOne({where:{id:predmetId}}).then(async (nadjen3)=>{
                        if(nadjen3!=null){
                    nadjen.naziv = naziv;
                    nadjen.predmetId = predmetId;
                    nadjen.save();
                    res.json({message:"Uspješno azurirana grupa!"})
                        }
                        else
                        res.json({message:"Ne postoji predmet sa ponudjenim id-om!"})
                    })
                }
                else
                res.json({message:"Vec postoji grupa sa tim nazivom!"})
            })
            
        }
        else{
            res.json({message:"Ne postoji grupa koju pokusavate azurirati!"})
        }
    })
})

//v2 CRUD za model Aktivnost
//CREATE aktivnost
//VALIDACIJA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.post('/v2/aktivnost', async (req, res)=>{
    let naziv = req.body.naziv;
    let pocetak =Number.parseFloat(req.body.pocetak);
    let kraj = Number.parseFloat(req.body.kraj);
    let grupa = req.body.GrupaId;
    let dan = Number.parseInt(req.body.DanId);
    let tip = Number.parseInt(req.body.TipId);
    let predmet = Number.parseInt(req.body.PredmetId);
    const pocetakRasporeda = 8; //rekao asistent
    const krajRasporeda = 20; //
    let ima = false;

    if(pocetak<0 || pocetak>24 || !Number.isInteger(pocetak*2) 
    || kraj<0 || kraj>24 || !Number.isInteger(kraj*2) || 
    kraj<=pocetak || pocetak<pocetakRasporeda || pocetak>krajRasporeda
    || kraj<pocetakRasporeda || kraj>krajRasporeda){
        res.json({message: "Aktivnost nije validna!"})
        ima = true;
        return;
    }

    await db.aktivnost.findAll().then( (aktivnosti)=>{
        for(let i=0; i<aktivnosti.length; i++){
            if(dan == aktivnosti[i].DanId){
                if((pocetak>aktivnosti[i].pocetak && pocetak<aktivnosti[i].kraj) || (kraj>aktivnosti[i].pocetak && kraj<aktivnosti[i].kraj)
                || (pocetak==aktivnosti[i].pocetak && kraj==aktivnosti[i].kraj) || (pocetak<aktivnosti[i].pocetak && kraj>aktivnosti[i].kraj)
                || (pocetak==aktivnosti[i].pocetak && kraj>aktivnosti[i].kraj)
                || (pocetak<aktivnosti[i].pocetak && kraj==aktivnosti[i].kraj) ){
                res.json({message:"Aktivnost nije validna!"});
                ima =true;
                return;
            }
            }
        }
    } )
    if(!ima){
    await db.aktivnost.create({naziv:naziv, pocetak:pocetak, kraj:kraj, GrupaId:grupa, DanId:dan, TipId:tip, PredmetId:predmet});
    res.json({message:"Uspješno dodana aktivnost!"})
    }
})

// //CREATE VISE AKTIVNOSTI
// app.post('/v2/aktivnosti', async (req,res)=>{
//     let niz = [];
//     for(let i=0; i<req.body.length;i++){
//                 await db.aktivnost.create({naziv:req.body[i].naziv, pocetak:req.body[i].pocetak, kraj:req.body[i].kraj, GrupaId:req.body[i].GrupaId, 
//                 DanId:req.body[i].DanId, TipId:req.body[i].TipId, PredmetId:req.body[i].PredmetId})

// }
//     if(niz.length!=0)
//         res.json(niz);
//     else
//         res.json({message: "Uspjesno kreirane sve aktivnosti!"})
// })

//READ aktivnost
app.get('/v2/aktivnost/:id', function(req, res){
    let id = req.params.id;
    db.aktivnost.findOne({where:{id: id}}).then((nadjen) => {
        if(nadjen==null){
            res.json({message:"Ne postoji aktivnost koju pokusavate procitati!"})
        }
        res.json(nadjen);
        res.end();
    })
})

//READ SVE aktivnosti
app.get('/v2/aktivnosti', async (req, res)=>{
    rezultat = [];
    await db.aktivnost.findAll().then((aktivnosti) => {
        for(let i=0; i<aktivnosti.length; i++){
            var object = {
                id:aktivnosti[i].id,
                naziv:aktivnosti[i].naziv,
                pocetak:aktivnosti[i].pocetak,
                kraj:aktivnosti[i].kraj,
                PredmetId:aktivnosti[i].PredmetId,
                GrupaId:aktivnosti[i].GrupaId,
                DanId:aktivnosti[i].DanId,
                TipId:aktivnosti[i].TipId
            }
            rezultat.push(object);
        }
        res.json(rezultat);
        res.end();
    })
})

//DELETE aktivnost
app.delete('/v2/aktivnost/:id', function(req, res){
    let id = req.params.id;
    db.aktivnost.destroy({where:{id:id}}).then((nadjen)=>{
        if(nadjen==0)
        res.json({message:"Ne postoji aktivnost koju pokusavate obrisati!"})
        else
        res.json({message:"Uspješno obrisana aktivnost!"})
    })
})

//UPDATE aktivnost
app.put('/v2/aktivnost/:id', async (req, res) =>{
    let id = req.params.id;
    let naziv = req.body.naziv;
    let pocetak = Number.parseFloat(req.body.pocetak);
    let kraj = Number.parseFloat(req.body.kraj);
    let grupa = Number.parseInt(req.body.GrupaId);
    let dan = Number.parseInt(req.body.DanId);
    let tip = Number.parseInt(req.body.TipId);
    let predmet = Number.parseInt(req.body.PredmetId);
    const pocetakRasporeda = 8; //rekao asistent
    const krajRasporeda = 20; //
    let ima = false;

    await db.aktivnost.findOne({where:{id:id}}).then(async (nadjen) => {
        if(nadjen !=null){

            if(pocetak<0 || pocetak>24 || !Number.isInteger(pocetak*2) 
            || kraj<0 || kraj>24 || !Number.isInteger(kraj*2) || 
            kraj<=pocetak || pocetak<pocetakRasporeda || pocetak>krajRasporeda
            || kraj<pocetakRasporeda || kraj>krajRasporeda){
            res.json({message: "Aktivnost nije validna!"})
            ima = true;
            return;
    }

    await db.aktivnost.findAll().then( (aktivnosti)=>{
        for(let i=0; i<aktivnosti.length; i++){
            if(dan == aktivnosti[i].DanId && aktivnosti[i].id!=id){
                if((pocetak>aktivnosti[i].pocetak && pocetak<aktivnosti[i].kraj) || (kraj>aktivnosti[i].pocetak && kraj<aktivnosti[i].kraj)
                || (pocetak==aktivnosti[i].pocetak && kraj==aktivnosti[i].kraj) || (pocetak<aktivnosti[i].pocetak && kraj>aktivnosti[i].kraj)
                || (pocetak==aktivnosti[i].pocetak && kraj>aktivnosti[i].kraj)
                || (pocetak<aktivnosti[i].pocetak && kraj==aktivnosti[i].kraj) ){
                res.json({message:"Aktivnost nije validna!"});
                ima =true;
                return;
            }
            }
        }
    } )
    if(!ima){
            nadjen.naziv = naziv;
            nadjen.pocetak = pocetak;
            nadjen.kraj = kraj;
            nadjen.GrupaId = grupa;
            nadjen.DanId = dan;
            nadjen.TipId = tip;
            nadjen.PredmetId = predmet;
            nadjen.save();
            res.json({message:"Uspješno azurirana aktivnost!"})
    }
        }
        else{
            res.json({message:"Ne postoji aktivnost koju pokusavate azurirati!"})
        }
    })
})


//v2 CRUD za model Dan
//CREATE dan
app.post('/v2/dan', function(req, res){
    let naziv = req.body.naziv;
    db.dan.findOne({where:{naziv: naziv}}).then((nadjen) =>{
        if(nadjen==null){
            db.dan.create({naziv:naziv});
            res.json({message:"Uspješno dodan dan!"})
        }
        else
            res.json({message:"Vec postoji dan sa nazivom " + naziv +"!"});
    })
})

//CREATE VISE DANA
app.post('/v2/dani', async (req,res)=>{
    let niz = [];
    for(let i=0; i<req.body.length;i++){
        await db.dan.findOne({where:{naziv: req.body[i].naziv}}).then(async (nadjen)=>{
            if(nadjen==null){
                await db.dan.create({naziv:req.body[i].naziv})
            }
            else{
                    niz.push("Dan " + req.body[i].naziv + " nije kreiran jer vec postoji dan sa tim nazivom!");
            }
    })
}
    if(niz.length!=0)
        res.json(niz);
    else
        res.json({message: "Uspjesno kreirani svi dani!"})
})

//READ dan
app.get('/v2/dan/:id', function(req, res){
    let id = req.params.id;
    db.dan.findOne({where:{id: id}}).then((nadjen) => {
        if(nadjen==null){
            res.json({message:"Ne postoji dan koji pokusavate procitati!"})
        }
        res.json(nadjen);
        res.end();
    })
})

//READ sve dane
app.get('/v2/dani', function(req, res){
    rezultat = [];
    db.dan.findAll().then((dani) => {
        for(let i=0; i<dani.length; i++){
            var object = {
                id:dani[i].id,
                naziv:dani[i].naziv,
            }
            rezultat.push(object);
        }
        res.json(rezultat);
        res.end();
    })
})

//DELETE dan
app.delete('/v2/dan/:id', function(req, res){
    let id = req.params.id;
    db.dan.destroy({where:{id:id}}).then((nadjen)=>{
        if(nadjen==0)
        res.json({message:"Ne postoji dan koji pokusavate obrisati!"})
        else
        res.json({message:"Uspješno obrisan dan!"})
    })
})

//UPDATE dan
app.put('/v2/dan/:id', async(req, res)=>{
    let id = req.params.id;
    let naziv = req.body.naziv;
    await db.dan.findOne({where:{id:id}}).then(async (nadjen) => {
        if(nadjen !=null){
            await db.dan.findOne({where:{naziv:naziv}}).then(async (nadjen2)=>{
                if(nadjen2==null){
            nadjen.naziv = naziv;
            nadjen.save();
            res.json({message:"Uspješno azuriran dan!"})
                }
                else
                res.json({message:"Vec postoji dan sa tim imenom!"})
            })
        }
        else{
            res.json({message:"Ne postoji dan koji pokusavate azurirati!"})
        }
    })
})

//v2 CRUD za model Tip
//CREATE tip
app.post('/v2/tip', function(req, res){
    let naziv = req.body.naziv;
    db.tip.findOne({where:{naziv: naziv}}).then((nadjen) =>{
        if(nadjen==null){
            db.tip.create({naziv:naziv});
            res.json({message:"Uspješno dodan tip!"})
        }
        else
            res.json({message:"Vec postoji tip sa nazivom " + naziv +"!"});
    })
    
})

//CREATE VISE TIPOVA
app.post('/v2/tipovi', async (req,res)=>{
    let niz = [];
    for(let i=0; i<req.body.length;i++){
        await db.tip.findOne({where:{naziv: req.body[i].naziv}}).then(async (nadjen)=>{
            if(nadjen==null){
                await db.tip.create({naziv:req.body[i].naziv})
            }
            else{
                    niz.push("Tip " + req.body[i].naziv + " nije kreiran jer vec postoji tip sa tim nazivom!");
            }
    })
}
    if(niz.length!=0)
        res.json(niz);
    else
        res.json({message: "Uspjesno kreirani svi tipovi!"})
})

//READ tip
app.get('/v2/tip/:id', function(req, res){
    let id = req.params.id;
    db.tip.findOne({where:{id: id}}).then((nadjen) => {
        if(nadjen==null){
            res.json({message:"Ne postoji tip kojeg pokusavate procitati!"})
        }
        res.json(nadjen);
        res.end();
    })
})

//READ sve tipove
app.get('/v2/tipovi', function(req, res){
    rezultat = [];
    db.tip.findAll().then((tipovi) => {
        for(let i=0; i<tipovi.length; i++){
            var object = {
                id:tipovi[i].id,
                naziv:tipovi[i].naziv,
            }
            rezultat.push(object);
        }
        res.json(rezultat);
        res.end();
    })
})

//DELETE tip
app.delete('/v2/tip/:id', function(req, res){
    let id = req.params.id;
    db.tip.destroy({where:{id:id}}).then((nadjen)=>{
        if(nadjen==0)
        res.json({message:"Ne postoji tip kojeg pokusavate obrisati!"})
        else
        res.json({message:"Uspješno obrisan tip!"})
    })
})

//UPDATE tip
app.put('/v2/tip/:id', async(req, res)=>{
    let id = req.params.id;
    let naziv = req.body.naziv;
    await db.tip.findOne({where:{id:id}}).then(async (nadjen) => {
        if(nadjen !=null){
            await db.tip.findOne({where:{naziv:naziv}}).then(async (nadjen2)=>{
                if(nadjen2==null){
            nadjen.naziv = naziv;
            nadjen.save();
            res.json({message:"Uspješno azuriran tip!"})
                }
                else
                res.json({message:"Vec postoji tip sa tim imenom!"})
            })
        }
        else{
            res.json({message:"Ne postoji tip koji pokusavate azurirati!"})
        }
    })
})

//v2 CRUD za model Student
//CREATE student
app.post('/v2/student', function(req, res){
    let ime = req.body.ime;
    let index = req.body.index;
    db.student.findOne({where:{ime: ime, index:index}}).then((nadjen) =>{
        if(nadjen==null){
            db.student.create({ime:ime, index:index});
            res.json({message:"Uspješno dodan student!"})
        }
        else
            res.json({message:"Vec postoji student sa imenom " + ime +" i indexom " + index});
    })
})

//CREATE VISE STUDENATA
app.post('/v2/studenti', async (req,res)=>{
    let niz = [];
    for(let i=0; i<req.body.length;i++){
        await db.student.findOne({where:{index: req.body[i].index}}).then(async (nadjen)=>{
            if(nadjen==null){
                await db.student.create({ime:req.body[i].ime, index:req.body[i].index})
            }
            else{
                if(nadjen.ime != req.body[i].ime)
                    niz.push("Student " + req.body[i].ime + " nije kreiran jer postoji student " + nadjen.ime + " sa indexom " + nadjen.index);
            }
    })
}
    res.json(niz);
})

//READ student
app.get('/v2/student/:id', function(req, res){
    let id = req.params.id;
    db.student.findOne({where:{id: id}}).then((nadjen) => {
        if(nadjen==null){
            res.json({message:"Ne postoji student kojeg pokusavate procitati!"})
        }
        res.json(nadjen);
        res.end();
    })
})

//READ sve studente
app.get('/v2/studenti', function(req, res){
    let rezultat = [];
    db.student.findAll().then((studenti) => {
        for(let i=0; i<studenti.length; i++){
            let object = {
                id:studenti[i].id,
                ime:studenti[i].ime,
                index:studenti[i].index
            }
            rezultat.push(object);
        }
        res.json(rezultat);
        res.end();
    })
})

//DELETE student
app.delete('/v2/student/:id', function(req, res){
    let id = req.params.id;
    db.student.destroy({where:{id:id}}).then((nadjen)=>{
        if(nadjen==0)
        res.json({message:"Ne postoji student kojeg pokusavate obrisati!"})
        else
        res.json({message:"Uspješno obrisan student!"})
    })
})

//UPDATE student 
app.put('/v2/student/:id', async (req, res) =>{
    let id = req.params.id;
    let naziv = req.body.ime;
    let index = req.body.index;
    await db.student.findOne({where:{id:id}}).then(async(nadjen) => {
        
        if(nadjen !=null){
            await db.student.findOne({where:{index:index}}).then(async (nadjen2) =>{
                if(nadjen2==null){
            nadjen.ime = naziv;
            nadjen.index = index;
            nadjen.save();
            res.json({message:"Uspješno azuriran student!"})
                }
                else
                res.json({message:"Vec postoji student sa tim indexom!"})
        })
        }
        else{
            res.json({message:"Ne postoji student kojeg pokusavate azurirati!"})
        }
    })
})


//Postavljanje student-grupa
app.put('/v2/studentGrupa', async (req, res) =>{
    let niz = req.body;
    for(let i=0; i<niz.length; i++){
    let idStudent = niz[i].idStudenta;
    let idGrupa = niz[i].idGrupe;

    await db.student.findOne({where:{id:idStudent}}).then(async (nadjenStudent)=>{
        let grupe = await nadjenStudent.getGrupe();
        if(grupe.length == 0)
            nadjenStudent.setGrupe([idGrupa]);
        else{
            let idPredmetNovi = await db.grupa.findOne({where: {id:idGrupa}});
            idPredmetNovi = idPredmetNovi.PredmetId;
            let niz = [];
            let ima = false;
            for(let i =0; i<grupe.length; i++){
            let idPredmetaStari = await db.grupa.findOne({where: {id:grupe[i].id}});
            idPredmetaStari = idPredmetaStari.PredmetId;
            if(idPredmetaStari == idPredmetNovi){
                niz.push(idGrupa);
                ima = true;
            }
            else
                niz.push(grupe[i].id)    
            }
            if(!ima)
                niz.push(idGrupa);
            nadjenStudent.setGrupe(niz);
        }    
    })

}
res.json({message:"Dodane grupe za studente!"})
})

app.listen(3000);

module.exports = app;