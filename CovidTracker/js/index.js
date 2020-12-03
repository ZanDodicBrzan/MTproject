
let stats = await getData(`https://api.sledilnik.org/api/Stats?from=${from}&to=${to}`);

var projection = d3.geoMercator()
.scale(15000)
.translate([200, 280])
.center([14, 46.3]);

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
const from = "2020-10-10";
const to = "2020-10-10";

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

const obcineFromTo = async(from, to, obcina) => {
let podatkiObcinZaEnMesec = await getData(`https://api.sledilnik.org/api/municipalities?from=${from}&to=${to}`);
Object.keys(podatkiObcinZaEnMesec).forEach(dan => {
    const arrayRegij = Object.values(podatkiObcinZaEnMesec[dan].regions); // array regij
    
    arrayRegij.forEach(regija => {
        Object.entries(regija).forEach(([imeObcine, podatki]) => {
          if(imeObcine == obcina){
            console.log(podatki);
            document.getElementById("active").innerHTML = podatki.activeCases;
            document.getElementById("confirmed").innerHTML = podatki.confirmedToDate;
            if(podatki.deceasedToDate==undefined) document.getElementById("deaths").innerHTML = "0";
            else document.getElementById("deaths").innerHTML = podatki.deceasedToDate;
          }
        })
    })
})
};
