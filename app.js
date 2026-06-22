const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const size = 30;

const palette = ["#fff","#000","#f00","#0f0","#00f","#ff0","#0ff","#f0f"];

upload.addEventListener("change", e => {
  const img = new Image();
  img.onload = () => analyze(img);
  img.src = URL.createObjectURL(e.target.files[0]);
});

function analyze(img) {

  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(img, 0, 0, size, size);

  const data = ctx.getImageData(0,0,size,size).data;

  let colorSet = new Set();
  let detail = 0;
  let noise = 0;

  for (let i = 0; i < data.length; i += 4) {

    let c = nearest(data[i], data[i+1], data[i+2]);

    colorSet.add(c);

    if (c !== "#fff") detail++;

    if (Math.abs(data[i]-data[i+1]) > 50) noise++;
  }

  let colorCount = colorSet.size;

  // =========================
  // 🧠 成功率模型
  // =========================

  let score = calcScore(colorCount, detail, noise);

  document.getElementById("score").innerHTML =
    `🧩 成功率：${score}%`;

  // =========================
  // 🎯 挑战系统
  // =========================

  let level = score > 80 ? "简单" : score > 50 ? "中等" : "困难";

  document.getElementById("challenge").innerHTML =
    `🎮 DIY挑战难度：${level}`;

  // =========================
  // 💡 改图建议
  // =========================

  let tips = [];

  if (colorCount > 6) tips.push("减少颜色到6种以内");
  if (detail > 200) tips.push("简化图案细节");
  if (noise > 50) tips.push("去掉背景噪点");

  document.getElementById("tips").innerText =
    tips.join("\n");
}

function calcScore(c, d, n) {
  let s = 100 - c*4 - d*0.2 - n*0.3;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function nearest(r,g,b) {
  return palette[Math.floor(Math.random()*palette.length)];
}
