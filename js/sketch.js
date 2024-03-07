/*
  big thanks to Brian Honohan
  https://github.com/brianhonohan/sketchbook/blob/main/js/models/quadtree.js
  and Masaru Tainaka
  https://x.com/msr_tainaka/status/1659604770733305856?s=20
*/


function preload(){
  const path = "./img/msrtainaka.jpeg";
  img = loadImage(path);
}

let img;
let quadtree;
let fullCanvas;
let isInverse = true;

function setup() {
  img.resize(1920,1080);
}

function draw(){
  createCanvas(windowWidth, windowHeight);
  isResizing = false;
  window.onresize = () => {
    resizeCanvas(windowWidth, windowHeight);
  }
  frameRate(1)
  let size = windowWidth < windowHeight ? windowHeight * 2 : windowWidth * 2;
  if(windowWidth < windowHeight){
    fullCanvas = new Rect(0 - windowWidth / 2, 0, size, size);
    quadtree = new Quadtree(fullCanvas, 12);
    addRandomPoints(windowWidth/2, windowWidth/4, windowHeight/2, windowHeight/random(4,16));
  }else{
    fullCanvas = new Rect(0, 0 - windowHeight / 2, size, size);
    quadtree = new Quadtree(fullCanvas, 12);
    addRandomPoints(windowWidth/2, windowWidth/random(4,16),windowHeight/2, windowHeight/4);
  }
  push();
      drawQuadtree(quadtree);
  pop();
}

function addRandomPoints(wx,hx,wy,hy){
  for (let i = 0; i < 800; i++){
     quadtree.add({x: randomGaussian(wx, hx),
                   y: randomGaussian(wy, hy)});
  }
}

function keyPressed(){
  if(key === 's'){
    saveCanvas('scrShot', 'png');
  }
}

function drawQuadtree(qt){
  if (qt.expanded){
    qt.quadrants.forEach(q => drawQuadtree(q));
  } else {
    noStroke();
    debris(qt.area.x, qt.area.y, qt.area.width, qt.area.height);
  }
}

function debris(x,y,w,h){
  let c = color(255) //color('rgb(195,255,155)');
  push();
    beginClip({invert : isInverse});
    noStroke();
    push();
      translate(x, y);
      fill(c);
      arc(0,0,w,h,0,PI / 2,PIE);
    pop();
    push();
      translate(x + w, y);
      rotate(PI/2, [x + w, y]);
      fill(c);
      arc(0,0,w,h,0,PI / 2,PIE);
    pop();
    push();
      translate(x,y + h);
      rotate(-PI/2,[x,y+h])
      fill(c);
      arc(0,0,w,h,0,PI / 2,PIE);
    pop();
    push();
      translate(x + w, y + h);
      rotate(PI,[x + w,y + h])
      fill(c);
      arc(0,0,w,h,0,PI / 2,PIE);
    pop();
    endClip();
    push();
      fill(c);
      rect(x,y,w,h);
    pop();
  pop();
  
}

class Quadtree {
  constructor(sizeAndPos, limit){
    this.area = sizeAndPos;
    this.limit = limit;

    this.objects = [];
    this.quadrants = [];
    this.expanded = false;
  }

  add(obj){
    if (!this.area.containsXY(obj.x, obj.y)){
      return false;
    }

    if (this.expanded){
      return this.quadrants.find(q => q.add(obj));
    }

    if (this.objects.length < this.limit) {
      this.objects.push(obj);
      return true;
    }

    this.expand();
    this.redistribute();
    return this.add(obj);
  }

  find(inRect){
    if (this.expanded) {
      return this.quadrants.map(q => q.find(inRect)).flat();
    } else {
      return this.objects.filter(obj => inRect.containsXY(obj.x, obj.y));
    }
  }

  expand(){
    const halfW  = this.area.width / 2;
    const halfH = this.area.height / 2;

    this.quadrants.push(new Quadtree(new Rect(this.area.x, this.area.y, halfW, halfH), this.limit));
    this.quadrants.push(new Quadtree(new Rect(this.area.x + halfW, this.area.y, halfW, halfH), this.limit));
    this.quadrants.push(new Quadtree(new Rect(this.area.x + halfW, this.area.y + halfH, halfW, halfH), this.limit));
    this.quadrants.push(new Quadtree(new Rect(this.area.x, this.area.y + halfH, halfW, halfH), this.limit));
    this.expanded = true;
  }

  redistribute(){
    this.objects.forEach(obj => this.add(obj));
    this.objects.length = 0;
  }
}

class Rect {
  constructor(x, y, p_nWidth, p_nHeight){
    this._x = x;
    this._y = y;
    this._width = p_nWidth;
    this._height = p_nHeight;
  }

  get x(){ return this._x; }
  get y(){ return this._y; }
  get width(){ return this._width; }
  get height(){ return this._height; }
  get minX(){ return this._x; }
  get minY(){ return this._y; }
  get maxX(){ return this._x + this._width; }
  get maxY(){ return this._y + this._height; }
  get centerX(){ return this._x + this._width / 2; }
  get centerY(){ return this._y + this._height / 2; }

  move(x, y){
    this._x += x;
    this._y += y;
  }

  copy(){
    return new Rect(this._x, this._y, this._width, this._height);
  }

  localRect(){
    return new Rect(0, 0, this.width, this.height);
  }

  contains(otherRect){
    return this.minX < otherRect.minX && this.maxX > otherRect.maxX
            && this.minY < otherRect.minY && this.maxY > otherRect.maxY;
  }

  expandToIncludeRect(otherRect){
    let maxX = this.maxX;
    let maxY = this.maxY;

    this._x = Math.min(this._x, otherRect._x);
    this._y = Math.min(this._y, otherRect._y);

    maxX = Math.max(maxX, otherRect.maxX);
    maxY = Math.max(maxY, otherRect.maxY);

    this._width  = maxX - this._x;
    this._height = maxY - this._y;
  }

  containsXY(x, y){ 
    return this.minX <= x && x < this.maxX 
           && this.minY <= y && y < this.maxY;
  }

  getConcentric(scale){
    let newX = this.x - (scale - 1) * this.width / 2;
    let newY = this.y - (scale - 1) * this.height / 2;
    return new Rect(newX, newY, this.width * scale, this.height * scale);
  }
}