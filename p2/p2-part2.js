/*
-- For help with structure and d3 –
The sample.js and sample.html files

-- For help with line graph --
https://bl.ocks.org/d3noob/ed0864ef6ec6af1e360917c29f4b08da

-- For help with my key --
https://www.d3-graph-gallery.com/graph/custom_legend.html

-- For help with ticks --
https://stackoverflow.com/questions/40199108/d3-v4-scaleband-ticks
*/

'use strict';
/* you can use any part of this you think is useful, or re-organize some of
   its parts into different files if you want */

const fullMonth = {
  Jan: 'JANUARY',
  Feb: 'FEBRUARY',
  Mar: 'MARCH',
  Apr: 'APRIL',
  May: 'MAY',
  Jun: 'JUNE',
  Jul: 'JULY',
  Aug: 'AUGUST',
  Sep: 'SEPTEMBER',
  Oct: 'OCTOBER',
  Nov: 'NOVEMBER',
  Dec: 'DECEMBER',
};

/* something to repackage data in a more convenient form */
export const dataProc = function (_data) {
  let data = _data.map((d, i) => ({
    month: fullMonth[d.month],
    year: +d.year,
    // would have been nice for csv to have column headers that were valid identifers
    date: `${d.month} ${d.year}`,
    size: +d['army-size'],
    zNum: +d['disease-death'],
    wNum: +d['wound-death'],
    oNum: +d['other-death'],
    zRate: +d['disease-rate'],
    wRate: +d['wound-rate'],
    oRate: +d['other-rate'],
  }));
  return data;
};

export const part2 = function (id, data) {
  // Setting dimensions and data variables
  const svg = d3.select(`#${id}`);
  const width = parseFloat(svg.style('width'));
  const height = parseFloat(svg.style('height'));
  const padding = 10;
  const marg = 50;
  const maxNum = d3.max(data.map((d) => Math.max(d.zNum, d.wNum, d.oNum)));
  const months = data.map((d) => `${d.month} ${d.year}`);

  // Setting scales
  const yScale = d3
    .scaleLinear()
    .domain([0, maxNum])
    .range([(height - (marg * 2)), marg]);
  const xScale = d3
    .scaleBand()
    .domain(months)
    .range([marg, width - marg]);

  // define the 1st line
  let line1 = d3.line()
      .x(d => xScale(`${d.month} ${d.year}`) + xScale.bandwidth()/2)
      .y(d => yScale(d.zNum));

  // define the 2nd line
  let line2 = d3.line()
      .x(d => xScale(`${d.month} ${d.year}`) + xScale.bandwidth()/2)
      .y(d => yScale(d.wNum + d.oNum));

  // Add line1
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .style("stroke", "blue")
      .style("stroke-width", 5)
      .style("fill","none")
      .attr("d", line1);

  // Add line2
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .style("stroke", "red")
      .style("stroke-width", 5)
      .style("fill","none")
      .attr("d", line2);

  // Add X Axis
  svg.append("g")
      .attr("transform", "translate(0," + (height - (marg * 2)) + ")")
      .attr("class", "x axis")
      .call(d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter(function(d, i) {
          // Ensuring that April 1855 is included, and eliminating all odd-indexed months otherwise
          // This is to help with clutter. April 1855, if present, will be needed, for reasons below.
          if (months[i] == "APRIL 1855") {
            return xScale(months[i]);
          }
          else if (i % 2 != 0 && months[i] != "MARCH 1855" && months[i] != "MAY 1855") {
           return xScale(months[i]);
         }}))
          .tickPadding(padding));

  // Setting the tick for April 1855 to be 3 times the length of the others.
  // This is to accentuate the before/after of April 1855, as Nightingale did with her graphs.
  d3.selectAll("g.x.axis g.tick line")
  .attr("y2", function(d){
     if (d == "APRIL 1855")
         return 15;
     else
         return 5;
  });

  // Add Y Axis
  svg.append("g")
      .attr("transform", "translate(" + marg + "," + 0 + ")")
      .call(d3.axisLeft(yScale));

  // Add Key
  svg.append("circle")
    .attr("cx", padding).attr("cy", height - marg).attr("r", 6).style("fill", "blue");
  svg.append("circle")
    .attr("cx", padding).attr("cy", height - marg/2).attr("r", 6).style("fill", "red");
  svg.append("text")
    .attr("x", padding * 2).attr("y", height - marg).text("Deaths from preventable or mitigable Zymotic disease")
    .style("font-size", "15px").attr("alignment-baseline","middle");
  svg.append("text")
  .attr("x", padding * 2).attr("y", height - marg/2).text("Deaths from wounds + all other causes")
  .style("font-size", "15px").attr("alignment-baseline","middle");
};
