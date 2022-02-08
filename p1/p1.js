/*
  This is the ONLY file you need to modify for p1, and it the only file for which you should
  svn commit modifications. Finish the implementation of all the functions below that start
  with a "TODO" comment, which describes what your code should do.  Follow all instructions.
  You may add new functions to this file if that helps you get the work done.  You should
  refer to the pre-rendered page of correct results in p1-soln.html.

  NOTE: The comments below all use *foo* to identify function parameter foo.

  Adding concise and descriptive comments is one way to show that YOU are the thoughtful
  author of this code.

  NOTE HERE (below, within this comment) any people that you collaborated with on this coding
  assignment, or other online resources you found helpful:


*/

'use strict';

/* assuming that "d3" has been "imported" by whatever is importing this module */

/* (TODO) xScaleGen returns a d3 scaleBand https://observablehq.com/@d3/d3-scaleband
    https://github.com/d3/d3-scale/blob/master/README.md#scaleBand
    The scale domain is an array of the d.cat values for all the d in the given *data* array.
    The padding, in the sense of https://github.com/d3/d3-scale/blob/master/README.md#band_padding
    (or search for "Lastly, band.padding" at https://observablehq.com/@d3/d3-scaleband )
    is *pad*.
*/
export const xScaleGen = function (data, width, pad) {
  return d3.scaleBand()
    .domain(data.map(d => d.cat))
    .range([0, width])
    .padding(pad);
}

/* (TODO) yScaleGen returns a d3 scaleLinear https://observablehq.com/@d3/d3-scalelinear
    https://github.com/d3/d3-scale/blob/master/README.md#scaleLinear
    The scale domain is *dataRange*, and the scale range is between 0 and *height*,
    but you have to account for how SVG coordinates have y increasing downward, but
    conventions of data graphing have higher values going upward.
*/
export const yScaleGen = function (dataRange, height) {
    return d3.scaleLinear()
      .domain(dataRange)
      .range([height, 0]);
}

/* bars adds (to the *svg* output of svgAppend) a bar chart visualizing the given *data*,
   made of svg "rect"s in class "bar".  The bar width is layout.xScale.bandwidth() and
   the height is determined by layout.yScale. In SVG, the "x" and "y" attributes of a
   rect give its upper-left corner, even though for this bar chart you might think it
   was more logical to think in terms of the lower-left corner.
   https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
   https://observablehq.com/@d3/lets-make-a-bar-chart
   https://observablehq.com/@d3/lets-make-a-bar-chart/2?collection=@d3/lets-make-a-bar-chart
   https://observablehq.com/@d3/lets-make-a-bar-chart/3?collection=@d3/lets-make-a-bar-chart
   https://observablehq.com/@d3/lets-make-a-bar-chart/4?collection=@d3/lets-make-a-bar-chart
*/
export const bars = function (svg, data, layout) {
    svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => layout.xScale(d.cat))
        .attr("width", layout.xScale.bandwidth())
        .attr("y", d => layout.yScale(d.val))
        .attr("height", d => layout.height - layout.yScale(d.val));
}

/* (TODO) dots makes a chart that visualizes *data* with svg "circle"s in class "dot", located
   at the same place as the tops of the rectangles in the bar chart (above). The radius of the
   circles is *radius*
   https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
*/
export const dots = function (svg, data, layout, radius) {
  svg.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => layout.xScale(d.cat) + (layout.xScale.bandwidth()/2))
      .attr("r", radius)
      .attr("cy", d => layout.yScale(d.val))
}

/* (TODO) sticks visualizes *data* with svg "line"s in class "stick". The lines are horizontally
   located at the centers of the bars in the bar chart, and have the same vertical extent as the bars.
   https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
*/
export const sticks = function (svg, data, layout) {
  svg.selectAll(".stick")
      .data(data)
      .join("line")
      .attr("class", "stick")
      .attr("x1", d => layout.xScale(d.cat) + (layout.xScale.bandwidth()/2))
      .attr("y1", layout.height)
      .attr("x2", d => layout.xScale(d.cat) + (layout.xScale.bandwidth()/2))
      .attr("y2", d => layout.yScale(d.val));
}

/* (TODO) outlineCircles visualizes *data* with svg "circle"s in class "outlineCircle",
   with constant radius but varying stroke thickness. The circles are horizontally located
   the same as all the previous marks, at vertical position y = layout.xScale.bandwidth()/2.
   As the data values go from dataRange[0] to dataRange[1] the circle goes from having
   stroke width zero, to becoming a complete circle of radius layout.xScale.bandwidth()/2
   (because the stroke became so fat that it completely covered the interior of the circle).
   Use a (local) const d3.scaleLinear to parameterize the stroke width.
*/
export const outlineCircles = function (svg, data, dataRange, layout) {
  const scale = d3.scaleLinear()
    .domain(dataRange)
    .range([0, layout.xScale.bandwidth()/2]);

  svg.selectAll(".outlineCircle")
      .data(data)
      .join("circle")
      .attr("class", "outlineCircle")
      .attr("cx", d => layout.xScale(d.cat) + (layout.xScale.bandwidth()/2))
      .attr("r", d => layout.xScale.bandwidth()/4)
      .attr("cy", d => layout.xScale.bandwidth()/2)
      .attr("stroke-width", d => scale(d.val));
}

/* (TODO) sizedCircles visualizes *data* with svg "circle"s in class "sizedCircle".
   The circles are located at the same place as in outlineCircles. As the data values go from
   dataRange[0] to dataRange[1] the circle goes from having radius 0 to having radius
   layout.xScale.bandwidth()/2]. Use a (local) const d3.scaleLinear to parameterize the radius.
*/
export const sizedCircles = function (svg, data, dataRange, layout) {
    const radius = d3.scaleLinear().domain(dataRange).range([0, layout.xScale.bandwidth()/2]);
    svg.selectAll(".sizedCircle")
        .data(data)
        .join("circle")
        .attr("class", "sizedCircle")
        .attr("cx", d => (layout.xScale(d.cat) + (layout.xScale.bandwidth()/2)))
        .attr("r",  d => radius(d.val))
        .attr("cy", (layout.xScale.bandwidth())/2);
}

// basic 3-argument lerp
const lerp = (min, max, a) => (1-a)*min + a*max;

// clamp value to interval [min,max]
const clamp = (min, value, max) =>
    (value <= min
     ? min
     : (value >= max
        ? max
        : value));

// quantize v in domain [0,1] to integer-valued range 0...255 and then convert to 2-character hex
export const q8hex = function(v) {
    const v8 =  Math.round(lerp(-0.5, 255.5, clamp(0,v,1)));
    if (v8 == 256) { v8 = 255; }
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
    return v8.toString(16).padStart(2, '0');
}

/* (TODO) coloredCircles visualizes *data* with svg "circle"s in class "coloredCircle".
   The circles are located at the same place as in outlineCircles, and all have radius
   layout.xScale.bandwidth()/2. As the data values go from dataRange[0] to dataRange[1], the
   fill color of the circle goes from #00ff00 (green) to #ff00ff (a magenta, with red and blue
   all the way on, green off). Do NOT do this with a colorscale in d3! Instead, to highlight
   how nice d3 colorscales are, you should instead use a (local) const d3.scaleLinear, combined
   with the utility function q8hex (above), to create the #RRGGBB color.
*/
export const coloredCircles = function (svg, data, dataRange, layout) {
    const colorer = d3.scaleLinear().domain(dataRange).range([0, 1]);

    svg.selectAll(".coloredCircle")
        .data(data)
        .join("circle")
        .attr("class", "coloredCircle")
        .attr("cx", d => (layout.xScale(d.cat) + (layout.xScale.bandwidth()/2)))
        .attr("r",  d => (layout.xScale.bandwidth()/2))
        .attr("cy", (layout.xScale.bandwidth())/2)
        .attr("fill", d => ('#' + q8hex(colorer(d.val)) + q8hex(1 - colorer(d.val)) + q8hex(colorer(d.val))));
}

/* (TODO) slopes visualizes *data* with svg "g"s in class "slope", which in turn contains an
   svg "line" that is rotated. As the data values go from dataRange[0] to dataRange[1], the line
   is rotated counter-clockwise from 0 to 90 degrees.  The lines are centered at the same centers
   as the circles above. Use d3 to change the "transform" attribute of the "g" (hint: translate,
   then rotate) in order to make this data-driven; the _untransformed_ line should just be a
   horizontal line, length layout.xScale.bandwidth(), centered on the origin.
   https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g
   https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
   https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform#translate
   https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform#rotate
*/
export const slopes = function (svg, data, dataRange, layout) {
  const scale = d3.scaleLinear()
    .domain(dataRange)
    .range([0, -90]);

  const scale2 = d3.scaleLinear()
    .domain(dataRange)
    .range([0, 1]);

  svg.selectAll(".slope")
      .data(data)
      .attr("display", "inline-block")
      .join("g")
      .attr("class", "slope")
      .attr("transform", d => "translate(" + 0 + ", " + scale2(d.val) + ") "
      + "rotate(" + scale(d.val) + ", " + ((2 * layout.xScale(d.cat) + layout.xScale.bandwidth()) / 2)
      + ", " + (layout.xScale.bandwidth()/2) + ")")
      .append("line")
      .attr("x1", d => (layout.xScale(d.cat)))
      .attr("y1", d => (layout.xScale.bandwidth()/2))
      .attr("x2", d => (layout.xScale(d.cat) + (layout.xScale.bandwidth())))
      .attr("y2", d => (layout.xScale.bandwidth()/2))
      
}
