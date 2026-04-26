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
        { name: "Foggy Nelson", actor: "Elden Henson", img: "./images/foggy2.jpg" },
        { name: "Benjamin Poindexter / Bullseye", actor: "Wilson Bethel", img: "./images/bullseye2.png" },
        { name: "Vanessa Fisk", actor: "Ayelet Zurer", img: "./images/vanessa2.jpg" },
        { name: "Heather Glenn", actor: "Margarita Levieva", img: "./images/heather.jpg" },
        { name: "Daniel Blade", actor: "Michael Gandolfini", img: "./images/blade.jpg" }
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
        { name: "Vanessa Fisk", actor: "Ayelet Zurer", img: "./images/vanessa.jpg" },
        { name: "Heather Glenn", actor: "Margarita Levieva", img: "./images/heather.jpg" }
    ]
};

// 2. The function to render cards
function renderCast(seasonKey, wrapperID) {
    const data = castData[seasonKey];
    const wrapper = d3.select(wrapperID);

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
        );
}

// Listeners for each independent dropdown
d3.select("#netflix-dropdown").on("change", function(event) {
    renderCast(event.target.value, "#netflix-cast-wrapper");
});

d3.select("#ba-dropdown").on("change", function(event) {
    renderCast(event.target.value, "#ba-cast-wrapper");
});

// Initial load for both sections
renderCast("s1", "#netflix-cast-wrapper");
renderCast("ba1", "#ba-cast-wrapper");