// včerajšnji dan datum
var today = new Date();
var dd = String(today.getDate()-2).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '-' + dd + '-' + yyyy;

let stats;
let from = today;
let to = today;

var obcine = new Map();
var min = 999999999;
var max = 0;

const obcineFromTo = async(from, to, obcina) => {
  let podatkiObcinZaEnMesec = await getData(`https://api.sledilnik.org/api/municipalities?from=${from}&to=${to}`);
  let stats = await getData(`https://api.sledilnik.org/api/Stats?from=${from}&to=${to}`);
  
  
  Object.keys(podatkiObcinZaEnMesec).forEach(dan => {
      const arrayRegij = Object.values(podatkiObcinZaEnMesec[dan].regions); // array regij
  
      arrayRegij.forEach(regija => {
        obcine = Object.assign(obcine, regija);
        Object.entries(regija).forEach(([imeObcine, podatki]) => {

            // map za podatke občin in min in max kativnih primerov
            var podatek = podatki.activeCases;
            obcine.set(imeObcine, podatek);
            if (podatki.activeCases > max ) max = podatki.activeCases;
            if (podatki.activeCases < min ) min = podatki.activeCases;

            if(imeObcine == obcina){
  
              if(podatki.activeCases==undefined) document.getElementById("active").innerHTML = "0";
              else document.getElementById("active").innerHTML = podatki.activeCases;
  
              if(podatki.confirmedToDate==undefined) document.getElementById("confirmed").innerHTML = "0";
              else document.getElementById("confirmed").innerHTML = podatki.confirmedToDate;
              
              if(podatki.deceasedToDate==undefined) document.getElementById("deaths").innerHTML = "0";
              else document.getElementById("deaths").innerHTML = podatki.deceasedToDate;
            }
            //ni izbrane občine -> prikazujemo skupne podatke za slovenijo
            if(obcina == "none"){
              
              if(stats[0].cases.active==undefined) document.getElementById("active").innerHTML = "0";
              else document.getElementById("active").innerHTML = stats[0].cases.active;
  
              if(stats[0].positiveTests==undefined) document.getElementById("confirmed").innerHTML = "0";
              else document.getElementById("confirmed").innerHTML = stats[0].positiveTests;
              
              if(stats[0].statePerTreatment.deceased==undefined) document.getElementById("deaths").innerHTML = "0";
              else document.getElementById("deaths").innerHTML = stats[0].statePerTreatment.deceased;
  
            }
          })
      })
  })
  };

//prikazi današnje statse
const DisplayCurrent = async() => {
    stats= await getData(`https://api.sledilnik.org/api/Stats?from=${today}&to=${today}`);
    
    document.getElementById("deceased-today").innerHTML = stats[0].statePerTreatment.deceased;
    document.getElementById("active-today").innerHTML = stats[0].cases.active;
    document.getElementById("confirmed-on-date").innerHTML = stats[0].positiveTests;
    document.getElementById("tests-today").innerHTML = stats[0].performedTests;
};
DisplayCurrent();
obcineFromTo(from,to,"none");

// ko daš miško čez
function handleMouseover(d) {
  d3.select('#zemljevid .obcina')
    .text(d.toElement.className);
  
  let obcina = (d.toElement.className).replace(/\s+/g, '_').toLowerCase();
  obcineFromTo(from, to, obcina);
  
  d3.select(this)
    .transition()
    .duration('50')
    .attr('opacity', '.60')
}
  
  // ko daš miško dol
function handleMouseout(d) {
  d3.select('#zemljevid .obcina')
    .text("Skupno v Sloveniji");

  let obcina = "none";
  obcineFromTo(from, to, obcina);

  d3.select(this)
    .transition()
    .duration('50')
    .attr('opacity', '1')
}

// ko klikneš ni še dopolnjeno tu damo statse in to nekam prikažemo in to
function onClick(d) {
  d3.select(this)
  .transition()
  .duration('50')
  .style("fill", "#e35d6a");
}

var projection = d3.geoMercator()
.scale(16000)
.translate([200, 280])
.center([13.85, 46.3]);

var geoGenerator = d3.geoPath()
.projection(projection);

//color = d3.scaleQuantize([1, 7], d3.schemeBlues[6])

// update live 
function update(geojson) {
var u = d3.select('#zemljevid g.map')
  .selectAll('path')
  .data(geojson.features)

u.enter()
  .append('path')
  .attr("stroke", "#000")
  .attr("stroke-width", 0.5)
  .attr('d', geoGenerator)
  .on('mouseover', handleMouseover)
  .on('mouseout', handleMouseout)
  .on("click", onClick)
}

var tmp = "";
// podatki ----------------------------------------------------------
/*d3.json('data/svn_regional.geojson', function(err, json) {
console.log(err)  
tmp = json;
update(json)
})*/

d3.json("data/svn_regional.geojson")
  .then(function(json){
    tmp = json;
    update(json)
  });

// funkcija za pridobivanje podatkov
async function getData(url) {
return fetch(url)
    .then(res => {
            if (!res.ok) {
                throw new Error(res.error);
            }
            return res;
    })
    .then(res => res.json())
    .catch(err => console.log(err));
}

//izbira datuma
$( function() {
	$( "#datepicker" ).datepicker({
		dateFormat: "dd-mm-yy"
		,	duration: "fast"
  });
  
});

let datum = document.getElementById("date");

datum.addEventListener('change' , async(event) =>{  
  from = document.getElementById("date").value;
  to = document.getElementById("date").value;
  let stats = await getData(`https://api.sledilnik.org/api/Stats?from=${from}&to=${to}`);

  obcineFromTo(from,to,"none");
  //console.log(stats[0]);
  //document.getElementById("active-on-date").innerHTML = stats[0].performedTests;
  //document.getElementById("confirmed-on-date").innerHTML = stats[0].positiveTests;
  
  let deaths = stats[0].deceasedPerAgeToDate;
  for(let i = 0; i<Object.keys(deaths).length; i++){
    if("allToDate" in deaths[i]){
      //console.log(deaths[i].allToDate);
    }
    else{
      //console.log("0");
    }
  }

});
