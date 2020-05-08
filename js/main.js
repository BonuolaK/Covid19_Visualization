var _products = null;
var _users = null;
var _orders = null;
var _productLength = 10;
var _periodProductLength = 5;
var _curWorldMap = [];

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

(async () => {

_countryData = await d3.csv("dataset/country-info.csv");
_covidData = await d3.csv("dataset/owid-covid-data.csv");

loadWorldMap();

_ausCovidData = [];
_nzCovidData = [];
_inCovidData = [];
_pgCovidData = [];
_worldData = [];

_covidData.map((d)=> {
    	
    	if(d.iso_code == 'AUS')
    		_ausCovidData.push(d);

    	if(d.iso_code == 'NZL')
    		_nzCovidData.push(d);

    	if(d.iso_code == 'IDN')
    		_inCovidData.push(d);

    	if(d.iso_code == 'PNG')
    		_pgCovidData.push(d);

    	if(d.location == 'World')
    		_worldData.push(d);
    	
 });


loadLineChart();
//renderLine2();
})();


function loadLineChart(){

	$('body').find('span.legend').remove();

	var startDate = moment($('#inputStartDate').val(), 'YYYY-MM-DD');
	var endDate = moment($('#inputEndDate').val(), 'YYYY-MM-DD');
	var locations = $('#ddlCasesWorld').val();

	locations.push('AUS');

	let hasFilter = 0;

	if(startDate.isValid() && endDate.isValid())
		 hasFilter = 1;
		
	let casesData = [];
	let newCaseData = [];
	let deathData = [];
	let mortalityTimeData = [];


	let maxCase = 0;
	let maxNewCase = 0;
	let maxDeath = 0;
	let maxMor = 0;


	for(var i = 0; i< locations.length;i++){

		var countryName = ''
		if(locations[i] == "WORLD")
			countryName = 'World';
		else{
			 countryName = (_countryData.filter((d)=> d.iso_code == locations[i])[0]).country;
		}
			// load country data
			
			
			let mapCasesData = {category: countryName, datapoints:[]};
			let mapNewCasesData = {category: countryName, datapoints:[]};
			let mapDeathData = {category: countryName, datapoints:[]};
			let mapMortalityData = {category: countryName, datapoints:[]};

			let loopData = [];

			if(locations[i] == 'NZL')
				loopData = _nzCovidData;

			else if(locations[i] == 'PNG')
				loopData = _pgCovidData;

			else if(locations[i] == 'IDN')
				loopData = _inCovidData;
			
			else if(locations[i] == 'AUS')
				loopData = _ausCovidData;
			
			else
				loopData = _worldData;

				loopData = sortDate(loopData,'date','DD/MM/YYYY');

				for(j = 0; j< loopData.length; j++){
					if(!hasFilter || (hasFilter &&  moment(loopData[j].date,'DD/MM/YYYY').toDate() >= startDate.toDate() 
					&& moment(loopData[j].date,'DD/MM/YYYY').toDate() <= endDate.toDate()))
					{
						if(maxCase < parseInt(loopData[j].total_cases))
							maxCase =  parseInt(loopData[j].total_cases);

						mapCasesData.datapoints.push({date: loopData[j].date, count: parseInt(loopData[j].total_cases)});

						if(maxNewCase < parseInt(loopData[j].new_cases))
							maxNewCase =  parseInt(loopData[j].new_cases);
						

						mapNewCasesData.datapoints.push({date: loopData[j].date, count: loopData[j].new_cases});

						if(maxDeath < parseInt(loopData[j].total_deaths))
							maxDeath =  parseInt(loopData[j].total_deaths);
						

						mapDeathData.datapoints.push({date: loopData[j].date, count: loopData[j].total_deaths});

						let mort = ((parseFloat(loopData[j].total_deaths)/parseFloat(loopData[j].total_cases))) * 100;

						if(!isNaN(mort) && maxMor < mort)
							maxMor =  mort;
												
						mapMortalityData.datapoints.push({date: loopData[j].date, count: isNaN(mort) ? 0 : mort});

					}
						
				}

				casesData.push(mapCasesData);
				newCaseData.push(mapNewCasesData);
				deathData.push(mapDeathData);
				mortalityTimeData.push(mapMortalityData);

			};

			console.log(maxDeath);

			let legendCase = renderLineChart('#svgCases',casesData, maxCase + 20);
			let legendNewCase = renderLineChart('#svgNewCases',newCaseData, maxNewCase + 20);
			let legendDeath = renderLineChart('#svgDeath',deathData, maxDeath + 20);
			let legendMort = renderLineChart('#svgMortality',mortalityTimeData, 100);

			for(var i = 0; i< legendCase.length; i++){
				$('#svgCases').before('<span class="legend" style="background-color:'+legendCase[i].color+'">'+legendCase[i].category+'</span>')
			}

			for(var i = 0; i< legendNewCase.length; i++){
				$('#svgNewCases').before('<span class="legend" style="background-color:'+legendNewCase[i].color+'">'+legendNewCase[i].category+'</span>')
			}

			for(var i = 0; i< legendDeath.length; i++){
				$('#svgDeath').before('<span class="legend" style="background-color:'+legendDeath[i].color+'">'+legendDeath[i].category+'</span>')
			}

			for(var i = 0; i< legendMort.length; i++){
				$('#svgMortality').before('<span class="legend" style="background-color:'+legendMort[i].color+'">'+legendMort[i].category+'</span>')
			}


	}

	


function loadWorldMap(){
	_curWorldMap = [];
	var type = $('#ddlWorldStats').val();
	var startDate = moment($('#txtWorldStartDate').val(), 'YYYY-MM-DD');
	var endDate = moment($('#txtWorldEndDate').val(), 'YYYY-MM-DD');

	let data = _covidData;
	// apply filters
	if(startDate.isValid() && endDate.isValid())
		 data = data.filter((d)=> moment(d.date,'DD/MM/YYYY').toDate() >= startDate.toDate() && moment(d.date,'DD/MM/YYYY').toDate() <= endDate.toDate())

	var gdpData = {};
	for(var i = 0; i < _countryData.length; i++){
		var values = 0;

		let covidData =  sortDateByDesc(data.filter((d)=> d.iso_code ==_countryData[i].iso_code),'date','DD/MM/YYYY') ;

		if(covidData.length > 0){
			switch(type){
			case 'CASES': values = covidData[0].total_cases; break;
			case 'NEW_CASES': values = covidData[0].new_cases; break;
			case 'DEATHS': values = covidData[0].total_deaths; break;
			case 'RECOVERY': values = 0; break;
		}

		gdpData[_countryData[i].code] = values;


			let curMap = {
				code: _countryData[i].code,
				country: covidData[0].location,
				infected: covidData[0].total_cases,
				new_infection: covidData[0].new_cases,
				dead: covidData[0].total_deaths,
				recovered: 0,
				date: covidData[0].date
			}

			_curWorldMap.push(curMap);
		}
		 
	}
console.log(gdpData);
	renderMap(gdpData);

}



function renderMap(data){
	$('#div_world_map').html('');

	$('#div_world_map').vectorMap({
 	 map: 'world_mill',
  	series: {
    	regions: [{
     	 values: data,
      scale: ['#C8EEFF', '#0071A4'],
      normalizeFunction: 'polynomial'
    }]
  },
  onRegionTipShow: function(e, el, code){
  	let mapNav = _curWorldMap.filter((d)=> d.code == code)[0];
  
  	if(mapNav != undefined)
   	 el.html(el.html()+ ' <br>' 
    	+ 'Infected: ' + mapNav.infected + '<br>'
    	+ 'New cases: ' + mapNav.new_infection + '<br>'
    	+ 'Dead: ' + mapNav.dead + '<br>'
    	+ 'Recovered: ' + mapNav.recovered + '<br>'
    	+ 'Last Reported: ' + mapNav.date + '<br>');
   	else{
   		 el.html(el.html());
   	}
  }
});
}



function renderLineChart(selector,data, max){
	
	legends = [];
	$(selector).html('');
	var margin = { top: 20, right: 80, bottom: 30, left: 50 },
  width = parseInt($(selector).width()) - margin.left - margin.right,
  height = parseInt($(selector).height()) - margin.top - margin.bottom;

  // width = $(selector).width() - margin.left - margin.right,
  //   height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

// Define date parser
var parseDate = d3.timeParse("%d/%m/%Y");

// Define scales
var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);
var color = d3.scaleOrdinal().range(d3.schemeCategory10);

// Define axes
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

// Define lines
var line = d3
  .line()
  .curve(d3.curveMonotoneX)
  .x(function(d) {
    return xScale(d["date"]);
  })
  .y(function(d) {
    return yScale(d["count"]);
  });

// Define svg canvas
var svg = d3
  .select(selector)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



  // Set the color domain equal to the three product categories
  // var productCategories = d3.keys(data[0]).filter(function(key) {
  //   return key !== "date" && key !== "metric";
  // });

  colorKeys = [];
   data.forEach(function(d) {
   	 colorKeys.push(d.category);
  });

  color.domain(colorKeys);

  // console.log(JSON.stringify(data, null, 2)) // to view the structure

  // Format the data field
  data.forEach(function(d) {
  	d.datapoints.forEach(function(k){
  		k["date"] = parseDate(k["date"]);
  	});
  });

xScale.domain(
    d3.extent(data[0].datapoints, function(d) {
      return d["date"];
    })
  );

  yScale.domain([0, max]);

  // Place the axes on the chart
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("y", 6)
    .attr("dy", ".71em")
    .attr("dx", ".71em")
    .style("text-anchor", "beginning")
    .text("Product Concentration");

  var products = svg
    .selectAll(".category")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "category");

  products
    .append("path")
    .attr("class", "line")
    .attr("d", function(d) {

      return line(d.datapoints);
    })
    .style("stroke", function(d) {
      legends.push({category: d.category, color : color(d.category)})
      return color(d.category);
    });

	return legends;

}
// Define responsive behavior
function resize(selector) {
  var width =
      parseInt(d3.select(selector).style("width")) - margin.left - margin.right,
    height =
      parseInt(d3.select(selector).style("height")) -
      margin.top -
      margin.bottom;

  // Update the range of the scale with new width/height
  xScale.range([0, width]);
  yScale.range([height, 0]);

  // Update the axis and text with the new scale
  svg
    .select(".x.axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.select(".y.axis").call(yAxis);

  // Force D3 to recalculate and update the line
  svg.selectAll(".line").attr("d", function(d) {
    return line(d.datapoints);
  });

  // Update the tick marks
  xAxis.ticks(Math.max(width / 75, 2));
  yAxis.ticks(Math.max(height / 50, 2));
}

// Call the resize function whenever a resize event occurs
//d3.select(window).on("resize", resize('#svgCases,#svgNewCase'));

// Call the resize function
//resize();



 $(document).ready(function(){
 	
 	$('#ddlWorldStats,#txtWorldStartDate,#txtWorldEndDate').change(function(){
		loadWorldMap();
 	});

	$('#btnFilter').click(function(){
		loadLineChart();
 	});

 	
	$('#btnClearFilter').click(function(){
		$('#inputStartDate,#inputEndDate').val('');
		$('#ddlCasesWorld option').prop('selected',false);
		loadLineChart();
 	});

 	$('#btnWorldClearFilter').click(function(){
		$('#txtWorldStartDate,#txtWorldEndDate').val('');
		$('#ddlWorldStats option:first').prop('selected',true);
		loadWorldMap();
 	});
 });

 	

