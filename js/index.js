//spremenljivke
// včerajšnji dan datum
var today = new Date();
var dd = String(today.getDate()-2).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();


today = mm + '-' + dd + '-' + yyyy;
todayF = dd + '.' + mm + '.' + yyyy;
mm--
if(mm <= 0) {
  mm = 12;
  yyyy = yyyy-1;
}
let monthAgo = mm + "-" + dd + "-" + yyyy; 

let stats;
let summary;
let statsMonth;
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
//document.getElementById("dateTo").valueAsDate = new Date(Date.now() - 864e5);
document.getElementById("dateFrom").valueAsDate = new Date(Date.now() - 864e5);


// --------------------------------------------------------------------------

//Prikazi statsov
const DisplayCurrent = async() => {
  stats= await getData(`https://api.sledilnik.org/api/Stats?from=${today}&to=${today}`);
  summary = await getData(`https://api.sledilnik.org/api/summary?toDate=${today}`);
  statsMonth = await getData(`https://api.sledilnik.org/api/Stats?from=${monthAgo}&to=${today}`);

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
  document.getElementById("avg7").innerHTML = (summary.casesAvg7Days.value).toFixed(2);
  document.getElementById("dead").innerHTML = summary.deceasedToDate.value;

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
  update();
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

function update() {
  d3.select('#zemljevid g.map').selectAll('path').attr('fill', function(d) {
    let neki = d.properties.name.replace(/\s+/g, '_').toLowerCase()
    let obci = obcine.get(neki)
    return d3.interpolateBlues(parseInt(obci)/250);
  });
}


var projection = d3.geoMercator()
.scale(16000)
.translate([200, 280])
.center([13.85, 46.3]);

var geoGenerator = d3.geoPath()
.projection(projection);

// initial display 
function init(geojson) {
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
    init(globalGeoJson);
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


//------------------------------------------------------------=======
//izbira datuma
$( function() {
	$( "#datepicker" ).datepicker({
    dateFormat: "dd-mm-yy",
    duration: "fast"
  });
  
});

let datum = document.getElementById("dateFrom");
//let datumDo = document.getElementById("dateTo");

datum.addEventListener('change' , async(event) =>{  
  from = document.getElementById("dateFrom").value || today;
  //to = document.getElementById("dateTo").value || today;
  getBetweenDates(from, from);
  obcineFromTo("none");
  update();  
});

/*
datumDo.addEventListener('change' , async(event) =>{  
  from = document.getElementById("dateFrom").value || today;
  to = document.getElementById("dateTo").value || today;
  getBetweenDates(from, to);
  obcineFromTo("none");
  update();
});
*/

// =============================================================================

const render = async() => {

  let allToDate = [];
  
  
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
    
    allToDate.push({ageGroup:ageGroup, allToDate: perAgeData[i].allToDate});
  }

  let regions = await stats[0].statePerRegion;
  let maxRegions = 0;

  let perRegion =[];
  perRegion.push({name:"Savinjska" , infected:regions.ce});
  perRegion.push({name:"Posavska", infected:regions.kk});
  perRegion.push({name:"Obalno-kraška" , infected:regions.kp});
  perRegion.push({name:"Gorenjska" , infected:regions.kr});
  perRegion.push({name:"Osrednjeslovenska" , infected:regions.lj});
  perRegion.push({name:"Podravska" , infected:regions.mb});
  perRegion.push({name:"Pomurska" , infected:regions.ms});
  perRegion.push({name:"Goriška" , infected:regions.ng});
  perRegion.push({name:"Jugovzhodna" , infected:regions.nm});
  perRegion.push({name:"Primorsko-notranjska" , infected:regions.po});
  perRegion.push({name:"Koroška" , infected:regions.sg});
  perRegion.push({name:"Zasavska" , infected:regions.za});
  
  for(let regija in perRegion){
    if(perRegion[regija].infected > maxRegions) maxRegions = perRegion[regija].infected;
  }

  //_______________________________________________1. graf
  let widthGraph = 1000;
  let heightGraph = 500;
  let margin = {top:50, bottom:50, left:50, right:50};

  const svgGraph = d3.select("#graphContainer")
    .attr("height" , heightGraph - margin.top - margin.bottom)
    .attr("width" , widthGraph - margin.left - margin.right)
    .attr("viewBox", [0, 0, widthGraph, heightGraph]);

  let xScale = d3.scaleBand()
    .domain(d3.range(perAgeData.length))
    .range([margin.left, widthGraph - margin.right])
    .padding(0.1);
  
  
  let yScale = d3.scaleLinear()
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
        Tooltip.html("Število okužb: " + i.allToDate);
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
  
    //___________________________________2.graf

    widthGraph = 1000;
    heightGraph = 500;
    margin = {top:50, bottom:100, left:50, right:10};

  //definiraj svg za graf
  const svgGraph2 = d3.select("#graphContainer2")
    .attr("height" , heightGraph - margin.top - margin.bottom)
    .attr("width" , widthGraph - margin.left - margin.right)
    .attr("viewBox", [0, 0, widthGraph, heightGraph]);

  // skaliranje za x os  
  xScale = d3.scaleBand()
    .domain(d3.range(perRegion.length))
    .range([margin.left, widthGraph - margin.right])
    .padding(0.1);
  
  // skaliranje za y os
  yScale = d3.scaleLinear()
    .domain([0,maxRegions])
    .range([heightGraph-margin.bottom, margin.top]);

  //Ustvarjanje tooltip - prikaže se na mouseover
  var Tooltip = d3.select("#graphDiv")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

  //dodajanje bars na svg
  svgGraph2
    .append("g")
    .attr("fill" , "royalblue")
    .selectAll("rect")
    .data(perRegion.sort((a,b) => d3.ascending(a.infected, b.infected)))
    .enter().append("rect") //.join("rect")
      .attr("x", (d,i) => xScale(i))
      .attr("y", (d) => yScale(d.infected))
      .attr("height", d => yScale(0) - yScale(d.infected))
      .attr("width", xScale.bandwidth())
      .attr("class", "rectangle")
      .on("mouseover", function(d, i) {
        Tooltip
              .style("opacity", 0.9)
              .style("left", d.pageX +"px")		
              .style("top", d.pageY +"px");
        Tooltip
          .html("Regija: " + i.name + "<br>" + "Število okužb: " + i.infected)
      })
      .on("mousemove", function(d,i){
        Tooltip
          .style("left", d.pageX+5 +"px")		
          .style("top", d.pageY-50 +"px");
      })
      
      .on("mouseout", function(d){
        Tooltip.style("opacity", 0)
      })


  //x axis
  svgGraph2
    .append("g")
    .attr("transform", `translate(0, ${heightGraph-margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(i => perRegion[i].name))
    .selectAll("text")
    .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-25)")
    .attr("font-size", "15px")
    

  //y axis
  svgGraph2
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).ticks(null, perRegion.infected))
    .attr("font-size", "18px")
    
  
  //naslov
  svgGraph2
    .append("text")
    .attr("x", (widthGraph/2))
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .style("font-size", "25px") 
    .text("Skupno število okužb po regijah")
    .style("font-weigh", "bold")
    .attr("dy", "1em")
    .style("fill", "black");

//label x
  svgGraph2.append("text")             
    .attr("x", (widthGraph/2))
    .attr("y", heightGraph-10)
    .style("text-anchor", "middle")
    .style("fill", "Black")
    .style("font-style", "italic")
    .text("Regija");
//label y
  svgGraph2.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("x", 10)
    .attr("y", 10)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-style", "italic")
    .text("Število okužb")
    .style("fill", "Black"); 
  


//____________________3.graf
let statsPerDay = [];
let maxStatsPerDay = 0;

widthGraph = 1000;
heightGraph = 800;
margin = {top:50, bottom:100, left:50, right:50};

for(let dan in statsMonth){
  let tempdate = statsMonth[dan].year + "-" + statsMonth[dan].month + "-" +  statsMonth[dan].day;
  //console.log(tempdate);
  //console.log(Date.parse(tempdate));
  statsPerDay.push({day: tempdate, positiveTests: statsMonth[dan].positiveTests});
  if(statsMonth[dan].positiveTests > maxStatsPerDay) maxStatsPerDay = statsMonth[dan].positiveTests; 
}
console.log(statsPerDay);

const svgGraph3 = d3.select("#graphContainer3")
    .attr("height" , heightGraph - margin.top - margin.bottom)
    .attr("width" , widthGraph - margin.left - margin.right)
    .attr("viewBox", [0, 0, widthGraph, heightGraph]);
/*
  // skaliranje za x os
  xScale = d3.scaleLinear()
    .domain(d3.range(statsPerDay.length))
    .range([margin.left, widthGraph - margin.right]);
*/
  xScale = d3.scaleLinear()
    .domain([0, statsPerDay.length])
    .range([0, widthGraph]);
  
  // skaliranje za y os
  yScale = d3.scaleLinear()
    .domain([0,maxStatsPerDay])
    .range([heightGraph-margin.bottom, margin.top]);

  //line generator
  let line = d3.line()
    .x(function(d,i) { return xScale(i);})
    .y(function(d) {return yScale(d.positiveTests)})
    .curve(d3.curveMonotoneX);
  
  //x axis
  svgGraph3
    .append("g")
    .attr("transform", `translate(0, ${heightGraph-margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(i => statsPerDay[i].day))
    .selectAll("text")
    .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
    .attr("font-size", "15px")

  //y axis  
  svgGraph3
    .append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale));
  
  //graf
  svgGraph3
    .append("path")
    .datum(statsPerDay)
    .attr("class", "line")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke-width", "1.5px")
    .style("stroke", "royalblue");

  svgGraph3.selectAll(".dot")
    .data(statsPerDay)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", function(d, i){ return xScale(i)})
      .attr("cy", function(d){ return yScale(d.positiveTests)})
      .attr("r", 8)
      .on("mouseover", function(d, i) {
        Tooltip
              .style("opacity", 0.9)
              .style("left", d.pageX +"px")		
              .style("top", d.pageY +"px");
        Tooltip
          .html("Datum " + i.day + "<br>" + "Število potrjenih testov: " + i.positiveTests)
        d3.select(this)
        .transition()
        .duration(300)
        .attr('opacity', 0.6)
        .attr("r", 15)
      })
      .on("mousemove", function(d,i){
        Tooltip
          .style("left", d.pageX+5 +"px")		
          .style("top", d.pageY-50 +"px");
      })
      
      .on("mouseout", function(d){
        Tooltip.style("opacity", 0);
        d3.select(this)
        .transition()
        .duration(300)
        .attr('opacity', 1)
        .attr("r", 8)
      })

    //naslov
  svgGraph3
    .append("text")
    .attr("x", (widthGraph/2))
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .style("font-size", "25px") 
    .text("Število pozitivnih testov - zadnji mesec")
    .style("font-weigh", "bold")
    .attr("dy", "1em")
    .style("fill", "black");

  //label x
  svgGraph3.append("text")             
    .attr("x", (widthGraph/2))
    .attr("y", heightGraph-10)
    .style("text-anchor", "middle")
    .style("fill", "Black")
    .style("font-style", "italic")
    .text("Datum");
  //label y
  svgGraph3.append("text")
    //.attr("transform", "rotate(-90)")
    .attr("x", 10+ margin.left)
    .attr("y", 10)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-style", "italic")
    .text("Število pozitivnih testov")
    .style("fill", "Black"); 
};