'use strict';

// dataGen Generates data, either random or not
export const dataGen = function (range, length, random = true, start = 'A') {
    const eps = 0.02;
    const offset = eps*(range[1] - range[0]);
    const scale = (1 - 2*eps)*(range[1] - range[0]);
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    return [...Array(length)]
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
        .map((_, i) => String.fromCharCode(start.charCodeAt(0) + i))
        .map((d, i) => ({
            cat: d,
            val: offset + scale * (random ? Math.random() : i / (length - 1)),
        }));
};

/* svgAppend appends another d3-generated SVG to the document 'body',
   and sets it up with a label, an X scale, and (if wanted) a Y scale.
   What is returned is a <g> to which a new chart or graph can be appended
   by the functions you write in p1.js */
export const svgAppend = function (label, layout, Height) {
    const outer = d3.select('body')
        .append('svg')
        .attr('id', `vis-${label}`)
        .attr('width', layout.width + layout.margin.left + layout.margin.right)
        .attr('height', (Height
            ? Height // want something other than layout.height
            : layout.height)
            + layout.margin.top + layout.margin.bottom);
    outer.append('text')
        .attr('class', 'label')
        .attr('transform', 'translate(10,18)')
        .text(label);
    const ret = outer.append('g')
        .attr('transform', `translate(${layout.margin.left}, ${layout.margin.top})`);
    if (!Height) { // if not over-riding the height
        ret.append('g')
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(layout.yScale));
    }
    ret.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0,${Height ? Height : layout.height})`)
        .call(d3.axisBottom(layout.xScale));
    return ret;
}
