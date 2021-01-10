//spremenljivke
// včerajšnji dan datum
var today = new Date();
var dd = String(today.getDate()-1).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '-' + dd + '-' + yyyy;

let stats;
let summary;
let from = today;
let to = today;
let deathsPerAge;

var obcine = new Map();
var min = 999999999;
var max = 0;
var globalGeoJson;
let podatkiObcinZaEnMesec;

// --------------------------------------------------------------------------

//prikazi današnje statse
const DisplayCurrent = async() => {
  stats= await getData(`https://api.sledilnik.org/api/Stats?from=${today}&to=${today}`);
  summary = await getData(`https://api.sledilnik.org/api/summary?toDate=${today}`);

  document.getElementById("deceased-today").innerHTML = stats[0].statePerTreatment.deceased;
  document.getElementById("active-today").innerHTML = stats[0].cases.active;
  document.getElementById("confirmed-on-date").innerHTML = stats[0].positiveTests;
  document.getElementById("tests-today").innerHTML = stats[0].performedTests;
  document.getElementById("tests-hat").innerHTML = summary.testsTodayHAT.value;
  document.getElementById("tests-pcr").innerHTML = summary.testsToday.value;
  document.getElementById("vaccinated").innerHTML = summary.vaccinationSummary.value;
  document.getElementById("hospital").innerHTML = summary.hospitalizedCurrent.value;
  document.getElementById("intense").innerHTML = summary.icuCurrent.value;
  document.getElementById("goodOut").innerHTML = summary.hospitalizedCurrent.subValues.out;
};

DisplayCurrent();

//--------------------------------------------------------------------------------------

const getBetweenDates = async (from, to) => {
  podatkiObcinZaEnMesec = getData(`https://api.sledilnik.org/api/municipalities?from=${from}&to=${to}`);
  stats = getData(`https://api.sledilnik.org/api/Stats?from=${from}&to=${to}`);
};
getBetweenDates(from, to)

const obcineFromTo = async (obcina) => {
  let podatkiObcin = await podatkiObcinZaEnMesec;
  let statsi = await stats;
  
  Object.keys(podatkiObcin).forEach(dan => {
      const arrayRegij = Object.values(podatkiObcin[dan].regions); // array regij
  
      arrayRegij.forEach(regija => {
        //obcine = Object.assign(obcine, regija);
        Object.entries(regija).forEach(([imeObcine, podatki]) => {
            // map za podatke občin in min in max aktivnih primerov
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
          })
      })
  })
  update(globalGeoJson);
};

// ko daš miško čez
function handleMouseover(d,a) {
  d3.select('#zemljevid .obcina')
    .text(a.properties.name);
  
  let obcina = (a.properties.name).replace(/\s+/g, '_').toLowerCase();
  
  obcineFromTo(obcina);
  
  d3.select(this)
    .transition()
    .duration('50')
    .attr('opacity', '.60')
}
  
  // ko daš miško dol
function handleMouseout(d) {
  d3.select('zemljevid .obcina')
    .text("Skupno v Sloveniji");

  let obcina = "none";
  obcineFromTo(obcina);

  d3.select(this)
    .transition()
    .duration('50')
    .attr('opacity', '1')
}

// onClick --------------------------------------------------------------------
function onClick(e, d) {
  const imeObcine = d.properties.name.replace(/\s+/g, '_').toLowerCase();
  if (!clicked.includes(imeObcine)) {
    clicked.push(imeObcine)
    d3.select(this)
      .transition()
      .duration('50')
      .style("fill", "#e35d6a");
  } else {
    clicked = clicked.filter(ime => ime !== imeObcine);
    let obcina = obcine.get(imeObcine)
    d3.select(this)
      .transition()
      .duration('50')
      .style("fill", d3.interpolateBlues(1-parseInt(obcina)/1001));
  }
}

// glaven prikaz -------------------------------------------------------------------

var projection = d3.geoMercator()
.scale(16000)
.translate([200, 280])
.center([13.85, 46.3]);

var geoGenerator = d3.geoPath()
.projection(projection);

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
    .attr("fill", function(d){
      let neki = d.properties.name.replace(/\s+/g, '_').toLowerCase()
      let obci = obcine.get(neki)
      //console.log(neki, obci)
      return d3.interpolateBlues(parseInt(obci)/250)})
  .on('mouseover', handleMouseover)
  .on('mouseout', handleMouseout)
  .on("click", onClick)
}


// podatki ----------------------------------------------------------
d3.json("data/svn_regional.geojson")
  .then(function(json){
    globalGeoJson = json;
    obcineFromTo("none");
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
    dateFormat: "dd-mm-yy",
    duration: "fast"
  });
  
});


//------------------------------------------------------------

let datum = document.getElementById("dateFrom");
let datumDo = document.getElementById("dateTo");

datum.addEventListener('change' , async(event) =>{  
  from = document.getElementById("dateFrom").value || today;
  to = document.getElementById("dateTo").value || today;
  getBetweenDates(from, to);
  obcineFromTo("none");
  update(globalGeoJson);
  render();  
});

datumDo.addEventListener('change' , async(event) =>{  
  from = document.getElementById("dateFrom").value || today;
  to = document.getElementById("dateTo").value || today;
  getBetweenDates(from, to);
  obcineFromTo("none");
  update(globalGeoJson);
  render();  
});


// =============================================================================

var tip = d3.select(".chart-container")
	.append("div")
  .attr("class", "tip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");

var svg = d3.select("svg").attr("class", "background-style"),
    margin = {top: 20, right: 20, bottom: 42, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.05),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
/*d3.json("apiPlaceholderURL", function(error, data) {
  //if (error) throw error;

  data = deathsPerAge;
  
  x.domain(data.map(function(d) { return d.age_group; }));
  y.domain([0, d3.max(data, function(d) { return d.deaths; })]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
   .append("text")
      .attr("y", 6)
      .attr("dy", "2.5em")
      .attr("dx", width/2 - margin.left)
      .attr("text-anchor", "start")
      .text("Grad Year");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Student Count");
 

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.age_group); })
      .attr("y", function(d) { return y(d.deaths); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.deaths)})
      .on("mouseover", function(d) {return tip.text(d.deaths).style("visibility", "visible").style("top", y(d.deaths) - 13+ 'px' ).style("left", x(d.age_group) + x.bandwidth() - 12 + 'px')})
	    //.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){return tip.style("visibility", "hidden");});
});
*/




const render = async(x) => {

  deathsPerAge = [];
  
  let deaths = stats[0].deceasedPerAgeToDate;
  let max = 0;

  for(let i = 0; i<Object.keys(deaths).length; i++){
    if("allToDate" in deaths[i]){
      let fromAge=deaths[i].ageFrom;
      let toAge=deaths[i].ageTo;
      if(toAge== undefined){
        ageGroup = fromAge + "+ ";
      }
      else{
        ageGroup = fromAge + "-" + toAge;
      }
      if(deaths[i].allToDate>max) max = deaths[i].allToDate;
      deathsPerAge.push({age_group:ageGroup, deaths:deaths[i].allToDate});
      

    }
    else{
      ageGroup = deaths[i].ageFrom + "-" + deaths[i].ageTo;
      deathsPerAge.push({age_group:ageGroup, deaths:0});
    }
  }


  //console.log(deathsPerAge);
  
  const widthGraph = 800;
  const heightGraph = 400;
  const margin = {top:50, bottom:50, left:50, right:50};

  const svgGraph = d3.select("#graphContainer")
    .append("svg")
    .attr("height" , heightGraph - margin.top - margin.bottom)
    .attr("width" , widthGraph - margin.left - margin.right)
    .attr("viewBox", [0, 0, widthGraph, heightGraph]);

  const xAxis = d3.scaleBand()
    .domain(d3.range(deathsPerAge.length))
    .range([margin.left, widthGraph - margin.right])
    .padding(0.1);
  
  
  const yAxis = d3.scaleLinear()
    .domain(0,max)
    .range([heightGraph-margin.bottom-margin.top]);

  svgGraph
    .append("g")
    .attr("fill" , "royalblue")
    .selectAll("rect")
    .data(deathsPerAge.sort((a,b) => d3.descending(a.age_group, b.deaths)))
    .join("rect")
      .attr("x", (d,i) => xAxis(i))
      .attr("y", (d) => yAxis(d.deaths))
      .attr("height", d => yAxis(0) - yAxis(d.deaths))
      .attr("width", xAxis.bandwidth());
  
  svg.node();

};

render(stats);



