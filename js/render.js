import { cameraAngles } from "../data/cameraAngles";

const container = document.querySelector("#camera-container");

cameraAngles.forEach(item => {

  const span = document.createElement("span");

  span.className = item.active
    ? "pill active"
    : "pill";

  span.dataset.val = item.value;

  span.textContent = item.label;

  container.appendChild(span);

});