import "./style.css"
import Vect, { Context, Controls, ControlsType, InputType, Shape, Vector } from 'vect-js';
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

function onLoad () {
  const pendulumContainer = document.createElement('div');
  pendulumContainer.classList.add('section');
  const fieldContainer = document.createElement('div');
  fieldContainer.classList.add('section');
  document.getElementById('container').append(pendulumContainer, fieldContainer);
  render(pendulumContainer, fieldContainer);
  renderControlsUi();
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
    enableMouseMove: true
  });

  const ballPoint = new Shape.Circle(new Vector([theta, thetaDot]), 5, '#FFFFFF');
  const ballVector = new Shape.Arrow(ballPoint.position, new Vector([thetaDot, thetaDoubleDot]), '#FFFFFF');

  ballPoint.onUpdate = function () {
    this.position = new Vector([theta * 100, thetaDot * 100]);
    ballVector.position = this.position;
    ballVector.vector = new Vector([thetaDot * 100, thetaDoubleDot * 100]);
  };

  vect2.addShapes([ballPoint, ballVector]);

  const [topLeft, bottomRight] = vect2.getBoundaries();
  const delta = 50;

  for (let y = topLeft.y - delta; y > bottomRight.y; y -= delta) {
    for (let x = topLeft.x - delta; x < bottomRight.x + delta; x += delta) {
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

function renderControlsUi () {
  let controls = new Controls([
    {
      type: ControlsType.INPUT,
      label: 'Air resistance',
      inputType: InputType.RANGE,
      value: resistance,
      maxValue: resistance + 5,
      minValue: resistance - 5,
      step: 0.1,
      // @ts-ignore
      onInput: e => resistance = e.target.valueAsNumber
    },
    {
      type: ControlsType.INPUT,
      label: 'Gravity',
      inputType: InputType.RANGE,
      value: g,
      maxValue: g + 20,
      minValue: g - 20,
      step: 1,
      // @ts-ignore
      onInput: e => g = e.target.valueAsNumber
    },
    {
      type: ControlsType.INPUT,
      label: 'Delta time',
      inputType: InputType.RANGE,
      value: deltaTime,
      maxValue: deltaTime + 0.4,
      minValue: deltaTime - 0.4,
      step: 0.004,
      // @ts-ignore
      onInput: e => deltaTime = e.target.valueAsNumber
    },
  ], { color: '#FFFFFF', position: 0});

  document.body.appendChild(controls.domElement);
}