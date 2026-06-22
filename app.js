const size = 20;
let selectedColor = "#ff0000";

const colors = [
  "#ff0000", "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#000000", "#ffffff"
];

let gridData = Array.from({ length: size }, () =>
  Array(size).fill("#ffffff")
);

// 初始化调色板
const palette = document.getElementById("palette");

colors.forEach(color => {
  const div = document.createElement("div");
  div.className = "color";
  div.style.background = color;
  div.onclick = () => selectedColor = color;
  palette.appendChild(div);
});

// 创建网格
const grid = document.getElementById("grid");

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    cell.onclick = () => {
      gridData[y][x] = selectedColor;
      cell.style.background = selectedColor;
    };

    grid.appendChild(cell);
  }
}

// 清空
function clearGrid() {
  gridData = gridData.map(row => row.map(() => "#ffffff"));
  document.querySelectorAll(".cell").forEach(c => {
    c.style.background = "#ffffff";
  });
}

// 导出 PNG
function exportImage() {
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
  link.download = "bead-pattern.png";
  link.href = canvas.toDataURL();
  link.click();
}