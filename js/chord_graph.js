/**
 * chord-diagram.js
 * Reusable D3 v6 chord diagram.
 *
 * Usage:
 *   drawChordDiagram({
 *     container: "#my-div",   // CSS selector for the parent element
 *     labels:  [...],         // array of character names
 *     matrix:  [[...]],       // symmetric 2-D co-appearance counts
 *     colors:  [...],         // one color string per character
 *     title:   "Season 1",    // optional subtitle
 *   });
 */
 
function drawChordDiagram({ container, labels, matrix, colors, title = "" }) {
  const parent = d3.select(container);
  parent.selectAll("*").remove();               // clear on redraw
 
  const width  = 560;
  const height = 560;
  const cx     = width  / 2;
  const cy     = height / 2;
  const outerR = Math.min(cx, cy) - 90;        // leave room for labels
  const innerR = outerR - 22;
 
  const svg = parent.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width",  "100%")
    .attr("height", "100%");
 
  const g = svg.append("g")
    .attr("transform", `translate(${cx},${cy})`);
 
  // ── D3 chord layout ──────────────────────────────────────────────────────
  const chordLayout = d3.chord()
    .padAngle(0.04)
    .sortSubgroups(d3.descending);
 
  const chords = chordLayout(matrix);
 
  const arc     = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const ribbon  = d3.ribbon().radius(innerR);
 
  const color = (i) => colors[i] ?? "#888";
 
  // ── Chords (ribbons) ─────────────────────────────────────────────────────
  g.append("g")
    .selectAll("path")
    .data(chords)
    .join("path")
      .attr("d", ribbon)
      .attr("fill",         d => color(d.source.index))
      .attr("fill-opacity", 0.38)
      .attr("stroke",       "none")
    .append("title")
      .text(d =>
        `${labels[d.source.index]} ↔ ${labels[d.target.index]}: ${matrix[d.source.index][d.target.index]} episodes`
      );
 
  // ── Arc bands ────────────────────────────────────────────────────────────
  const group = g.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");
 
  group.append("path")
    .attr("d",            arc)
    .attr("fill",         d => color(d.index))
    .attr("fill-opacity", 0.95)
    .attr("stroke",       "none")
    .append("title")
      .text(d => `${labels[d.index]}: ${Math.round(d.value)} total appearances`);
 
  // ── Labels ───────────────────────────────────────────────────────────────
  const labelR = outerR + 14;
 
  group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy",        "0.35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI) - 90})
      translate(${labelR})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    .attr("fill",        d => color(d.index))
    .attr("font-size",   "11px")
    .attr("font-family", "monospace")
    .attr("font-weight", "bold")
    .text(d => labels[d.index]);
 
  // ── Subtitle ─────────────────────────────────────────────────────────────
  if (title) {
    svg.append("text")
      .attr("x", cx)
      .attr("y", height - 8)
      .attr("text-anchor", "middle")
      .attr("fill",        "#666")
      .attr("font-size",   "10px")
      .attr("font-family", "monospace")
      .text(title);
  }
}