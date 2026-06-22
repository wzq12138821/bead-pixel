const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const origin = document.getElementById("origin");
const rate = document.getElementById("rate");
const tipsBox = document.getElementById("tips");

const size = 40;

const palette = [
  "#ffffff","#000000",
  "#ef4444","#f97316",
  "#eab308","#22c55e",
  "#06b6d4","#3b82f6",
  "#a855f7","#ec4899"
];

// ✅ 确保 DOM ready
window.onload = () => {
  bindUpload();
};

function bindUpload() {

  upload.addEventListener("change", (e) => {

    console.log("文件已选择"); // 👈 用于调试

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(evt) {

      console.log("图片加载成功");

      const img = new Image();

      img.onload = function () {
        origin.src = img.src;
        analyze(img);
      };

      img.src = evt.target.result;
    };

    reader.readAsDataURL(file);
  });
}

// =========================
// 核心分析
// =========================

function analyze(img) {

  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(img, 0, 0, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;

  let usedColors = new Set();
  let complexity = 0;

  let idx = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      let i = idx * 4;

      let c = matchColor(
        data[i],
        data[i+1],
        data[i+2]
      );

      usedColors.add(c);

      if (c !== "#ffffff") complexity++;

      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);

      idx++;
    }
  }

  // =========================
  // 成功率模型
  // =========================

  let colorCount = usedColors.size;

  let score = 100 - colorCount * 4 - complexity * 0.1;
  score = Math.max(0, Math.round(score));

  rate.innerText = score + "%";

  // =========================
  // AI建议
  // =========================

  let tips = [];

  if (colorCount > 8) {
    tips.push("建议减少颜色到 8 种以内");
  }

  if (complexity > 500) {
    tips.push("建议简化图案细节");
  }

  tips.push(score > 60 ? "✅ 可以制作" : "⚠️ 建议优化后再做");

  tipsBox.innerHTML = tips.join("<br>");
}

// =========================
// 颜色匹配
// =========================

function matchColor(r,g,b) {

  let best = palette[0];
  let bestD = Infinity;

  for (let c of palette) {

    let cr = parseInt(c.substr(1,2),16);
    let cg = parseInt(c.substr(3,2),16);
    let cb = parseInt(c.substr(5,2),16);

    let d = (r-cr)**2 + (g-cg)**2 + (b-cb)**2;

    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }

  return best;
}
