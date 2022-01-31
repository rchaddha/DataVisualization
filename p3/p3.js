/* You do your p3 work in this file.
The first part of the file does not need to be modified (at least not for the basic
requirements); the second part (starting with dataProc) is where you do your work.

// ========================================================
// BEGIN part that doesn't need changing

-- For help in determing whether year was surrounded by HTML tags or not --
https://stackoverflow.com/questions/9727111/innerhtml-without-the-html-just-text
'use strict';
/* assuming that "d3" has been "imported" by whatever is importing this module */

export const transDur = 500; // duration of all transition()s
export const circRad = 6; // size of circle marks in scatterplot
export const scatSize = 360; // width and height of scatterplot

const colorDem = d3.rgb(0, 0, 255); // color showing pure democratic vote
const colorRep = d3.rgb(255, 0, 0); // color showing pure democratic vote

/* create the annotated balance bars for popular and electoral college votes */
export const balanceInit = function (did, sid) {
  // https://bl.ocks.org/curran/3a68b0c81991e2e94b19
  const div = document.getElementById(did);
  /* appending elements to the div likely changes clientWidth and clientHeight,
  hence the need to save these values representing the original grid */
  const ww = div.clientWidth;
  let hh = div.clientHeight;
  const svg = d3.select('#' + did).append('svg');
  // make svg fully occupy the (original) containing div
  svg.attr('id', sid).attr('width', ww).attr('height', hh);
  const wee = 8;
  const bal = svg.append('g').attr('transform', `translate(0,${2 * wee})`);
  hh -= 2 * wee;
  /*                L                                                        R
   +                ----------------------------|-----------------------------
       popular vote | #D-pv-bar,#D-pv-txt       |        #R-pv-bar,#R-pv-txt |
  H                 ----------------------------|-----------------------------
                      #D-name                   |                    #R-name
                    ----------------------------|-----------------------------
  electoral college | #D-ec-bar,#D-ec-txt       |        #R-ec-bar,#R-ec-txt |
                    ----------------------------|-----------------------------
  */
  // some convenience variables for defining geometry
  const L = ww / 7,
    R = (6.5 * ww) / 7,
    H = hh / 3;
  // mapping over an array of adhoc parameter objects to avoid copy-pasta
  [
    // create the left-side labels for the two bars
    { y: 0.5 * H, t: 'Popular Vote' },
    { y: 2.5 * H, t: 'Electoral College' },
  ].map((i) => {
    bal
      .append('text')
      .attr('transform', `translate(${L - wee},${i.y})`)
      .style('text-anchor', 'end')
      .html(i.t);
  });
  [
    /* the bars and text values for the four counts: {D,R}x{popular vote, electoral college},
    and, the two candidate names */
    { id: 'D-pv', p: -1, y: 0 },
    { id: 'D-name', p: -1, y: H },
    { id: 'D-ec', p: -1, y: 2 * H },
    { id: 'R-pv', p: 1, y: 0 },
    { id: 'R-name', p: 1, y: H },
    { id: 'R-ec', p: 1, y: 2 * H },
  ].map((i) => {
    if (!i.id.includes('name')) {
      bal
        .append('rect')
        .attr(
          /* NOTE how these bars are transformed: your code only needs to set width (even though
        the D bars grow rightward, and the R bars grown leftward), and, your code doesn't need
        to know the width in pixels.  Just set width to 0.5 to make the bar go to the middle */
          'transform',
          i.p < 0 ? `translate(${L},0) scale(${R - L},1)` : `translate(${R},0) scale(${L - R},1)`
        )
        .attr('x', 0)
        .attr('y', i.y)
        .attr('height', H)
        .attr('fill', i.p < 0 ? colorDem : colorRep)
        // NOTE: select the bars with #D-pv-bar, #D-ec-bar, #R-pv-bar, #R-ec-bar
        .attr('id', `${i.id}-bar`)
        .attr('width', 0.239); // totally random initial fractional value
    }
    const txt = bal
      .append('text')
      .attr('transform', `translate(${i.p < 0 ? L + wee : R - wee},${i.y + 0.5 * H})`)
      .style('text-anchor', i.p < 0 ? 'start' : 'end')
      // NOTE: select the text fields with #D-pv-text, #D-ec-text, #R-pv-text, #R-ec-text
      .attr('id', `${i.id}${i.id.includes('name') ? '' : '-txt'}`);
    txt.html('#' + txt.node().id);
  });
  bal
    .append('line')
    .attr('x1', (L + R) / 2)
    .attr('x2', (L + R) / 2)
    .attr('y1', 0)
    .attr('y2', hh)
    .attr('stroke-width', 1)
    .attr('stroke', '#fff');
};

/* canvasInit initializes the HTML canvas that we use to draw a picture of the bivariate
colormap underneath the scatterplot.
NOTE THAT AS A SIDE-EFFECT this sets scatContext and scatImage, which you must use again
later when changing the pixel values inside the canvas */
let scatContext = null;
let scatImage = null;
export const canvasInit = function (id) {
  const canvas = document.querySelector('#' + id);
  canvas.width = scatSize;
  canvas.height = scatSize;
  scatContext = canvas.getContext('2d');
  scatImage = scatContext.createImageData(scatSize, scatSize);
  /* set pixels of scatImage to checkerboard pattern with ramps; the only purpose of this is to
  show an example of traversing the scatImage pixel array, in a way that (with thought and scrutiny)
  identifies how i and j are varying over the image as it is seen on the screen.
  NOTE that nested for() loops like this are an idiomatic way of working with pixel data arrays,
  as opposed to functional idioms like .map() that we use for other kinds of data. */
  for (let k = 0, j = 0; j < scatSize; j++) {
    for (let i = 0; i < scatSize; i++) {
      scatImage.data[k++] =
        100 + // RED channel is a constant plus ...
        (120 * i) / scatSize + // ... ramp up along i,
        30 * (Math.floor(i / 40) % 2); // with wide bands
      scatImage.data[k++] =
        100 + // GREEN channel is a constant plus ...
        (120 * j) / scatSize + // ... ramp up along with j,
        30 * (Math.floor(j / 10) % 2); // with narrow bands
      scatImage.data[k++] = 30; // BLUE channel is constant
      scatImage.data[k++] = 255; // 255 = full OPACITY (don't change)
    }
  }
  /* display scatImage inside canvas.
  NOTE that you will need to call this again (exactly this way, with these variable names)
  anytime you change the scatImage.data canvas pixels */
  scatContext.putImageData(scatImage, 0, 0);
};

/* Place the scatterplot axis labels, and finalize the stacking of both the labels
and the scatterplot marks over the canvas.
That this assumes many specific element ids in the DOM is likely evidence of bad design */
export const scatLabelPos = function () {
  // place the scatterplot axis labels.
  const marg = 20; // around the scatterplot domain
  const wee = 7; // extra tweak to text position
  const sz = scatSize;
  /* since these two had style "position: absolute", we have to specify where they will be,
  and this is done relative to the previously placed element, the canvas */
  /* (other functions here in p3.js made an effort to not assume particular element ids, using
  instead ids passed to the function, but GLK gave up trying that with this one, alas) */
  ['#scat-axes', '#scat-marks-container'].map((pid) =>
    d3
      .select(pid)
      .style('left', -marg)
      .style('top', -marg)
      .attr('width', 2 * marg + sz)
      .attr('height', 2 * marg + sz)
  );
  d3.select('#y-axis').attr('transform', `translate(${marg - wee},${marg + sz / 2}) rotate(-90)`);
  d3.select('#x-axis').attr('transform', `translate(${marg + sz / 2},${marg + sz + wee})`);
  d3.select('#scat-marks')
    .attr('transform', `translate(${marg},${marg})`)
    .attr('width', sz)
    .attr('height', sz);
};

/* scatMarksInit() creates the per-state circles to be drawn over the scatterplot */
export const scatMarksInit = function (id, data) {
  /* maps interval [0,data.length-1] to [0,scatSize-1];
  this is NOT an especially informative thing to do; it just gives all the
  tickmarks some well-defined initial location */
  const tscl = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, scatSize]);

  /* create the circles */
  d3.select('#' + id)
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', circRad)
    .attr('cx', (d, ii) => tscl(ii))
    .attr('cy', (d, ii) => scatSize - tscl(ii))
    .attr('stroke', 'white')
    .attr('stroke-opacity', 0.8)
    .attr('stroke-width', 1.3)
    .attr('fill', 'black')
    .attr('fill-opacity', 0);
};

export const formsInit = function (tlid, yid, years, mdid) {
  // finish setting up timeline for choosing the year
  const tl = d3.select('#' + tlid);
  tl.attr('min', d3.min(years))
    .attr('max', d3.max(years))
    .attr('step', 4)
    // responding to both input and click facilitates being activated from code
    .on('input click', function () {
      /* This is one of the rare times that you CANNOT use an arrow function; you need a real
      "function" so that "this" is usefully set (here, "this" is this input element) */
      d3.select('#' + yid).html(this.value);
      yearSet(+this.value); // need the + so year is numeric
    });
  // create radio buttons for choosing colormap/scatterplot mode
  const radioModes = [
    /* id: how the mode selection is identified; str: how it is displayed
    NOTE: these identifiers 'RVD', 'PUR', 'LVA' will not change; feel free to use
    them as magic constant strings throughout your code */
    { id: 'RVD', str: 'red/blue' },
    { id: 'PUR', str: 'purple' },
    { id: 'LVA', str: 'lean-vs-amount' },
  ];
  // one span per choice
  const spans = d3
    .select('#' + mdid)
    .selectAll('span')
    .data(radioModes)
    .join('span');
  // inside each span, put a radio button
  spans
    .append('input')
    // add some spacing left of 2nd and 3rd radio button; the 'px' units are in fact needed
    .style('margin-left', (_, i) => `${20 * !!i}px`)
    .attr('type', 'radio')
    .attr('name', 'mode') // any string that all the radiobuttons share
    .attr('id', (d) => d.id) // so label can refer to this, and is thus clickable
    .attr('value', (d) => d.id) // so that form as a whole has a value
    // respond to being selected by calling the modeSet function (in this file).
    .on('input', function (d) {
      modeSet(this.value);
    });
  // also in each span put the choice description
  spans
    .append('label')
    .attr('for', (d) => d.id)
    .html((d) => d.str);
};

// END part that doesn't need changing
// ==============================================================================

// ==============================================================================
// BEGIN part where you'll change and add things

//A global variable to track mode so it can be used in different functions
let globalMode;

//A global variable to track all the state hexes
let states;

const W1_gradient = function (N) { //To be used in making canvas b.g. for 'Purple' graph
  var n = N / Math.max(N);
  var scale = d3.scaleLinear().domain([0, n]).range([0, 1]);
  return Math.pow(scale(N), 0.5) * scale(N);
}

const W1 = function (N) { //Will be used to warp data to make it display better on a graph
  var scale = d3.scaleLinear().domain([0, 6000000]).range([0, 1]);
  return Math.sqrt(scale(N)) * (N / scale(N));
}

const W2 = function (N) { //Will be used to warp data to make it display better on a graph
  var n = N / 17116679;
  var scale = d3.scaleLinear().domain([0, 17116679]).range([0, 1]);
  return Math.sqrt(scale(n)) * (N / scale(N));
}

export const dataProc = function (_data, years) {
  let DN = []; //Number of Democratic popular votes, per-state
  let DE = []; //number of Democratic Electoral College votes, per-state
  let RN = []; //Number of Republican popular votes, per-state
  let RE = []; //RE: number of Republican Electoral College votes, per-state
  let TN = []; //TN: (total number of votes) TN = DN + RN
  let PL = []; //PL: (political leaning); PL = 2*RN/(1 + TN) - 1, which will go from -1 to 1 as the
   // political leaning of a state goes from pure D to pure R
  let DA = []; //DA; (D "voting amount", a non-technical term); DA = W1(DN): monotonic
  // ('warping') function W1 of DN that we designed, with the purpose of spreading out states in the
  // scatterplot in modes RVD and PUR.
  let RA = []; //RA = W1(RN), warping function W1 applied to RN
  let VA = []; //W2(TN), a potentially different monotonic warping function W2 applied to TN, which
  // we designed to spread out states in the vertical axis of mode LVA
  for (let i = 0; i < _data.length; i++) { //Filling in the data
    let dn = [];
    let de = [];
    let rn = [];
    let re = [];
    let tn = [];
    let pl = [];
    let da = [];
    let ra = [];
    let va = [];
    for (let j = 0; j < years.length; j++) { //Setting the values of all inner arrays
      dn.push(parseInt(_data[i]['DN_' + years[j].toString()]));
      de.push(parseInt(_data[i]['DE_' + years[j].toString()]));
      rn.push(parseInt(_data[i]['RN_' + years[j].toString()]));
      re.push(parseInt(_data[i]['RE_' + years[j].toString()]));
      tn.push(dn[j] + rn[j]);
      pl.push((2 * rn[j] / (1 + tn[j]) - 1));
      da.push(W1(dn[j]));
      ra.push(W1(rn[j]));
      va.push(W2(tn[j]));
    }
    DN.push(dn);
    DE.push(de);
    RN.push(rn);
    RE.push(re);
    TN.push(tn);
    PL.push(pl);
    DA.push(da);
    RA.push(ra);
    VA.push(va);
  }
  let data = {dn: DN, de: DE, rn: RN, re: RE, tn: TN, pl: PL, da: DA, ra: RA, va: VA}
  return data; //HEY you should change this! --Just did! -Luke
};

export const init = function () {
  states = document.getElementsByClassName('state');
  circles = document.getElementsByTagName('circle');
};

//Variables that hold the circles on the scatterplot
let circles;

//Variable that tracks the index of the current highlighted state
let prevStateIndex;

//A helper function that will take a StateAbbr and return the index of that state in the data
const abbrToIndex = function (abbr) {
  for (let i = 0; i < p3._data.length; i++) {
    if (p3._data[i].StateAbbr == abbr) {
      return i;
    }
  }
  return -9999999999; //An arbitrarily small and clearly false value
}

const yearToIndex = function (year) {
  /*year is in HTML form when not being called directly by yearSet.
  because we still need to use it even in other functions like modeSet,
  I check to see if year has text content (if so, then it is in HTML form),
  settting it to its textContent if that's the case, and letting it stay
  unchanged otherwise. */
  year = (year.textContent===undefined) ? year: year.textContent;

  for (let i = 0; i < p3.years.length; i++) {
    if (p3.years[i] == year) {
      return i;
    }
  }
  return 99999; //An arbitrarily large and clearly false value
}
//These are global variables so they can be set by yearSet and used by modeSet
let highestVA = 0;
let lowestVA = 100000000; //Setting this to an arbitrarily high number
let highestTN = 0;
let max;

//Helper function to help set these maxes, avoids code reuse
const setMaxes = function (year) {
  let index = yearToIndex(year);
  highestVA = 0;
  lowestVA = 100000000; //Setting this to an arbitrarily high number
  highestTN = 0;
  for(let j = 0; j < p3.data.dn.length; j++) { //Finding max/min voting amount, max total number
    if(p3.data.va[j][index] > highestVA){
      highestVA = p3.data.va[j][index];
    }
    if(p3.data.va[j][index] < lowestVA){
      lowestVA = p3.data.va[j][index];
    }
    if(p3.data.tn[j][index] > highestTN){
      highestTN = p3.data.tn[j][index];
    }
    max = 0;
    for (let i = 0; i < p3.data.tn.length; i++) { //Finding the largest vote value to give an
      if (p3.data.dn[i][index] > max) {           //endpoint for our axes
        max = p3.data.dn[i][index];
      }
      if (p3.data.rn[i][index] > max) {
        max = p3.data.rn[i][index];
      }
    }
  }
}

//Helper function to draw a Red/Blue canvas, to help reduce code reuse
const drawRedBlue = function () {
  const canvas = document.getElementById('scat-canvas');
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let k = 0, j = 0; j < scatSize; j++) { //Changing canvas colors
    for (let i = 0; i < scatSize; i++) {
      if (j + i > scatSize) { //Setting Democrat half to blue
        scatImage.data[k++] = 255;
        scatImage.data[k++] = 0;
        scatImage.data[k++] = 0;
        scatImage.data[k++] = 255;
      }
      else { //Setting Republican half to red
        scatImage.data[k++] = 0;
        scatImage.data[k++] = 0;
        scatImage.data[k++] = 255;
        scatImage.data[k++] = 255;
      }
    }
  }
  scatContext.putImageData(scatImage, 0, 0);
}

//Helper function to draw a Purple canvas, to help reduce code reuse
const drawPurple = function () {
  const canvas = document.getElementById('scat-canvas');
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var scat_color = d3.scaleLinear().domain([-1, 1]).range([colorDem, colorRep]);
  for(let k = 0, j = 0; j < scatSize; j++){ //Changing canvas colors
    for(let i = 0; i < scatSize; i++) {
      let val = null;
      let RA = W1_gradient(i);
      let RN = i;
      let DA = W1_gradient(scatSize - j);
      val = 2 * RA/(1 + RA + DA) - 1;
      let rgb= d3.rgb(scat_color(val));
      scatImage.data[k++] = rgb['r'];
      scatImage.data[k++] = rgb['g'];
      scatImage.data[k++] = rgb['b'];
      scatImage.data[k++] = 255;
    }
  }
  scatContext.putImageData(scatImage, 0, 0);
}

//Helper function to draw a Lean vs. Amount canvas, to help reduce code reuse
const drawLvA = function () {
  const canvas = document.getElementById('scat-canvas');
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let index = yearToIndex(year)
  var myColor = d3.scaleLinear().domain([-1, 0, 1]).range([colorDem, "gray", colorRep]);
  var lum = d3.scaleLinear().domain([0, highestVA]).range([0, 0.75]);
  for(let i = 0; i < p3.data.dn.length; i++) { //Setting the colors of the states
    var fill_color = d3.hsl(myColor(p3.data.pl[i][index]));
    fill_color.l = (lum(p3.data.va[i][index]));
    states[i].setAttribute('style', 'fill:' + fill_color);
  }
  let darken = d3.scaleLinear() //Will help determine luminocity of pixels in canvas b.g.
    .domain([0, scatSize])
    .range([0, 255]);
  let color = d3.scaleLinear() //Will help determine redness/blueness of pixels in canvas b.g.
    .domain([0, scatSize / 2])
    .range([0, 255]);
  for (let k = 0, j = 0; j < scatSize; j++) { //Changing canvas colors
    for (let i = 0; i < scatSize; i++) {
      if (i < scatSize / 2) { //Setting Republican half to red
        scatImage.data[k++] = color(i);
        scatImage.data[k++] = color(i);
        scatImage.data[k++] = 255;
        scatImage.data[k++] = 255 - darken(j);
      }
      else { //Setting Democrat half to blue
        scatImage.data[k++] = 255;
        scatImage.data[k++] = 255 - color(i - scatSize / 2);
        scatImage.data[k++] = 255 - color(i - scatSize / 2);
        scatImage.data[k++] = 255 - darken(j);
      }
    }
  }
  scatContext.putImageData(scatImage, 0, 0);
}

const click = function (d, ii) { //this function will be run if you click either a state or a circle
  let stateIndex = abbrToIndex(ii.StateAbbr);
  states[stateIndex].setAttribute('filter', 'drop-shadow(0px 0px 15px white)'); //highlighting
  circles[stateIndex].setAttribute("stroke-width", 5); //highlighting
  if (prevStateIndex != stateIndex && prevStateIndex != null) { //Resetting previous highlights
    states[prevStateIndex].setAttribute('filter', null);
    circles[prevStateIndex].setAttribute("stroke-width", 1);
  }
  let canvas = document.getElementById('scat-canvas');
  if (canvas.getContext) {
    let ctx = canvas.getContext('2d');
    ctx.beginPath();  //making a trajectory in the scatterplot over the years covered
    if (globalMode != "LVA") {
      if (globalMode == "RVD") {
        drawRedBlue();
      }
      else {
        drawPurple();
      }
      for (let i = 0; i < p3.years.length; i++) {
        setMaxes(p3.years[i]);
        if (i == 0) {
          ctx.moveTo( scatSize * (p3.data.ra[stateIndex][i] / max),
          scatSize - scatSize * (p3.data.da[stateIndex][i] / max));
        }
        else {
          ctx.lineTo( scatSize * (p3.data.ra[stateIndex][i] / max),
          scatSize - scatSize * (p3.data.da[stateIndex][i] / max));
        }
      }
    }
    else {
      drawLvA();
      for (let i = 0; i < p3.years.length; i++) {
        setMaxes(p3.years[i]);
        if (i == 0) {
          ctx.moveTo((scatSize / 2) * (p3.data.pl[stateIndex][i]) + scatSize / 2,
          scatSize - scatSize * (p3.data.va[stateIndex][i] / highestVA));
        }
        else {
          ctx.lineTo((scatSize / 2) * (p3.data.pl[stateIndex][i]) + scatSize / 2,
          scatSize - scatSize * (p3.data.va[stateIndex][i] / highestVA));
        }
      }
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.stroke();
  }
  prevStateIndex = stateIndex;
}

const modeSet = function (mode) {
  globalMode = mode;

  //Will be used to find data from this specific year within data
  let index = yearToIndex(year);

  setMaxes(year);

  if (index != 99999) { //Will only enter if year is defined by yearSe
    //creates tooltips for all 3 modes
    var div = d3.select("body")
                .append("div")
                .attr("class", "tooltip-map")
                .style("opacity", 0);

    d3.select("#us-map")
      .selectAll('g')
      .data(p3._data)
      .join('g')
      .on('mouseover', function(d, ii){ //What will happen when user mouses over state
           var DN = ii['DN_' + p3.years[index].toString()];
           var RN = ii['RN_' + p3.years[index].toString()];
           var DE = ii['DE_' + p3.years[index].toString()];
           var RE = ii['RE_' + p3.years[index].toString()]
           d3.select(this)
             .transition()
             .duration('50')
             .attr('opacity', '.85');
           div.transition()
              .duration(50)
              .style("opacity", 1);
           div.html(ii.StateName + ", DN: " + DN + ", RN: " + RN + ", DE: "
                    + DE + ", RE: " + RE);
      })
      .on("mouseout", function(d, ii){ //What will happen when their mouse moves off state
           d3.select(this)
             .transition()
             .duration("50")
             .attr("opacity", '1')
            div.transition()
               .duration("50")
               .style("opacity", 0);
      })
      .on('mousemove', function(d, ii) { //What will happen when their mouse moves within state
        d3.select("tooltip-map")
        .style('left', d.pageX + 'px')
        .style('top', d.pageY + 'px')
      })
      .on('click', (d, ii) => click(d, ii)); //What will happen when user clicks on state
    d3.select('#' + 'scat-marks')
      .selectAll('circle')
      .data(p3._data)
      .attr('cx', (d, ii) => scatSize * (p3.data.ra[ii][index] / max))
      .attr('cy', (d, ii) => scatSize - scatSize * (p3.data.da[ii][index] / max))
      .on('mouseover', function(d, ii){ //What will happen when user mouses over circle
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '.85');
        div.transition()
           .duration(50)
           .style("opacity", 1);
        div.html(ii.StateAbbr);
        })
      .on("mouseout", function(d, ii){ //What will happen when user mouses off circle
        d3.select(this)
          .transition()
          .duration("50")
          .attr("opacity", '1')
         div.transition()
            .duration("50")
            .style("opacity", 0);
      })
      .on('click', (d, ii) => click(d, ii)); //What will happen when user clicks on circle
    //  -------------------- RED / BLUE--------------------
    if (globalMode == 'RVD') {
      document.getElementById('y-axis').innerHTML = 'Democratic Votes';
      document.getElementById('x-axis').innerHTML = 'Republican Votes';

      for (let i = 0; i < p3.data.dn.length; i++) {
        if (p3.data.dn[i][index] >= p3.data.rn[i][index]) { //if there's more democratic votes
          states[i].setAttribute('style', 'fill:blue');
        }
        else { //if there's more republican votes
          states[i].setAttribute('style', 'fill:red');
        }
      }
      drawRedBlue();
    }
    //  -------------------- PURPLE --------------------
    else if(globalMode == 'PUR') {
      document.getElementById('y-axis').innerHTML = 'Democratic Votes';
      document.getElementById('x-axis').innerHTML = 'Republican Votes';

      var myColor = d3.scaleLinear().domain([-1, 0, 1]).range([colorDem, "purple", colorRep]);
      for(let i = 0; i < p3.data.dn.length; i++) {
        states[i].setAttribute('style', 'fill:' + myColor(p3.data.pl[i][index] * 2));
      }
      drawPurple();
    }
    //  -------------------- lEAN VS. AMOUNT --------------------
    else if(globalMode == "LVA") {
      document.getElementById('y-axis').innerHTML = 'Amount of Votes';
      document.getElementById('x-axis').innerHTML = 'Political Leaning';
      drawLvA();
      d3.select('#' + 'scat-marks') //Changing circle positions
        .selectAll('circle')
        .data(p3._data)
        .attr('cx', (d, ii) => (scatSize / 2) * (p3.data.pl[ii][index]) + scatSize / 2)
        .attr('cy', (d, ii) => scatSize - scatSize * (p3.data.va[ii][index] / highestVA));
    }
  }
};

const yearSet = function (year) {
  //Will be used to find data from this specific year within data
  let index = yearToIndex(year);
  setMaxes(year);

  //ModeSet needs to be recalled to change state colors for this year
  if (typeof globalMode !== 'undefined') {
    modeSet(globalMode);
  }

  //Retrieving relevant totals from data
  let dnTotal = 0;
  let rnTotal = 0;
  let deTotal = 0;
  let reTotal = 0;
  for (let i = 0; i < p3.data.dn.length; i++) {
    dnTotal += p3.data.dn[i][index];
    deTotal += p3.data.de[i][index];
    rnTotal += p3.data.rn[i][index];
    reTotal += p3.data.re[i][index];
  }

  //Setting the width of the bars
  let dnBar = dnTotal / (dnTotal + rnTotal);
  let deBar = deTotal / (deTotal + reTotal);

  //Changing the values of the balance bars and text
  document.getElementById('D-pv-txt').innerHTML = dnTotal.toLocaleString();
  document.getElementById('D-pv-bar').setAttribute('width', dnBar);
  document.getElementById('R-pv-txt').innerHTML = rnTotal.toLocaleString();
  document.getElementById('R-pv-bar').setAttribute('width', 1 - dnBar);
  document.getElementById('D-name').innerHTML = p3.name[year].D;
  document.getElementById('R-name').innerHTML = p3.name[year].R;
  document.getElementById('D-ec-txt').innerHTML = deTotal.toString();
  document.getElementById('D-ec-bar').setAttribute('width', deBar);
  document.getElementById('R-ec-txt').innerHTML = reTotal.toString();
  document.getElementById('R-ec-bar').setAttribute('width', 1 - deBar);
};

/* feel free to add any other functions or variables (top-level in this module) you find useful;
   it doesn't matter what order you define them in, thanks to hoisting */
