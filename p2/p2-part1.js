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


export const right_array = function(data){
  const new_array = data.filter((d, i) => (i < 12));
  return new_array;
}

export const left_array = function(data){
  const new_array = data.filter((d, i) => (i >= 12));
  return new_array;
}

export const text_radius = function(zNum, wNum, oNum, radius){
  var max_num = Math.max(Math.sqrt(zNum) * 6, Math.sqrt(wNum) * 6, Math.sqrt(oNum) * 6);
  return (radius + max_num);
}

// needed to make two functions for the left and right chart, because
// the outerRadius line needed to a bit a little different in order to
// make sure that the filling color for both charts are correct.
// this is the only way the code worked without even more repetition.

export const make_chart_right = function(svg, arr, data, start_angle, whole_circle, position){
  arr.map((which, idx) => {
    var chart = svg.append('g')
                   .selectAll('path')
                   .data(data)
                   .enter()
                   .append("path")
                   .attr("class", which)
                   .attr("d", function(d, i){
                      return d3.arc()({
                        innerRadius: 0,
                        outerRadius: Math.sqrt([d.zRate, d.oRate, d.wRate][idx]) * 10,
                        startAngle: (start_angle) + (i * whole_circle),
                        endAngle: (start_angle) + ((i + 1) * whole_circle)
                      })
                   })
                   .attr("transform", position)


  });
};

export const make_chart_left = function(svg, arr, data, start_angle, whole_circle, position){
  arr.map((which, idx) => {
    var chart = svg.append('g')
                   .selectAll('path')
                   .data(data)
                   .enter()
                   .append("path")
                   .attr("class", which)
                   .attr("d", function(d, i){
                      return d3.arc()({
                        innerRadius: 0,
                        outerRadius: Math.sqrt([d.zRate, d.wRate, d.oRate][idx]) * 10,
                        startAngle: (start_angle) + (i * whole_circle),
                        endAngle: (start_angle) + ((i + 1) * whole_circle)
                      })
                   })
                   .attr("transform", position)


  });
};

//helper function to right text
export const make_text = function(svg, transform, anchor, words){
  svg.append('text')
     .attr('transform', transform)
     .attr('text-anchor', anchor)
     .attr('font-size', '14px')
     .text(words);
}

//labels with months and years
export const labels = function(svg, data, transform, start_angle, whole_circle, num1, num2){
  svg.append('g')
     .attr("transform", transform)
     .selectAll(".monthLabels")  
     .data(data)
     .enter()
     .append('text')
     .attr('class', 'monthLabels')
     .attr('text-anchor', 'middle')
     .attr('transform', (d, i) => `translate(${(Math.sin((((start_angle) + (i * whole_circle) + (start_angle) + ((i + 1) 
                                                * whole_circle))/2) ) * text_radius(d.zRate, d.wRate, d.oRate, num1))},
                                             ${(Math.cos((((start_angle) + (i * whole_circle) + (start_angle) + ((i + 1) 
                                                * whole_circle))/2)) * text_radius(d.zRate, d.wRate, d.oRate, num2) * -1)})`)
     .text(function(d){
      if(d.month == 'APRIL' && (d.year == '1854' || d.year == '1855')){
        return d.month + '\n' + d.year;
      } else if(d.month == 'JANUARY' && (d.year == '1855' || d.year == '1856')){
        return d.month + '\n' + d.year;
      } else if(d.month == 'MARCH' && (d.year == '1855' || d.year == '1856')){
        return d.month + '\n' + d.year;
      } else{
        return d.month;
      }
    });
}

export const part1 = function(id, data){
  const svg = d3.select(`#${id}`);
  svg.append('text')
     .attr('class', 'glabel')
     .attr('transform', "translate(750, 27)")
     .attr('text-anchor', 'end')
     .text("DIAGRAM of the CAUSES of MORTALITY");
  svg.append('text')
     .attr('class', 'glabel')
     .attr('transform', "translate(675, 46)")
     .attr('text-anchor', 'end')
     .text("in the ARMY in the EAST");

  
  // writes the text for the chart
  make_text(svg, "translate(850, 38)", 'middle', "1.");
  make_text(svg, "translate(230, 38)", 'middle', "2.");
  make_text(svg, "translate(850, 53)", 'middle', "APRIL 1854 to MARCH 1855");
  make_text(svg, "translate(230, 53)", 'middle', "APRIL 1855 to MARCH 1856");
  make_text(svg, "translate(85, 381)", 'start', "The Areas of the blue, red, & black wedges are each measured from the");
  make_text(svg, "translate(110, 399)", 'start', "centre as the common vertex.");
  make_text(svg, "translate(85, 418)", 'start', "The blue wedges measured from the centre of the circle represent area for");
  make_text(svg, "translate(110, 436.7928)", 'start', "area the deaths from Preventible or Mitigable Zymotic diseases, the");
  make_text(svg, "translate(110, 455.29285)", 'start', "red wedges measured from the centre the deaths from wounds, & the");  
  make_text(svg, "translate(110, 473.7928)", 'start', "black wedges measured from the centre the deaths from all other causes.");
  make_text(svg, "translate(85, 492.29285)", 'start', "The black line across the red triangle in Nov. 1854 marks the boundary of");
  make_text(svg,  "translate(110, 510.79285)", 'start', "the deaths from all other causes during the month.");
  make_text(svg, "translate(85, 529.29285)", 'start', "In October 1854, & April 1855, the black area coincides with the red,");
  make_text(svg, "translate(110, 547.79285)", 'start', "in January & February 1856, the blue coincides with the black.");
  make_text(svg, "translate(85, 566.29285)", 'start', "The entire areas may be compared by following the blue, the red, & the");
  make_text(svg, "translate(110, 584.79285)", 'start', "black lines enclosing them.");
  
  const start_angle = (3 * Math.PI)/2;
  const whole_circle = Math.PI/6;
  
  //makes right chart and outlines it
  make_chart_right(svg, ['zbar', 'obar', 'wbar'], right_array(data), start_angle, whole_circle, "translate(809, 234)");
  make_chart_right(svg, ['zbar-outline', 'obar-outline', 'wbar-outline'], right_array(data), start_angle, whole_circle, "translate(809, 234)");
  //labels right chart with months/years
  labels(svg, right_array(data), "translate(809, 250)", start_angle, whole_circle, 120, 110);

  //makes left chart and outlines it
  make_chart_left(svg, ['zbar', 'wbar', 'obar'], left_array(data), start_angle, whole_circle, "translate(250, 234)");
  make_chart_left(svg, ['zbar-outline', 'wbar-outline', 'obar-outline'], left_array(data), start_angle, whole_circle, "translate(250, 234)");
  //labels left chart with months/years
  labels(svg, left_array(data), "translate(250, 250)", start_angle, whole_circle, 75, 75);


}
