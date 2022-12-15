const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");




function render() {
  requestAnimationFrame(render);
  canvas.width = innerWidth;
  canvas.height = innerHeight;



}
requestAnimationFrame(render);




function drawGame() {

}