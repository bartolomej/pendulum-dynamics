import "./style.css"
import Vect, { Vector, Shape, Context } from 'vect-js';
import { MouseState } from "vect-js/lib/types/graphics/types";
import chroma = require("chroma-js");


window.addEventListener('load', onLoad);

let resistance = 0.01;
let g = 40.8;
let L = 100;

let deltaTime = 0.1;
let theta0 = Math.PI; // prev theta
let theta = Math.PI; // 60 deg
let thetaDot = 0;
let thetaDoubleDot = 0;
let displacementX = 0;

function getThetaDoubleDot (theta: number, thetaDot: number) {
  return -resistance * thetaDot - (g / L) * Math.sin(theta);
}

function getThetaDot (time: number, theta: number, thetaDot: number) {
  for (let t = 0; t < time / deltaTime; t += deltaTime) {
    const thetaDoubleDot = getThetaDoubleDot(theta, thetaDot);
    theta += thetaDot * deltaTime;
    thetaDot += thetaDoubleDot * deltaTime;
  }
  return thetaDot;
}

function onLoad () {
  const pendulumContainer = document.createElement('div');
  pendulumContainer.classList.add('section');
  const fieldContainer = document.createElement('div');
  fieldContainer.classList.add('section');
  document.getElementById('container').append(pendulumContainer, fieldContainer);
  render(pendulumContainer, fieldContainer);
}

function render (pendulumContainer: HTMLElement, fieldContainer: HTMLElement) {

  function setInitialParams (position: Vector) {
    L = position.abs();
    theta0 = theta;
    theta = Math.acos(-position.y / L);
    thetaDot = (theta - theta0) / deltaTime;
    thetaDoubleDot = getThetaDoubleDot(theta, thetaDot);
  }

  // RENDER PENDULUM
  const vect1 = Vect(Context.CANVAS_2D, {
    container: pendulumContainer,
    backgroundColor: '#000000',
    displayNumbers: false,
    displayBasis: false,
    displayGrid: true,
  });

  const pendulumEnd = new Vector([displacementX,-L]);
  const pendulum = new Shape.Arrow(null, pendulumEnd, '#FFFFFF', null, false);
  const ball = new Shape.Circle(pendulumEnd, 10, '#FFFFFF');

  theta = Math.acos(-pendulumEnd.y / L);
  setInitialParams(pendulumEnd);

  ball.onDrag = function (m: MouseState) {
    this.position = m.position;
    pendulum.vector = m.position;
    setInitialParams(this.position);
  };

  ball.onUpdate = function () {
    if (this.isPressed) return;
    theta += thetaDot * deltaTime;
    thetaDot += getThetaDoubleDot(theta, thetaDot) * deltaTime;
    this.position = new Vector([Math.sin(theta) * L, -Math.cos(theta) * L]);
    pendulum.vector = this.position;
  };

  vect1.addShapes([pendulum, ball]);


  // RENDER VECTOR FIELD
  const vect2 = Vect(Context.CANVAS_2D, {
    container: fieldContainer,
    backgroundColor: '#000000',
    displayNumbers: false,
    displayBasis: false,
    displayGrid: true,
  });

  const maxSpan = vect2.getMax();
  const diff = 50;

  const ballPoint = new Shape.Circle(new Vector([theta, thetaDot]), 5, '#FFFFFF');
  const ballV = new Shape.Arrow(ballPoint.position, new Vector([thetaDot, thetaDoubleDot]), '#FFFFFF');

  ballPoint.onUpdate = function () {
    this.position = new Vector([theta * 100, thetaDot * 100]);
    ballV.position = this.position;
    ballV.vector = new Vector([thetaDot * 100, thetaDoubleDot * 100]);
  };

  vect2.addShapes([ballPoint, ballV]);

  for (let y = maxSpan.y - diff; y > -maxSpan.y; y -= diff) {
    for (let x = maxSpan.x - diff; x > -maxSpan.x + diff; x -= diff) {
      // y => theta dot
      // x => theta
      let thetaDot = y * deltaTime;
      let theta = x * deltaTime;
      let p = new Vector([x, y]);
      let v = new Vector([
        thetaDot,
        getThetaDoubleDot(theta, thetaDot)
      ]).scalarProduct(10);
      let s = new Shape.Arrow(p, v, '#FFFFFF');
      s.unitScale = true;
      s.unitScaleFactor = 30;
      s.color = chroma((v.abs() / 10), 1, 0.6, 'hsl').hex('rgba');

      vect2.addShape(s);
    }
  }
}