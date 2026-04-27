/**
 * swear_word_barchart.js
 * D3 v6 bar chart visualization for swear word frequency comparison
 * with season filter only (frequency filter removed)
 */

// Censor map for swear words
const CENSOR_MAP_TWO = {
    'fuck': 'f-word', 'shit': 's**t', 'damn': 'd*mn', 'ass': '*ss',
    'bitch': 'b*tch', 'bastard': 'b*stard', 'hell': 'h*ll', 'crap': 'crap',
    'piss': 'p*ss', 'dick': 'd*ck', 'cunt': 'c*nt', 'cock': 'c*ck',
    'cocksucker': 'c*cks*cker', 'fucker': 'f*cker', 'bullshit': 'bulls**t',
    'goddamn': 'g*dd*mn', 'god damn': 'g*d d*mn', 'fucking': 'f**king',
    'fucked': 'f**ked', 'shitty': 's**tty', 'asshole': '*sshole',
    'son of a bitch': 'SOB'
};

function censorWord(word) {
    return CENSOR_MAP_TWO[word.toLowerCase()] || word;
}

function drawSwearWordBarChart({ 
    container = "#viz-container",
    dataUrl = "script data/swear_words.json",
    width = 800,
    height = 450,
    margin = { top: 80, right: 120, bottom: 100, left: 60 }
}) {
    console.log("Initializing bar chart with container:", container);
    
    d3.json(dataUrl).then(data => {
        console.log("Data loaded for bar chart:", data);
        
        const allWords = {};
        const seasonData = {
            'Netflix S1': {},
            'Netflix S2': {},
            'Netflix S3': {},
            'Born Again S1': {},
            'Born Again S2': {}
        };
        
        const netflix = data.netflix.seasons;
        const netflixLabels = ['s1', 's2', 's3'];
        netflixLabels.forEach((s, i) => {
            if (netflix[s]) {
                const label = `Netflix S${i+1}`;
                for (const [word, count] of Object.entries(netflix[s].swear_word_counts)) {
                    seasonData[label][word] = count;
                    allWords[word] = (allWords[word] || 0) + count;
                }
            }
        });
        
        const bornAgain = data.born_again.seasons;
        const baLabels = ['s1', 's2'];
        baLabels.forEach((s, i) => {
            if (bornAgain[s]) {
                const label = `Born Again S${i+1}`;
                for (const [word, count] of Object.entries(bornAgain[s].swear_word_counts)) {
                    seasonData[label][word] = count;
                    allWords[word] = (allWords[word] || 0) + count;
                }
            }
        });
        
        renderBarChart(allWords, seasonData, container, width, height, margin);
    }).catch(err => {
        console.error("Error loading swear word data:", err);
    });
}

function renderBarChart(allWords, seasonData, container, width, height, margin) {
    const parent = d3.select(container);
    
    let wrapper = parent.select("#swear-barchart-wrapper");
    if (wrapper.empty()) {
        wrapper = parent.append("div")
            .attr("id", "swear-barchart-wrapper")
            .attr("class", "barchart-section");
        
        wrapper.append("h2")
            .attr("class", "section-header")
            .text("Swear Word Usage Comparison");
        
        wrapper.append("p")
            .attr("class", "barchart-description")
            .text("Compare which swear words were used most frequently across all seasons");
    } else {
        wrapper.selectAll("*").remove();
        wrapper.append("h2")
            .attr("class", "section-header")
            .text("Swear Word Usage Comparison");
        
        wrapper.append("p")
            .attr("class", "barchart-description")
            .text("Compare which swear words were used most frequently across all seasons");
    }
    
    const filterContainer = wrapper.append("div")
        .attr("class", "filter-controls");
    
    // Season filter ONLY
    filterContainer.append("label")
        .attr("class", "filter-label")
        .text("Season:");
    
    const seasonSelect = filterContainer.append("select")
        .attr("id", "season-filter")
        .attr("class", "custom-dropdown");
    
    seasonSelect.append("option")
        .attr("value", "all")
        .text("All Seasons");
    
    Object.keys(seasonData).forEach(season => {
        seasonSelect.append("option")
            .attr("value", season)
            .text(season);
    });
    
    const chartContainer = wrapper.append("div")
        .attr("class", "barchart-container");
    
    const svgWidth = width - margin.left - margin.right;
    const svgHeight = height - margin.top - margin.bottom;
    
    const svg = chartContainer.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    wrapper.datum({
        allWords: allWords,
        seasonData: seasonData,
        svg: svg,
        svgWidth: svgWidth,
        svgHeight: svgHeight,
        margin: margin,
        width: width,
        height: height
    });
    
    updateChart(wrapper, "all");
    
    seasonSelect.on("change", function() {
        const season = this.value;
        updateChart(wrapper, season);
    });
}

function updateChart(wrapper, selectedSeason) {
    const data = wrapper.datum();
    const { allWords, seasonData, svg, svgWidth, svgHeight } = data;
    
    let filteredWords = [];
    
    if (selectedSeason === "all") {
        filteredWords = Object.entries(allWords)
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count);
    } else {
        const seasonWords = seasonData[selectedSeason] || {};
        filteredWords = Object.entries(seasonWords)
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count);
    }
    
    filteredWords = filteredWords.slice(0, 15);
    
    svg.selectAll("*").remove();
    
    if (filteredWords.length === 0) {
        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight / 2)
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("font-size", "16px")
            .text("No words match the selected filters");
        return;
    }
    
    const x = d3.scaleBand()
        .domain(filteredWords.map(d => censorWord(d.word)))
        .range([0, svgWidth])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredWords, d => d.count) * 1.1])
        .range([svgHeight, 0]);
    
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(filteredWords, d => d.count)])
        .interpolator(d3.interpolateReds);
    
    svg.append("g")
        .attr("transform", `translate(0,${svgHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", "#fff")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    
    svg.selectAll(".domain, .tick line")
        .style("stroke", "#fff");
    
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#fff");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -svgHeight / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "14px")
        .text("Frequency");
    
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
    
    svg.selectAll(".bar")
        .data(filteredWords)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(censorWord(d.word)))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => svgHeight - y(d.count))
        .attr("fill", d => colorScale(d.count))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("fill", "#e63946")
                .attr("stroke-width", 2);
            
            const tooltip = svg.append("g")
                .attr("class", "tooltip")
                .attr("transform", `translate(${x(censorWord(d.word)) + x.bandwidth()/2}, ${y(d.count) - 10})`);
            
            tooltip.append("rect")
                .attr("x", -30)
                .attr("y", -25)
                .attr("width", 60)
                .attr("height", 25)
                .attr("fill", "rgba(0,0,0,0.8)")
                .attr("rx", 5);
            
            tooltip.append("text")
                .attr("text-anchor", "middle")
                .attr("y", -8)
                .style("fill", "#fff")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(d.count);
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .attr("fill", colorScale(d.count))
                .attr("stroke-width", 1);
            
            svg.selectAll(".tooltip").remove();
        });
    
    svg.selectAll(".bar-label")
        .data(filteredWords)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(censorWord(d.word)) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text(d => d.count);
}

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        try {
            drawSwearWordBarChart({
                container: "#viz-container",
                dataUrl: "script data/swear_words.json"
            });
        } catch (e) {
            console.error("Error initializing bar chart:", e);
        }
    }, 500);
});
