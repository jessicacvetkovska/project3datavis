/**
 * D3 v6 trendline visualization for religious themes across seasons
 */

// Censor map for swear words
const RELIGION_KEYWORDS = [
    "god", "lord", "jesus", "christ", "devil", "satan", "hell", "heaven",
    "catholic", "priest", "nun", "church", "pray", "prayer", "praying",
    "confession", "sin", "sinner", "sins", "forgive", "forgiveness", "grace",
    "faith", "soul", "guilt", "penance", "mass", "holy", "divine",
    "angel", "demon", "redemption", "bible", "cross"
]

function religiousWord(word) {
    return RELIGION_KEYWORDS[word.toLowerCase()] || word;
}

function drawReligionTrendline({ 
    container = "#viz-container",
    dataUrl = "script data/religious_themes.json",
    width = 800,
    height = 400,
    margin = { top: 40, right: 120, bottom: 60, left: 60 }
}) {
    // Fetch and process data
    d3.json(dataUrl).then(data => {
        // Group the flat array into season totals
        const seasonAggregates = {};

        data.forEach(d => {
            // Create a unique key for each season (e.g., "netflix_1")
            const key = `${d.series}_${d.season}`;
            
            if (!seasonAggregates[key]) {
                seasonAggregates[key] = {
                    series: d.series === 'netflix' ? 'Netflix' : 'Born Again',
                    season: d.series === 'netflix' ? `S${d.season}` : `BA S${d.season}`,
                    // offset Born Again seasons by 3 to maintain the X-axis timeline
                    seasonNum: d.series === 'netflix' ? d.season : 3 + d.season, 
                    total: 0,
                    episodes: 0
                };
            }
            
            // Add the episode's word count to the season total
            seasonAggregates[key].total += d.theme_count;
            seasonAggregates[key].episodes += 1;
        });

        // Convert the aggregated object back into an array and sort chronologically
        const trendData = Object.values(seasonAggregates).sort((a, b) => a.seasonNum - b.seasonNum);
        
        renderReligionTrendline(trendData, container, width, height, margin);
    }).catch(err => {
        console.error("Error loading religion data:", err);
    });
}

function renderReligionTrendline(data, container, width, height, margin) {
    const parent = d3.select(container);
    
    // Create wrapper div for the trendline
    let wrapper = parent.select("#religion-trendline-wrapper");
    if (wrapper.empty()) {
        wrapper = parent.append("div")
            .attr("id", "religion-trendline-wrapper")
            .attr("class", "religion-trendline-section");
        
        wrapper.append("h2")
            .attr("class", "religion-section-header")
            .text("Religious Themes Trendline");
        
        wrapper.append("p")
            .attr("class", "religion-trendline-description")
            .text("Religious themes by key word per season across Netflix's Daredevil and Born Again series");
    } else {
        wrapper.selectAll("*").remove();
        wrapper.append("h2")
            .attr("class", "religion-section-header")
            .text("Religious Themes Trendline");
        
        wrapper.append("p")
            .attr("class", "religion-trendline-description")
            .text("Religious themes by key word per season across Netflix's Daredevil and Born Again series");
    }
    
    const svgWidth = width - margin.left - margin.right;
    const svgHeight = height - margin.top - margin.bottom;
    
    const svg = wrapper.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scalePoint()
        .domain(data.map(d => d.season))
        .range([0, svgWidth])
        .padding(0.5);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total) * 1.1])
        .range([svgHeight, 0]);
    
    // Color scale for series
    const colorScale = d3.scaleOrdinal()
        .domain(['Netflix', 'Born Again'])
        .range(['#e63946', '#457b9d']);
    
    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${svgHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "14px")
        .style("fill", "#fff");
    
    svg.selectAll(".domain, .tick line")
        .style("stroke", "#fff");
    
    // Y Axis
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "14px")
        .style("fill", "#fff");
    
    // Y Axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -svgHeight / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "14px")
        .text("Total Religious Words");
    
    // X Axis label
    svg.append("text")
        .attr("y", svgHeight + 50)
        .attr("x", svgWidth / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "14px")
        .text("Season");
    
    // Grid lines
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickSize(-svgWidth)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#ccc")
        .style("stroke-opacity", 0.3);
    
    svg.selectAll(".grid .domain").remove();
    
    // Line generator
    const line = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.total))
        .curve(d3.curveMonotoneX);
    
    // Draw the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#e63946")
        .attr("stroke-width", 3)
        .attr("d", line);
    
    // Draw dots
    const dots = svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.season))
        .attr("cy", d => y(d.total))
        .attr("r", 8)
        .attr("fill", d => colorScale(d.series))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
    
    // Add tooltips
    dots.append("title")
        .text(d => `${d.season}\n${d.series}\nTotal: ${d.total} Religious words\nEpisodes: ${d.episodes}`);
    
    // Add labels on dots
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.season))
        .attr("y", d => y(d.total) - 15)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(d => d.total);
    
    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${svgWidth + 20}, 20)`);
    
    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Legend");
    
    ['Netflix', 'Born Again'].forEach((series, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${20 + i * 25})`);
        
        g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colorScale(series));
        
        g.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .style("fill", "#fff")
            .style("font-size", "12px")
            .text(series);
    });
    
    // Add average line
    const avg = d3.mean(data, d => d.total);
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", svgWidth)
        .attr("y1", y(avg))
        .attr("y2", y(avg))
        .attr("stroke", "#ffd700")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
    
    svg.append("text")
        .attr("x", svgWidth - 5)
        .attr("y", y(avg) - 5)
        .attr("text-anchor", "end")
        .style("fill", "#ffd700")
        .style("font-size", "11px")
        .text(`Avg: ${Math.round(avg)}`);
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    drawReligionTrendline({
        container: "#viz-container",
        dataUrl: "script data/religious_themes.json"
    });
});