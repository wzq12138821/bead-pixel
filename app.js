const upload = document.getElementById("upload");

const inputCanvas = document.getElementById("inputCanvas");
const inputCtx = inputCanvas.getContext("2d");

const outputCanvas = document.getElementById("outputCanvas");
const outputCtx = outputCanvas.getContext("2d");

const SIZE = 32;

// 拼豆色卡（关键：现实约束）
const palette = [
  "#ffffff", "#000000",
  "#ff0000", "#ff9900",
  "#ffff00", "#00ff00",
  "#00ccff", "#0000ff",
  "#ff66cc", "#999999"
];

// 上传图片
upload.addEventListener("change", e => {
  const img = new Image();
  img.onload = () => process(img);
  img.src = URL.createObjectURL(e.target.files[0]);
});

// 主流程
function process(img) {

  // ======================
  // 1. 缩放输入
  // ======================
  inputCanvas.width = SIZE;
  inputCanvas.height = SIZE;
  inputCtx.drawImage(img, 0, 0, SIZE, SIZE);

  const data = inputCtx.getImageData(0,0,SIZE,SIZE).data;

  let rawColors = [];
  let colorSet = new Set();
  let complexity = 0;

  // ======================
  // 2. AI分析 + 优化
  // ======================
  for (let i = 0; i < data.length; i += 4) {

    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];

    let c = nearestColor(r,g,b);

    rawColors.push(c);
    colorSet.add(c);

    if (c !== "#ffffff") complexity++;
  }

  // ======================
  // 3. 成功率模型（核心）
  // ======================
  let colorCount = colorSet.size;

  let score = calcScore(colorCount, complexity);

  showScore(score, colorCount, complexity);

  // ======================
  // 4. AI优化输出
  // ======================
  renderOptimized(rawColors);
}

// 最近颜色匹配（核心AI简化）
function nearestColor(r,g,b) {

  let best = palette[0];
  let bestDist = 999999;

  for (let c of palette) {

    let cr = parseInt(c.slice(1,3),16);
    let cg = parseInt(c.slice(3,5),16);
    let cb = parseInt(c.slice(5,7),16);

    let d = (r-cr)**2 + (g-cg)**2 + (b-cb)**2;

    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }

  return best;
}

// ======================
// 成功率模型
// ======================
function calcScore(colorCount, complexity) {

  let score = 100;

  score -= colorCount * 5;
  score -= complexity * 0.2;

  return Math.max(0, Math.round(score));
}

// ======================
// UI输出
// ======================
function showScore(score, colors, complexity) {

  document.getElementById("scoreBox").innerText =
    `成功率：${score}%`;

  let tips = [];

  if (score > 80) tips.push("✅ 非常适合制作");
  else if (score > 50) tips.push("⚠️ 可制作但建议优化");
  else tips.push("❌ 不建议制作");

  if (colors > 8) tips.push("减少颜色到8种以内");
  if (complexity > 400) tips.push("简化细节");

  document.getElementById("tips").innerText = tips.join("\n");

  document.getElementById("stats").innerText =
    `颜色数：${colors} | 复杂度：${complexity}`;
}

// ======================
// AI优化渲染（核心）
// ======================
function renderOptimized(colorsArr) {

  outputCanvas.width = SIZE;
  outputCanvas.height = SIZE;

  let i = 0;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {

      outputCtx.fillStyle = colorsArr[i++];
      outputCtx.fillRect(x, y, 1, 1);
    }
  }
}
