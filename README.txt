Rute za prvi zadatak spirale 4 se nalaze u fajlu spirala4.js.
Kod za drugi zadatak se nalazi u folderu Public pod nazivom zadatak2.js.
Kod za treci zadatak se nalazi u script tagu unosRasporeda.html koji se nalazi u public folderu.

Rute koje su implementirane za spiralu 4 su:

GET RUTE koje citaju jedan element koji ima id proslijedjen unutar url-a:
/v2/predmet/:id
/v2/grupa/:id
/v2/aktivnost/:id
/v2/dan/:id
/v2/tip/:id
/v2/student/:id

GET RUTE koje citaju sve elemente i vracaju ih unutar niza objekata:
/v2/predmeti
/v2/grupe
/v2/aktivnosti
/v2/dani
/v2/tipovi
/v2/studenti

POST RUTE koje kreiraju samo jedan objekat, a informacije se salju u jsonu:
/v2/predmet
/v2/grupa
/v2/aktivnost
/v2/dan
/v2/tip
/v2/student

POST RUTE koje kreiraju vise objekata koji su proslijedjeni unutar niza u json formatu:
/v2/predmeti
/v2/grupe
/v2/dani
/v2/tipovi
/v2/studenti

DELETE RUTE koje brisu objekat ciji je id poslan u URL-u:
/v2/predmet/:id
/v2/grupa/:id
/v2/aktivnost/:id
/v2/dan/:id
/v2/tip/:id
/v2/student/:id

PUT RUTE koje updatuju u bazi onaj element ciji je id poslan u URL-u a podaci za update su u json formatu:
/v2/predmet/:id
/v2/grupa/:id
/v2/aktivnost/:id
/v2/dan/:id
/v2/tip/:id
/v2/student/:id