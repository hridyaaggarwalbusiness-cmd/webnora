export async function pdf(title, body) {
  const { jsPDF } = await import("jspdf");
  const p = new jsPDF();
  p.setFontSize(22);
  p.text("WEBNORA", 18, 24);
  p.setFontSize(15);
  p.text(title, 18, 40);
  p.setFontSize(11);
  let y = 53;
  for (const line of p.splitTextToSize(body.replaceAll("₹", "INR "), 173)) {
    if (y > 275) {
      p.addPage();
      y = 22;
    }
    p.text(line, 18, y);
    y += 6;
  }
  p.save(title + ".pdf");
}
