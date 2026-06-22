const size = 30;
let selectedColor = "#ff0000";
let isDrawing = false;

const colors = [
  "#ffffff", "#000000",
  "#ff0000", "#ff9900",
  "#ffff00", "#00ff00",
  "#00ccff", "#0000ff",
  "#ff66cc", "#999999"
];

let gridData = Array.from({ length: size }, () =>
  Array(size).fill("#ffffff")
);

// ----------------------
// 初始化
// ----------------------

const grid = document.getElementById("grid");

function initGrid() {
  grid.innerHTML = "";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      const cell = document.createElement("div");
      cell.className = "cell";

      function paint() {
        gridData[y][x] = selectedColor;
        cell.style.background = selectedColor;
      }

      cell.addEventListener("mousedown", () => {
        isDrawing = true;
        paint();
      });

      cell.addEventListener("mouseover", () => {
        if (isDrawing) paint();
      });

      cell.addEventListener("mouseup", () => {
        isDrawing = false;
      });

      grid.appendChild(cell);
    }
  }
}

document.body.addEventListener("mouseup", () => {
  isDrawing = false;
});

// ----------------------
// 调色板
// ----------------------

const palette = document.getElementById("palette");

colors.forEach(c => {
  const div = document.createElement("div");
  div.className = "color";
  div.style.background = c;

  div.onclick = () => {
    selectedColor = c;
    document.querySelectorAll(".color").forEach(el => {
      el.classList.remove("active");
    });
    div.classList.add("active");
  };

  palette.appendChild(div);
});

// 默认选中
document.querySelectorAll(".color")[0].classList.add("active");

// ----------------------
// 清空
// ----------------------

function clearGrid() {
  gridData = gridData.map(row => row.map(() => "#ffffff"));
  document.querySelectorAll(".cell").forEach(c => {
    c.style.background = "#ffffff";
  });
}

// ----------------------
// 图片转拼豆
// ----------------------

document.getElementById("upload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  const img = new Image();
  img.onload = () => convertImage(img);
  img.src = URL.createObjectURL(file);
});

function convertImage(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(img, 0, 0, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      let i = (y * size + x) * 4;

      let color = nearestColor(
        data[i],
        data[i+1],
        data[i+2]
      );

      gridData[y][x] = color;
    }
  }

  render();
}

// 最近颜色匹配
function nearestColor(r, g, b) {
  let best = colors[0];
  let bestDist = 999999;

  colors.forEach(c => {
    let cr = parseInt(c.substr(1,2),16);
    let cg = parseInt(c.substr(3,2),16);
    let cb = parseInt(c.substr(5,2),16);

    let d = Math.pow(r-cr,2)+Math.pow(g-cg,2)+Math.pow(b-cb,2);

    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  });

  return best;
}

// ----------------------
// 渲染
// ----------------------

function render() {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    let x = i % size;
    let y = Math.floor(i / size);
    cell.style.background = gridData[y][x];
  });
}

// ----------------------
// 导出 PNG
// ----------------------

function exportPNG() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = gridData[y][x];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const link = document.createElement("a");
  link.download = "bead.png";
  link.href = canvas.toDataURL();
  link.click();
}

// ----------------------
// 保存作品
// ----------------------

function saveProject() {
  let name = prompt("作品名称：");
  if (!name) return;

  let list = JSON.parse(localStorage.getItem("projects") || "[]");

  list.push({ name, grid: gridData });

  localStorage.setItem("projects", JSON.stringify(list));

  loadProjects();
}

// ----------------------
// 读取作品
// ----------------------

function loadProjects() {
  let list = JSON.parse(localStorage.getItem("projects") || "[]");

  const box = document.getElementById("projects");
  box.innerHTML = "";

  list.forEach((p, index) => {
    let div = document.createElement("div");
    div.innerText = p.name;

    div.onclick = () => {
      gridData = p.grid;
      render();
    };

    box.appendChild(div);
  });
}

// ----------------------
// 启动
// ----------------------

initGrid();
loadProjects();
