
// včerajšnji dan datum
var today = new Date();
var dd = String(today.getDate()-1).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today =mm + '-' + dd + '-' + yyyy;
//console.log(today);
let stats;
//prikazi današnje statse
const DisplayCurrent = async() => {
    stats= await getData(`https://api.sledilnik.org/api/Stats?from=${today}&to=${today}`);
    
    document.getElementById("deceased-today").innerHTML = stats[0].statePerTreatment.deceased;
    document.getElementById("active-today").innerHTML = stats[0].cases.active;
    document.getElementById("confirmed-on-date").innerHTML = stats[0].positiveTests;
    document.getElementById("tests-today").innerHTML = stats[0].performedTests;
};
DisplayCurrent();

const values = async() => {
    return d.value.properties.confirmed;
};

const minVal = d3.min(values);
const maxVal = d3.max(values);

const color = d3
    .scaleLinear()
    .domain([minVal, 1, maxVal])
    .range(["#eee", "#fee", "#f00"]);



var projection = d3.geoMercator()
.scale(16000)
.translate([200, 280])
.center([13.85, 46.3]);

var geoGenerator = d3.geoPath()
.projection(projection);

// ko daš miško čez
function handleMouseover(d) {
d3.select('#zemljevid .obcina')
  .text(d.properties.name);

let obcina = (d.properties.name).replace(/\s+/g, '_').toLowerCase();
obcineFromTo(from, to, obcina);

d3.select(this)
  .transition()
  .duration('50')
  .attr('opacity', '.60')
  //.style("stroke", "black"); obroba ne dela for some reason xddd
}

// ko daš miško dol
function handleMouseout(d) {
d3.select('#zemljevid .obcina')
  .text("Nič");

d3.select(this)
  .transition()
  .duration('50')
  .attr('opacity', '1')
  //.style("stroke", "white");
}

// ko klikneš ni še dopolnjeno tu damo statse in to nekam prikažemo in to
function onClick(d) {
  d3.select(this)
  .transition()
  .duration('50')
  .style("fill", "#e35d6a");
}

// update live 
function update(geojson) {
var u = d3.select('#zemljevid g.map')
  .selectAll('path')
  .data(geojson.features);

u.enter()
  .append('path')
  .attr("stroke", "#000")
  .attr("stroke-width", 0.5)
  .attr("fill", function(d, i) {
    return color(d.properties.confirmed);})
  .attr('d', geoGenerator)
  .on('mouseover', handleMouseover)
  .on('mouseout', handleMouseout)
  .on("click", onClick)
}


// podatki ----------------------------------------------------------
d3.json('data/svn_regional.geojson', function(err, json) {
update(json)
})

//const from = _id("from").value;
//const to =  _id("to").value;
let from = today;
let to = today;

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

let obcine = {};

const obcineFromTo = async(from, to, obcina) => {
let podatkiObcinZaEnMesec = await getData(`https://api.sledilnik.org/api/municipalities?from=${from}&to=${to}`);
Object.keys(podatkiObcinZaEnMesec).forEach(dan => {
    const arrayRegij = Object.values(podatkiObcinZaEnMesec[dan].regions); // array regij

    arrayRegij.forEach(regija => {
      obcine = Object.assign(obcine, regija);
      Object.entries(regija).forEach(([imeObcine, podatki]) => {
          if(imeObcine == obcina){
            //console.log(podatki);
            document.getElementById("active").innerHTML = podatki.activeCases;
            document.getElementById("confirmed").innerHTML = podatki.confirmedToDate;
            if(podatki.deceasedToDate==undefined) document.getElementById("deaths").innerHTML = "0";
            else document.getElementById("deaths").innerHTML = podatki.deceasedToDate;
          }
        })
    })
})
};

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
console.log(stats);