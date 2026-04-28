// 1. Organize your data
const castData = {
    "s1": [
        { name: "Matt Murdock / Daredevil", actor: "Charlie Cox", img: "./images/matt.jpg" },
        { name: "Foggy Nelson", actor: "Elden Henson", img: "./images/foggy.jpg" },
        { name: "Karen Page", actor: "Deborah Ann Woll", img: "./images/karen.png" },
        { name: "James Wesley", actor: "Toby Leonard Moore", img: "./images/wesley.webp" },
        { name: "Ben Urich", actor: "Vondie Curtis-Hall", img: "./images/ben.webp" },
        { name: "Leland Owlsley", actor: "Bob Gunton", img: "./images/leland.jpg" },
        { name: "Vanessa Marianna", actor: "Ayelet Zurer", img: "./images/vanessa.jpg" },
        { name: "Claire Temple", actor: "Rosario Dawson", img: "./images/claire.jpg" },
        { name: "Wilson Fisk", actor: "Vincent D'Onofrio", img: "./images/kingpin.jpg" }
    ],
    "s2": [
        { name: "Matt Murdock / Daredevil", actor: "Charlie Cox", img: "./images/matt.jpg" },
        { name: "Foggy Nelson", actor: "Elden Henson", img: "./images/foggy.jpg" },
        { name: "Karen Page", actor: "Deborah Ann Woll", img: "./images/karen.png" },
        { name: "Frank Castle", actor: "Jon Bernthal", img: "./images/punisher.jpg" },
        { name: "Elektra Natchios", actor: "Elodie Yung", img: "./images/elektra.jpg" },
        { name: "Blake Tower", actor: "Stephen Rider", img: "./images/blake.webp" },
        { name: "Claire Temple", actor: "Rosario Dawson", img: "./images/claire.jpg" },
        { name: "Wilson Fisk", actor: "Vincent D'Onofrio", img: "./images/kingpin.jpg" }
    ],
    "s3": [
        { name: "Matt Murdock / Daredevil", actor: "Charlie Cox", img: "./images/matt.jpg" },
        { name: "Foggy Nelson", actor: "Elden Henson", img: "./images/foggy.jpg" },
        { name: "Karen Page", actor: "Deborah Ann Woll", img: "./images/karen.png" },
        { name: "Benjamin Poindexter", actor: "Wilson Bethel", img: "./images/bullseye.jpg" },
        { name: "Sister Maggie Grace", actor: "Joanne Whalley", img: "./images/maggie.webp" },
        { name: "Rahul \"Ray\" Nadeem", actor: "Jay Ali", img: "./images/ray.webp" },
        { name: "Blake Tower", actor: "Stephen Rider", img: "./images/blake.webp" },
        { name: "Vanessa Marianna", actor: "Ayelet Zurer", img: "./images/vanessa.jpg" },
        { name: "Wilson Fisk", actor: "Vincent D'Onofrio", img: "./images/kingpin.jpg" }
    ],
    "ba1": [
        { name: "Matt Murdock / Daredevil", actor: "Charlie Cox", img: "./images/matt2.jpg" },
        { name: "Wilson Fisk / Kingpin", actor: "Vincent D'Onofrio", img: "./images/kingpin2.jpg" },
        { name: "Frank Castle / Punisher", actor: "Jon Bernthal", img: "./images/punisher2.jpg" },
        { name: "Karen Page", actor: "Deborah Ann Woll", img: "./images/karen2.jpg" },
        { name: "BB Urich", actor: "Genneya Walton", img: "./images/bb_urich.jpg" },
        { name: "Foggy Nelson", actor: "Elden Henson", img: "./images/foggy2.jpg" },
        { name: "Benjamin Poindexter / Bullseye", actor: "Wilson Bethel", img: "./images/bullseye2.png" },
        { name: "Vanessa Fisk", actor: "Ayelet Zurer", img: "./images/vanessa2.jpg" },
        { name: "Heather Glenn", actor: "Margarita Levieva", img: "./images/heather.jpg" },
        { name: "Daniel Blake", actor: "Michael Gandolfini", img: "./images/blade.jpg" },
        { name: "Officer Powell", actor: "Hamish Allan-Headley", img: "./images/powell.jpg" }
    ],
    "ba2": [
        { name: "Matt Murdock / Daredevil", actor: "Charlie Cox", img: "./images/matt2.jpg" },
        { name: "Wilson Fisk / Kingpin", actor: "Vincent D'Onofrio", img: "./images/kingpin2.jpg" },
        { name: "Karen Page", actor: "Deborah Ann Woll", img: "./images/karen2.jpg" },
        { name: "Jessica Jones", actor: "Krysten Ritter", img: "./images/jessica.jpg" },
        { name: "Jacques Duquesne", actor: "Tony Dalton", img: "./images/swordsman.jpg" },
        { name: "Daniel Blake", actor: "Michael Gandolfini", img: "./images/blade.jpg" },
        { name: "Kirsten McDuffie", actor: "Nikki M. James", img: "./images/kirsten.jpg" },
        { name: "Benjamin Poindexter / Bullseye", actor: "Wilson Bethel", img: "./images/bullseye2.png" },
        { name: "Buck Cashman", actor: "Arty Froushan", img: "./images/buck.jpg" },
        { name: "BB Urich", actor: "Genneya Walton", img: "./images/bb_urich.jpg" },
        { name: "Vanessa Fisk", actor: "Ayelet Zurer", img: "./images/vanessa2.jpg" },
        { name: "Heather Glenn", actor: "Margarita Levieva", img: "./images/heather.jpg" },
        { name: "Officer Powell", actor: "Hamish Allan-Headley", img: "./images/powell.jpg" }
    ]
};

// Tooltip for the character cards
const cardTooltip = d3.select("body").append("div")
    .attr("class", "tooltip") // Uses the style already in your cast-style.css
    .style("opacity", 0);

// 2. The function to render cards
function renderCast(seasonKey, wrapperID, dialogueData) {
    const data = castData[seasonKey];
    const wrapper = d3.select(wrapperID);
    
    // Helper for percentage formatting (0.2845 -> 28.5%)
    const formatPercent = d3.format(".1%");
    
    wrapper.selectAll(".character-card")
        .data(data)
        .join(
            enter => {
                const card = enter.append("div").attr("class", "character-card");
                
                card.append("div").attr("class", "character-image-placeholder")
                    .append("img")
                    .attr("src", d => d.img)
                    .style("width", "100%")
                    .style("height", "100%")
                    .style("object-fit", "cover");

                const info = card.append("div").attr("class", "character-info");
                info.append("div").attr("class", "character-name").text(d => d.name);
                info.append("div").attr("class", "actor-name").text(d => d.actor);
                return card;
            },
            update => {
                update.select(".character-name").text(d => d.name);
                update.select(".actor-name").text(d => d.actor);
                update.select("img").attr("src", d => d.img);
                return update;
            },
            exit => exit.remove()
        )
        .on("mouseover", function(event, d) {
            // Match the key format in JSON: prefix_FullName
            let cleanName = d.name.split(' / ')[0];

            // Second, handle specific inconsistencies between castData and JSON keys
            if (cleanName === "Sister Maggie Grace") cleanName = "Sister Maggie";
            if (cleanName.includes("Ray") && cleanName.includes("Nadeem")) cleanName = "Ray Nadeem";
            if (cleanName === "Wilson Fisk / Kingpin") cleanName = "Wilson Fisk"; // Safety for BA seasons
            if (cleanName === "Vanessa Fisk") cleanName = "Vanessa Marianna"; // Safety for BA seasons
            
            const lookupKey = `${seasonKey}_${cleanName}`;
            const dialogueVal = dialogueData[lookupKey] || 0;

            // Transition animation
            cardTooltip.transition().duration(200).style("opacity", 1);
            // Display percentage of season dialogue
            cardTooltip.html(`
                <strong>${d.name}</strong><br/>
                ${formatPercent(dialogueVal)} of Season Dialogue
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            cardTooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            cardTooltip.transition().duration(500).style("opacity", 0);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Load your data files simultaneously
    Promise.all([
        d3.json("script data/dialogue_percentages.json")
    ]).then(([dialogueData]) => {
        
        // Re-render when dropdowns change
        d3.select("#netflix-dropdown").on("change", function(event) {
            renderCast(event.target.value, "#netflix-cast-wrapper", dialogueData);
        });

        d3.select("#ba-dropdown").on("change", function(event) {
            renderCast(event.target.value, "#ba-cast-wrapper", dialogueData);
        });
        // Initial load for both sections
        renderCast("s1", "#netflix-cast-wrapper", dialogueData);
        renderCast("ba1", "#ba-cast-wrapper", dialogueData);

    }).catch(err => console.error("Error loading dialogue data:", err));
});
