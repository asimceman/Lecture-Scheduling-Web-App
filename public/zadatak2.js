
var grupe = [];
var studenti = [];
let povratniString = [];

function ucitajGrupeIStudente(){
    dajGrupe();
}

function dodajOpcije(){
    for(let i=0; i<grupe.length; i++){
        var option = document.createElement("option");
        option.text = grupe[i].naziv;
        option.value = grupe[i].naziv;
        var select = document.getElementById("grupa");
        select.appendChild(option);
    }
}

function dajGrupe(){
    let ajax = new XMLHttpRequest();
        
        ajax.onreadystatechange = function(){
            if (ajax.readyState == 4 && ajax.status == 200){
            grupe = JSON.parse(ajax.responseText);
            dodajOpcije();
            dajStudente();
          }
	          if (ajax.readyState == 4 && ajax.status == 404)
                console.log("Nemoguc GET zahtjev");   
        }
        ajax.open("GET", "http://localhost:3000/v2/grupe", true);
        ajax.send();
}

function dajStudente(){
    let ajax2 = new XMLHttpRequest();
        
    ajax2.onreadystatechange = function(){
        if (ajax2.readyState == 4 && ajax2.status == 200){
        studenti = JSON.parse(ajax2.responseText);
      }
          if (ajax2.readyState == 4 && ajax2.status == 404)
            console.log("Nemoguc GET zahtjev");   
    }
    ajax2.open("GET", "http://localhost:3000/v2/studenti", true);
    ajax2.send();
}


function dajNoveIdove(nizStudenata, idGrupe){
    let novi = [];
    for(let i=0; i<studenti.length; i++){
        for(let j=0; j<nizStudenata.length; j++){
            if(nizStudenata[j].ime == studenti[i].ime && nizStudenata[j].index == studenti[i].index)
                novi.push({id:studenti[i].id});
        }
    }
    dodijeliGrupu(novi, idGrupe)
}

function azurirajStudente(nizStudenata, idGrupe){
    let ajax2 = new XMLHttpRequest();
        
    ajax2.onreadystatechange = function(){
        if (ajax2.readyState == 4 && ajax2.status == 200){
        studenti = JSON.parse(ajax2.responseText);
        dajNoveIdove(nizStudenata, idGrupe);
      }
          if (ajax2.readyState == 4 && ajax2.status == 404)
            console.log("Nemoguc GET zahtjev");   
    }
    ajax2.open("GET", "http://localhost:3000/v2/studenti", true);
    ajax2.send();
}

function ispisiPovratniString(povratniString){
    if(povratniString.length==0){
        document.getElementById('unos').value="";
    }
    else{
        for(let i=0; i<povratniString.length; i++){
            if(i==0)
                document.getElementById('unos').value=povratniString[i];
            else
                document.getElementById('unos').value+="\n" + povratniString[i]; 
        }
    }
}

function dodajNoveStudente(nizStudenata, idGrupe){
            let ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function(){
                if (ajax.readyState == 4 && ajax.status == 200){
                    povratniString = JSON.parse(ajax.responseText);
                    ispisiPovratniString(povratniString);
                    azurirajStudente(nizStudenata, idGrupe);
              }
                  if (ajax.readyState == 4 && ajax.status == 404)
                    console.log("Nemoguc GET zahtjev");   
            }
            ajax.open("POST", "http://localhost:3000/v2/studenti", true);
            ajax.setRequestHeader("Content-Type", "application/json");
            ajax.send(JSON.stringify(nizStudenata));
}

function dodijeliGrupu(nizStudenata, idGrupe){
    let niz = [];
    for(let i=0; i<nizStudenata.length; i++){
        let data = {idStudenta:nizStudenata[i].id, idGrupe:idGrupe}
        niz.push(data);
    }
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
        if (ajax.readyState == 4 && ajax.status == 200){
            ispisiPovratniString(povratniString);
      }
          if (ajax.readyState == 4 && ajax.status == 404)
            console.log("Nemoguc GET zahtjev");   
    }
    ajax.open("PUT", "http://localhost:3000/v2/studentGrupa", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(niz));
}

function dajIdGrupe(grupaNaziv){
    for(let i=0; i<grupe.length; i++){
        if(grupe[i].naziv == grupaNaziv)
            return grupe[i].id;
    }
}

function napraviStudente(){
    povratniString= [];
    var niz = document.getElementById('unos').value;
    var grupaNaziv = document.getElementById('grupa').value;
    let idGrupe = dajIdGrupe(grupaNaziv);
    var linije = niz.split('\n');
    let noviStudenti = [];
    let objekat = {};
    for(var i=0;i<linije.length;i++){
        var currentline=linije[i].split(",");
        objekat = {
            ime:currentline[0],
            index:currentline[1]
        }
        let ima = false;
            noviStudenti.push(objekat);

    }
    dodajNoveStudente(noviStudenti, idGrupe);
}