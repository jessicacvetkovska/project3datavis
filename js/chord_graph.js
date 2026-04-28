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
 
// Initialize tooltip
const chordTooltip = d3.select("body").selectAll(".chord-tooltip")
    .data([null])
    .join("div")
    .attr("class", "tooltip chord-tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("z-index", "1000");

function drawChordDiagram({ container, labels, matrix, colors, title = "" }) {
    const parent = d3.select(container);
    parent.selectAll("*").remove();

    const width = 560;
    const height = 560;
    const cx = width / 2;
    const cy = height / 2;
    const outerR = Math.min(cx, cy) - 100; // Increased margin for longer names
    const innerR = outerR - 22;

    const svg = parent.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

    const g = svg.append("g")
        .attr("transform", `translate(${cx},${cy})`);

    const chordLayout = d3.chord()
        .padAngle(0.04)
        .sortSubgroups(d3.descending);

    const chords = chordLayout(matrix);
    const arc = d3.arc().innerRadius(innerR).outerRadius(outerR);
    const ribbon = d3.ribbon().radius(innerR);
    const color = (i) => colors[i] ?? "#888";

    // ── Chords (Ribbons) ──────────────────────────────────────────────────
    const ribbonPaths = g.append("g")
        .selectAll("path")
        .data(chords)
        .join("path")
        .attr("d", ribbon)
        .attr("fill", d => color(d.source.index))
        .attr("fill-opacity", 0.4)
        .attr("stroke", "none")
        .attr("class", "ribbon")
        // FIX: Added 'd' to the parameters to solve the ReferenceError
        .on("mouseover", function(event, d) {
            // Dim all other ribbons
            d3.selectAll(".ribbon").style("fill-opacity", 0.05);
            d3.select(this).style("fill-opacity", 0.8);

            // Show Tooltip with both character names
            chordTooltip.transition().duration(200).style("opacity", 1);
            chordTooltip.html(`
                <div style="color: #ff0000; font-weight: bold; margin-bottom: 4px;">Connection</div>
                ${labels[d.source.index]} <-> ${labels[d.target.index]}<br/>
                <strong>${matrix[d.source.index][d.target.index]} Episodes Together</strong>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", function(event) {
            chordTooltip.style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.selectAll(".ribbon").style("fill-opacity", 0.4);
            chordTooltip.transition().duration(500).style("opacity", 0);
        });

    // ── Arc Bands ────────────────────────────────────────────────────────
    const group = g.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g")
        .on("mouseover", function(event, d) {
            // Highlight all connections for this character
            d3.selectAll(".ribbon").style("fill-opacity", 0.05);
            d3.selectAll(".ribbon")
                .filter(rib => rib.source.index === d.index || rib.target.index === d.index)
                .style("fill-opacity", 0.8);

            chordTooltip.transition().duration(200).style("opacity", 1);
            chordTooltip.html(`
                <strong style="color: #ff0000;">${labels[d.index]}</strong><br/>
                Total Season Appearances: ${Math.round(d.value)}
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.selectAll(".ribbon").style("fill-opacity", 0.4);
            chordTooltip.transition().duration(500).style("opacity", 0);
        });

    group.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.index))
        .attr("fill-opacity", 0.95);

    // ── Labels & Subtitle ────────────────────────────────────────────────
    const labelR = outerR + 14;

    group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", "0.35em")
        .attr("transform", d => `
            rotate(${(d.angle * 180 / Math.PI) - 90})
            translate(${labelR})
            ${d.angle > Math.PI ? "rotate(180)" : ""}
        `)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
        .attr("fill", d => color(d.index))
        .attr("font-size", "11px")
        .attr("font-family", "'Courier New', Courier, monospace")
        .attr("font-weight", "bold")
        .text(d => labels[d.index]);

    if (title) {
        svg.append("text")
            .attr("x", cx)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "16px")
            .attr("font-family", "'Courier New', Courier, monospace")
            .text(title);
    }
}
