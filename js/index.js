//spremenljivke
// včerajšnji dan datum
var today = new Date();
var dd = String(today.getDate()-2).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '-' + dd + '-' + yyyy;
todayF = dd + '.' + mm + '.' + yyyy;

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
var clicked = [];

document.getElementById("datum").innerHTML = todayF;

// --------------------------------------------------------------------------

//Prikazi statsov
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

  render();
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

//========================================================================================================================

var leg = d3.select("#legend")
var keys = ["<50", "50-100", "100-200", "200-500", "Več kot 500"]

var color = d3.scaleOrdinal()
  .domain(keys)
  .range(["rgb(224, 236, 248)","rgb(184, 213, 234)","rgb(100, 169, 210)","rgb(30, 108, 177)","rgb(8, 48, 107)"]);

// Add one dot in the legend for each name.
var size = 18
leg.selectAll("mydots")
  .data(keys)
  .enter()
  .append("rect")
    .attr("x", 10)
    .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return color(d)})   

// Add one dot in the legend for each name.
leg.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 10 + size*1.2)
    .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)})
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    


//----------------------------------------------------------------------------------

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
  console.log(imeObcine);
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
      .style("fill", d3.interpolateBlues(parseInt(obcina)/250));
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

const render = async() => {

  let allToDate = [];
  let maleToDate = [];
  let femaleToDate = [];
  
  let perAgeData = await stats[0].statePerAgeToDate;
  let max = 0;
  
  for(let i = 0; i<Object.keys(perAgeData).length; i++){
    
    let fromAge=perAgeData[i].ageFrom;
    let toAge=perAgeData[i].ageTo;
    let ageGroup;

    if(toAge== undefined){
      ageGroup = fromAge + "+ ";
    }
    else{
      ageGroup = fromAge + "-" + toAge;
    }
    if(perAgeData[i].allToDate > max) max = perAgeData[i].allToDate;
    
    //console.log(ageGroup);
    
    allToDate.push({ageGroup:ageGroup, allToDate: perAgeData[i].allToDate});
    
  }
  //console.log(perAgeData);
  //console.log(allToDate);

  const widthGraph = 1000;
  const heightGraph = 500;
  const margin = {top:50, bottom:50, left:50, right:50};

  const svgGraph = d3.select("#graphContainer")
    .attr("height" , heightGraph - margin.top - margin.bottom)
    .attr("width" , widthGraph - margin.left - margin.right)
    .attr("viewBox", [0, 0, widthGraph, heightGraph]);

  const xScale = d3.scaleBand()
    .domain(d3.range(perAgeData.length))
    .range([margin.left, widthGraph - margin.right])
    .padding(0.1);
  
  
  const yScale = d3.scaleLinear()
    .domain([0,max])
    .range([heightGraph-margin.bottom, margin.top]);

  var Tooltip = d3.select("#graphDiv")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

  svgGraph
    .append("g")
    .attr("fill" , "royalblue")
    .selectAll("rect")
    .data(perAgeData)
    .enter().append("rect") //.join("rect")
      .attr("x", (d,i) => xScale(i))
      .attr("y", (d) => yScale(d.allToDate))
      .attr("height", d => yScale(0) - yScale(d.allToDate))
      .attr("width", xScale.bandwidth())
      .attr("class", "rectangle")
      .on("mouseover", function(d, i) {
        Tooltip
              .style("opacity", 0.9)
              .style("left", d.pageX +"px")		
              .style("top", d.pageY +"px");
        Tooltip.html(i.allToDate);
      })
      .on("mousemove", function(d,i){
        Tooltip
          .style("left", d.pageX+5 +"px")		
          .style("top", d.pageY-25 +"px");
      })
      
      .on("mouseout", function(d){
        Tooltip.style("opacity", 0)
      })



  svgGraph
    .append("g").attr("transform", `translate(0, ${heightGraph-margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(i => allToDate[i].ageGroup))
    .attr("font-size", "18px");

  svgGraph
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).ticks(null, allToDate.allToDate))
    .attr("font-size", "18px")
  
  svgGraph
    .append("text")
    .attr("x", (widthGraph/2))
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .style("font-size", "25px") 
    .text("Skupno število okužb po starostnih skupinah")
    .style("font-weigh", "bold")
    .attr("dy", "1em")
    .style("fill", "black");


  svgGraph.append("text")             
    .attr("x", (widthGraph/2))
    .attr("y", heightGraph-10)
    .style("text-anchor", "middle")
    .style("fill", "Black")
    .style("font-style", "italic")
    .text("Starostna skupina");

  svgGraph.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("x", 10)
    .attr("y", 10)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-style", "italic")
    .text("Število okužb")
    .style("fill", "Black"); 
};



