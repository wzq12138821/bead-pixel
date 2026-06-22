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

let img = null;

// =========================
// 上传图片
// =========================

upload.addEventListener("change", (e) => {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(evt) {

    img = new Image();

    img.onload = () => {
      origin.src = img.src;
      analyze();
    };

    img.src = evt.target.result;
  };

  reader.readAsDataURL(file);
});

// =========================
// AI分析 + 优化
// =========================

function analyze() {

  if (!img) return;

  canvas.width = size;
  canvas.height = size;

  // 🧠 AI简化（模拟）
  ctx.filter = "contrast(1.2) saturate(0.8)";
  ctx.drawImage(img, 0, 0, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;

  let colorSet = new Set();
  let complexity = 0;

  let idx = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      let i = idx * 4;

      let color = matchColor(
        data[i],
        data[i+1],
        data[i+2]
      );

      colorSet.add(color);

      if (color !== "#ffffff") complexity++;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);

      idx++;
    }
  }

  // =========================
  // 🧠 成功率模型（结构版）
  // =========================

  let colorCount = colorSet.size;

  let score =
    100 -
    colorCount * 4 -
    complexity * 0.1;

  score = Math.max(0, Math.round(score));

  rate.innerText = score + "%";

  // =========================
  // 💡 AI建议
  // =========================

  let tips = [];

  if (colorCount > 8) {
    tips.push("🎨 建议减少颜色到 8 种以内");
  }

  if (complexity > 500) {
    tips.push("🧩 建议简化结构细节");
  }

  tips.push(score > 60
    ? "✅ 可以制作"
    : "⚠️ 建议优化后再制作"
  );

  tipsBox.innerHTML = tips.join("<br>");
}

// =========================
// 颜色匹配
// =========================

function matchColor(r,g,b) {

  let best = palette[0];
  let bestD = Infinity;

  for (let c of palette) {

    let cr = parseInt(c.slice(1,3),16);
    let cg = parseInt(c.slice(3,5),16);
    let cb = parseInt(c.slice(5,7),16);

    let d = (r-cr)**2 + (g-cg)**2 + (b-cb)**2;

    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }

  return best;
}

// =========================
// PDF生成
// =========================

function generatePDF() {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("🧩 DIY Maker AI 制作方案", 10, 10);

  pdf.setFontSize(12);
  pdf.text("成功率：" + rate.innerText, 10, 25);

  pdf.text("制作建议：", 10, 40);
  pdf.text("- 控制颜色在8种以内", 10, 50);
  pdf.text("- 简化结构复杂度", 10, 60);

  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(imgData, "PNG", 10, 70, 120, 120);

  pdf.save("DIY-plan.pdf");
}
