// -----------------------------------------------------------------------------
/* globals 
p5, midiToFreq, frameRate, colorMode, HSB, noLoop, loop, redraw,
angleMode, DEGREES, cos, sin, atan2, TAU, min, max, shuffle, dist, floor, ceil, 
createCanvas, resizeCanvas, windowWidth, windowHeight, 
clear, line, width, height, point, mouseX, mouseY, ellipse, 
fullscreen, background, stroke, color, fill, text, noFill, keyCode, 
push, pop, translate, rotate, frameCount, 
clip, range, randrange, midpoint, randelem, apl, mod, argmin, transpose, 
uniquify, renorm, spinpick, sortby, 
*/

new p5()

//const TAU = Math.PI*2
var osc // oscillator, for playing sound
var sound = false
var x, y // coordinates
var theta = 0 // angle
var dif = 1 // how much to change theta each step
var stride = 1 // how many pixels to move each step
var grid = [] // keeping track of every pixel we've been at
var natt = 3  // number of attractors
var exc = 0 // how many attractors around the last one to exclude
var att = [] // list of attractors (points to move to move towards)
var cur = att[0] // current point
var chunk = 1000 // how many steps to do at once
var guts = 1 // which algorithm to run
var mp = 1 // max tread on any pixel
var la = 0 // index of last attractor chosen
var xcom // x-value of the center of mass
var ycom // y-value of the center of mass
var tot = 0 // total number of treads

// Move forward d pixels from (x,y) at angle theta, and update (x,y)
function fwd(d) {
  var oldx = x
  var oldy = y
  //x = clip(x + d * cos(theta), 0, width ) // don't go outside the screen!
  //y = clip(y + d * sin(theta), 0, height)
  x += d * cos(theta)
  y += d * sin(theta)
  line(oldx, oldy, x, y)
}

function reset() { 
  x = Math.floor(width/2)  //+ .5
  y = Math.floor(height/2) //+ .5
  xcom = x
  ycom = y
  tot = 0
  theta = 0
  dif = 1
  stride = TAU/2/360*min(width,height)
  //stride = 50
  
  for (var i = 0; i <= width; i++) {
    var cols = []
    for (var j = 0; j <= height; j++) {
      cols[j] = 0
    }
    grid[i] = cols
  }
  
  clear()
  background(0)
  fill('BlueViolet')
  text(
    `Danny, Bee, Faire, Cantor Soule-Reeves\n` +
    `The screen is ${width} pixels wide and ${height} pixels high\n` +
    `The turtle started at (${x},${y})\n` + 
    `For hexwalk it steps forward ${stride} pixels at a time\n` +
    `The white line traces the center of mass\n` +
    'Type f to toggle full-screen, ' +
    's for sound, ' +
    'r to reset, ' +
    'h or click to toggle hyperspeed',
    5, 15)
  
  //genattractors(natt).map(([x,y]) => ellipse(x,y,10))
}

// Coordinate transform so we can think of the origin as being at the center of 
// the canvas and the edges at -1 to +1 and convert to where the upper left 
// corner is (0,0) and the bottom right is (N-1,N-1)
function coort(x, y) {
  var n = min(width, height)
  return [n/2 * (1+x), n/2 * (1-y)]
}

// Convert from polar to cartesian, with r=1 and the given theta, using pixel 
// coordinates per coort()
function radcart(theta) {
  return coort(Math.cos(theta), Math.sin(theta))
}

// Generate a list of points spread out on a big circle
function genattractors(n) {
  return range(n).map(i => radcart(i*TAU/n))
}

// For example, rgb(20,10,10) becomes rgb(255,127,127)
function brightcolor(r, g, b) { 
  var m = max(r,g,b)
  return color(255/m*r, 255/m*g, 255/m*b)
}

function setrandcolor() {
  var redmin = 0; var redmax = 255
  var grnmin = 0; var grnmax = 255
  var blumin = 0; var blumax = 255
  stroke(brightcolor(randrange(redmin,redmax),
                     randrange(grnmin,grnmax),
                     randrange(blumin,blumax)))
}

function playrandnote() {
  // 41 is about the lowest we can hear
  // 129 the highest daddy (age 42) can hear
  // 134 is the highest faire (age 10) and cantor (age 8) can hear
  // 138 is the highest the computer can do
  var notemin = 50
  var notemax = 110
  if (sound) { osc.freq(midiToFreq(randrange(notemin, notemax))) }
}

function chaos() {
  //setrandcolor()
  const ex2 = ceil(exc/2)
  var a = mod(randrange(la+ex2, la+ex2+natt-1-exc), natt)
  la = a
  cur = midpoint(cur, att[la]).map(Math.floor)
  //cur = midpoint(cur, randelem(att)).map(Math.floor)
  var n = grid[cur[0]][cur[1]]
  stroke(-.83*n/mp+.67, 1, 1)
  //apl((x,y)=>ellipse(x,y,1+grid[cur[0]][cur[1]]), cur)
  apl(point, cur)
  grid[cur[0]][cur[1]] += 1
  if (n+1 > mp) { mp += 1 }
}

function hexwalk() {
  setrandcolor()
  // Randomly turn and then walk forward
  if (x < 0 || x > width || y < 0 || y > height) {
    theta = (theta + 180) % 360 // too far! outside the box! turn around!
  } else {
    //theta = (theta + randrange(-1,1)) % 360
    //theta = (theta + dif) % 360
    //dif = dif*1.01 % 360
    theta = (theta + randrange(0,5)*60) % 360
  }
  //stride = (361 - dif)/10
  //stride = min(width,height)/(16*randint(2))
  stride = randrange(1,2)*25
  fwd(stride)
}

function spirals() {
  // setup: RGB color mode, start at top of screen, set stride length
  setrandcolor()
  // Randomly turn and then walk forward
  if (x < 0 || x > width || y < 0 || y > height) {
    theta = (theta + 180) % 360 // too far! outside the box! turn around!
  } else {
    //theta = (theta + randrange(-1,1)) % 360
    theta = (theta + dif) % 360
    dif = dif*1.0001 % 360
    //theta = (theta + randrange(0,5)*60) % 360
  }
  //stride = (361 - dif)/10
  //stride = min(width,height)/(16*randint(2))
  //stride = randrange(1,2)*25
  fwd(stride)
}

function star() {
  setrandcolor()
  for (var i = 0; i < 180; i++) {
    fwd(500)
    theta += 30
    fwd(20)
    theta -= 60
    fwd(250)
    theta += 30
    x = width/2
    y = height/2
    theta += 2
  }
}

// Plot a point at (x,y) and shift the color from blue to pink the more times
// that a point is plotted there; also plot the center of mass in white
function plotxy(x, y) {
  var n = grid[x][y]
  grid[x][y] += 1
  tot += 1
  xcom = (tot-1)/tot*xcom + x/tot
  ycom = (tot-1)/tot*ycom + y/tot
  stroke(mod(-.83*n/mp+.67, 1), 1, 1)
  if (n+1 > mp) { mp = n+1 }
  point(x, y)
  stroke(1, 0, 1)
  //point(xcom, ycom) // plot the center of mass in white
  //ellipse(xcom, ycom, 100, 100)
}

// Return the 8 points neighboring point p, wrapping at the edges
function neighbors(p) {
  var x = p[0]
  var y = p[1]
  return [
    [mod(x-1,width), mod(y-1,height)],
    [mod(x-1,width), mod(y+0,height)],
    [mod(x-1,width), mod(y+1,height)],
    [mod(x+0,width), mod(y-1,height)],
    [mod(x+0,width), mod(y+1,height)],
    [mod(x+1,width), mod(y-1,height)],
    [mod(x+1,width), mod(y+0,height)],
    [mod(x+1,width), mod(y+1,height)],
  ]
}

// Return the 8 points neighboring point p, no wrapping
function neighbors2(p) {
  var x = p[0]
  var y = p[1]
  return uniquify([
    //[clip(x-1,0,width-1), clip(y-1,0,height-1)],
    [clip(x-1,0,width-1), clip(y+0,0,height-1)],
    [clip(x-1,0,width-1), clip(y+1,0,height-1)],
    [clip(x+0,0,width-1), clip(y-1,0,height-1)],
    [clip(x+0,0,width-1), clip(y+1,0,height-1)],
    [clip(x+1,0,width-1), clip(y-1,0,height-1)],
    [clip(x+1,0,width-1), clip(y+0,0,height-1)],
    [clip(x+1,0,width-1), clip(y+1,0,height-1)],
  ])
}

// Return how many times we've tread on point p before
function treads(p) { return grid[p[0]][p[1]] }

// Return a higher number for least tread-upon pixels
function invtreads(p) { return mp - treads(p) }

function pixwalk() {
  x += randrange(0,2)-1
  y += randrange(0,2)-1
  //x += randelem([0,0,0,0,0,1,1,1,1,1,1,-1,-1,-1,-1,-1])
  //y += randelem([0,0,0,0,0,1,1,1,1,1,1,-1,-1,-1,-1,-1])
  x = mod(x, width)
  y = mod(y, height)
  plotxy(x, y)
}

function teleport() {
  var nbrs = shuffle(neighbors2([x,y]))
  var p = argmin(nbrs, treads)
  if (treads(p) < treads([x,y])) {
    x = p[0]
    y = p[1]
  } else {
    x = randrange(0,width-1)
    y = randrange(0,height-1)
  }
  plotxy(x, y)
}

// Self-avoiding path
function sap() {
  var nbrs = shuffle(neighbors2([x,y]))
  var p = argmin(nbrs, treads)
  x = p[0]
  y = p[1]
  plotxy(x, y)
}

function probs(w) {
  var x = w.map(x=>x+1) // make sure there are no zeros
  var t = x.reduce((a,b)=>a*b)
  return renorm(x.map(x=>t/x))
}

// Drop a pixel and keep moving it to a neighbor, favoring ones with lower tread
function sand() {
  x = Math.floor(width/2) //Math.floor(randrange(0,width-1))
  y = Math.floor(height/2) //Math.floor(randrange(0,height-1))
  var curx = x
  var cury = y
  var lastx, lasty
  var poss, weights, newpoint
  var i = 0
  do {
    i += 1
    lastx = curx
    lasty = cury
    poss = neighbors([curx,cury])
    poss.unshift([curx,cury])
    poss = shuffle(poss)
    //weights = poss.map(invtreads)  
    //newpoint = spinpick(poss, weights)
    newpoint = argmin(poss, treads)
    curx = newpoint[0]
    cury = newpoint[1]
    //console.log(`${curx},${cury}`)
  } while ((lastx !== curx || lasty !== cury))
  plotxy(curx, cury)
}

function angleto(p1, p2) { return atan2(p2[1]-p1[1], p2[0]-p1[0]) }
function distance(p1, p2) { return dist(p1[0], p1[1], p2[0], p2[1]) }

// Random walk but prefer to move away from the center of mass
function fleecom() {
  var nbrs = shuffle(neighbors([x,y]))
  //var theta = mod(atan2(ycom-y, xcom-x) + 180, 360) 
  var pickme = argmin(nbrs, p => 100*treads(p)+distance([xcom,ycom], p))
  x = pickme[0]
  y = pickme[1]
  plotxy(x, y)
}

function circspin(x, y, level) {
  //background(0)
  if (level === 0) return
  push()
  translate(x, y)
  rotate(TAU/8 + frameCount/1)  // was frameCount/100
  fill(mod(-.83*(7-level)/7+.67, 1), 1, 1)
  var factor = 20
  var size = level * factor
  ellipse(0, 0, size, size)
  circspin(-level * factor*0.85, 0, level-1)
  circspin( level * factor*0.85, 0, level-1)
  pop()
}

function toggleHyperspeed() {
  chunk = chunk === 1 ? 13000/frameRate() : 1
}

function commonSetup() {
  angleMode(DEGREES) // use degrees instead of radians  
  createCanvas(windowWidth, windowHeight) // fill the window
  console.log(`The screen is ${width} pixels wide and ${height} pixels high`)
  osc = new p5.Oscillator()
  frameRate(1) // 60 fps is about the most it can do
}

// -----------------------------------------------------------------------------
// Special p5.js functions -----------------------------------------------------
// -----------------------------------------------------------------------------

function setup() {
  commonSetup()
  colorMode(HSB, 1)
  att = genattractors(natt) 
  cur = att[0]
  reset()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  reset()
}

function mousePressed() {
  plotxy(mouseX, mouseY)
  toggleHyperspeed()
  console.log("MP")
}

function mouseDragged() {
  ellipse(mouseX, mouseY, width/128, height/128)
  return false // prevent default (not sure what that means)
}

function doubleClicked() {
  console.log("DC")
}

function keyPressed() {
  if (keyCode === 83) {
    sound = !sound
    if (sound) { osc.start() } else { osc.stop() }
    console.log(`Sound ${sound}`)
  } else if (keyCode === 70)  {
    fullscreen(!fullscreen())
    reset()
  } else if (keyCode === 82) {
    reset()
  } else if (keyCode === 72) {
    toggleHyperspeed()
  } else if (false && keyCode === 67) {
    noLoop()
    chunk = 1000000
    redraw()
    chunk = 1
    loop()
  } else {
    console.log(`You pressed key ${keyCode}`)
  }
}

function draw() {
  playrandnote()
  //background(0)
  for (var i = 0; i < chunk; i++) {
    //circspin(x, y, 4)
    //guts()
    //hexwalk()
    //chaos()
    pixwalk()
    //sap()
    //fleecom()
    //spirals()
  }
}



// -----------------------------------------------------------------------------
// Bad ideas
// -----------------------------------------------------------------------------

// Helper for com()
function comrow(r) {
  var denom = r.reduce((p,c) => p+c)
  if (denom === 0) { return (r.length + 1) / 2 - 1 }
  return r.reduce((prev, cur, i) => prev + cur*i, 0) / denom
}

// Center of mass of the grid
function com() {
  var avgx = comrow(grid.map(r => comrow(r)))
  //var avgy = comrow(transpose(grid).map(r => cn [avgx, avgy]
}

