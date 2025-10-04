document.addEventListener("DOMContentLoaded", () => {
  const colors = ["#6a11cb", "#2575fc", "#fc466b", "#3f5efb"];
  let i = 0;
  setInterval(() => {
    document.body.style.background = `linear-gradient(135deg, ${colors[i]}, ${
      colors[(i + 1) % colors.length]
    })`;
    i = (i + 1) % colors.length;
  }, 5000);
});
