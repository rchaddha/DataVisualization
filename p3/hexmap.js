
'use strict';
/* assuming that "d3" has been "imported" by whatever is importing this module */

const hexWidth = 55; // size of individual hexagons in US map

export const resize = function (id) {
  d3.select('#'+id)
    .attr('width', 12 * hexWidth)
    .attr('height', (8 + 1 / 3) * (Math.sqrt(3) / 2) * hexWidth);
};

/* add hexagon geometry "hex" info to given datum d,
assuming it has the "HexRow" and "HexCol" attributes */
export const add = function (d) {
  const S = 1; // hexagon scaling (1 = touching)
  const hr = +d.HexRow;
  const hc = +d.HexCol;
  // variables to simplify tracing hexagon corners
  const dx = (S * hexWidth) / 2;
  const HY = (S * hexWidth) / Math.sqrt(3);
  const dy = HY / 2;
  // augment datum with geometry info about hexagon
  d.hex = {
    xy: [
      // x,y center of hexagon
      hexWidth * (-2 + hc + 0.5 * hr),
      1 + hexWidth * (-0.3 + 0.5 * Math.sqrt(3) * hr),
    ],
    // hexagonal SVG pathdata ('d')
    path: `M${-dx},${dy} l${dx},${dy} l${dx},${-dy} l0,${-HY} l${-dx},${-dy} l${-dx},${dy} Z`,
  };
  return d;
};

/* for each state, create a "g", which will contain both a "path", for
the hexagon, and a "text" to show the state abbreviation */
export const create = function (id, sid, data) {
  const stategs = d3
    .select('#'+id)
    .selectAll('g')
    .data(data)
    .join('g')
    .attr('transform', (d) => `translate(${d.hex.xy[0]},${d.hex.xy[1]})`);
  stategs
    .append('path')
    .attr('class', 'state')
    .attr('d', (d) => d.hex.path)
    .style('fill', '#888'); // initialize to gray
  stategs
    .append('text')
    .attr('class', sid)
    .text((d) => d['StateAbbr']);
};
