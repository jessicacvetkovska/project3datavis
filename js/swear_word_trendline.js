/**
 * swear_word_trendline.js
 * D3 v6 trendline visualization for swear word frequency across seasons
 */

// Censor map for swear words
const CENSOR_MAP = {
    'fuck': 'f-word', 'shit': 's**t', 'damn': 'd*mn', 'ass': '*ss',
    'bitch': 'b*tch', 'bastard': 'b*stard', 'hell': 'h*ll', 'crap': 'crap',
    'piss': 'p*ss', 'dick': 'd*ck', 'cunt': 'c*nt', 'cock': 'c*ck',
    'cocksucker': 'c*cks*cker', 'fucker': 'f*cker', 'bullshit': 'bulls**t',
    'goddamn': 'g*dd*mn', 'god damn': 'g*d d*mn', 'fucking': 'f**king',
    'fucked': 'f**ked', 'shitty': 's**tty', 'asshole': '*sshole',
    'son of a bitch': 'SOB'
};

function censorWord(word) {
    return CENSOR_MAP[word.toLowerCase()] || word;
}

function drawSwearWordTrendline({ 
    container = "#viz-container",
    dataUrl = "script data/swear_words.json",
    width = 800,
    height = 400,
    margin = { top: 40, right: 120, bottom: 60, left: 60 }
}) {
    // Fetch and process data
    d3.json(dataUrl).then(data => {
        // Process data into trendline format
        const trendData = [];
        
        // Netflix seasons (s1, s2, s3)
        const netflix = data.netflix.seasons;
        for (let i = 1; i <= 3; i++) {
            const seasonKey = 's' + i;
            if (netflix[seasonKey]) {
                trendData.push({
                    series: 'Netflix',
                    season: 'S' + i,
                    seasonNum: i,
                    total: netflix[seasonKey].total_swear_words,
                    episodes: Object.values(netflix[seasonKey].episodes).length
                });
            }
        }
        
        // Born Again seasons (s1, s2)
        const bornAgain = data.born_again.seasons;
        for (let i = 1; i <= 2; i++) {
            const seasonKey = 's' + i;
            if (bornAgain[seasonKey]) {
                trendData.push({
                    series: 'Born Again',
                    season: 'BA S' + i,
                    seasonNum: 3 + i, // Continues after Netflix
                    total: bornAgain[seasonKey].total_swear_words,
                    episodes: Object.values(bornAgain[seasonKey].episodes).length
                });
            }
        }
        
        renderTrendline(trendData, container, width, height, margin);
    }).catch(err => {
        console.error("Error loading swear word data:", err);
    });
}

function renderTrendline(data, container, width, height, margin) {
    const parent = d3.select(container);
    
    // Create wrapper div for the trendline
    let wrapper = parent.select("#swear-trendline-wrapper");
    if (wrapper.empty()) {
        wrapper = parent.append("div")
            .attr("id", "swear-trendline-wrapper")
            .attr("class", "trendline-section");
        
        wrapper.append("h2")
            .attr("class", "section-header")
            .text("Swear Word Frequency Trendline");
        
        wrapper.append("p")
            .attr("class", "trendline-description")
            .text("Total swear words per season across Netflix's Daredevil and Born Again series");
    } else {
        wrapper.selectAll("*").remove();
        wrapper.append("h2")
            .attr("class", "section-header")
            .text("Swear Word Frequency Trendline");
        
        wrapper.append("p")
            .attr("class", "trendline-description")
            .text("Total swear words per season across Netflix's Daredevil and Born Again series");
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
        .text("Total Swear Words");
    
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
        .text(d => `${d.season}\n${d.series}\nTotal: ${d.total} swear words\nEpisodes: ${d.episodes}`);
    
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
    drawSwearWordTrendline({
        container: "#viz-container",
        dataUrl: "script data/swear_words.json"
    });
});