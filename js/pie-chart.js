//  // Consistent color scale for both charts
//     const color = d3.scaleOrdinal()
//         .range(["#ff0000", "#ec6129", "#7e0808", "#6d6d6d", "#cc6767", "#2b0b0b"]);

document.addEventListener('DOMContentLoaded', function() {
    const width = 400, height = 400, margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    
    // 1. Create a single tooltip div for the whole page
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const color = d3.scaleOrdinal()
        .range([
            "#ff0000", // Pure Red (Matt)
            "#ec6129", // Orange-Red
            "#7e0808", // Dark Blood Red
            "#6d6d6d", // Steel Grey (Foggy/Systems)
            "#cc6767", // Rose Red
            "#2b0b0b", // Deep Black
            "#5e2d2d", // Brownish Red
            "#a50026", // Deep Crimson
            "#d73027", // Brick Red
            "#fdae61", // Golden (City lights)
            "#313695", // Deep Navy (Skyline)
            "#4575b4"  // Steel Blue
        ]);
    d3.json("appearances.json").then(data => {
        
        function initPieChart(containerId, dropdownId, initialPrefix) {
            const svg = d3.select(containerId)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);

            function updatePie(prefix) {
                const filteredData = Object.keys(data)
                    .filter(key => key.startsWith(prefix))
                    .map(key => ({
                        name: key.replace(prefix + "_", ""),
                        value: data[key]
                    }));

                const pie = d3.pie().value(d => d.value);
                const data_ready = pie(filteredData);
                const arc = d3.arc().innerRadius(0).outerRadius(radius);
                const labelArc = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);

                // 2. Modified Slices with Tooltip Listeners
                svg.selectAll('path')
                    .data(data_ready)
                    .join("path")
                    .transition().duration(500)
                    .attr('d', arc)
                    .attr('fill', d => color(d.data.name))
                    .attr("stroke", "#000")
                    .style("stroke-width", "2px")
                    .style("opacity", 0.8);

                // Re-select paths to attach non-transitioning events
                svg.selectAll('path')
                    .on("mouseover", function(event, d) {
                        d3.select(this).style("opacity", 1).style("stroke", "#fff");
                        tooltip.transition().duration(200).style("opacity", 1);
                        tooltip.html(`<strong>${d.data.name}</strong><br/>${d.data.value} Episodes`)
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mousemove", function(event) {
                        tooltip.style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        d3.select(this).style("opacity", 0.8).style("stroke", "#000");
                        tooltip.transition().duration(300).style("opacity", 0);
                    });

                // Labels update logic remains the same
                svg.selectAll('text')
                    .data(data_ready)
                    .join("text")
                    .text(d => d.data.name)
                    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
                    .style("text-anchor", "middle")
                    .attr("class", "pie-label")
                    .style("font-weight", "bold");
            }

            updatePie(initialPrefix);
            d3.select(dropdownId).on("change", (event) => updatePie(event.target.value));
        }

        initPieChart("#netflix-pie-chart-container", "#netflix-pie-dropdown", "net_s1");
        initPieChart("#ba-pie-chart-container", "#ba-pie-dropdown", "ba_s1");
    });
});