import os
import re
import json

# Comprehensive list of words implying religious/Catholic themes
KEYWORDS = [
    "god", "lord", "jesus", "christ", "devil", "satan", "hell", "heaven",
    "catholic", "priest", "nun", "church", "pray", "prayer", "praying",
    "confession", "sin", "sinner", "sins", "forgive", "forgiveness", "grace",
    "faith", "soul", "guilt", "penance", "mass", "holy", "divine",
    "angel", "demon", "redemption", "bible", "cross"
]

def analyze_religious_themes(base_dir):
    # Enforce chronological order for the trendline
    seasons_order = [
        ("netflix", "season 1"),
        ("netflix", "season 2"),
        ("netflix", "season 3"),
        ("born again", "season 1"),
        ("born again", "season 2")
    ]

    # Compile a case-insensitive regex to match whole words only
    # \b makes sure we match "devil" but not "daredevil"
    pattern = re.compile(r'\b(?:' + '|'.join(KEYWORDS) + r')\b', re.IGNORECASE)

    trend_data = []
    global_episode_counter = 1 # Provides a continuous X-axis value for D3

    for series, season in seasons_order:
        dir_path = os.path.join(base_dir, series, season)

        if not os.path.exists(dir_path):
            print(f"Skipping {dir_path} - directory not found.")
            continue

        # Get all text files and sort them numerically by episode (ep1.txt, ep2.txt, etc.)
        files = [f for f in os.listdir(dir_path) if f.startswith('ep') and f.endswith('.txt')]
        files.sort(key=lambda x: int(re.search(r'\d+', x).group()))

        for filename in files:
            file_path = os.path.join(dir_path, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find all occurrences of the keywords
            matches = pattern.findall(content)
            total_count = len(matches)

            # Extract numbers for labeling
            ep_num = int(re.search(r'\d+', filename).group())
            season_num = int(re.search(r'\d+', season).group())
            
            # Create a clean label for your D3 tooltips/axes
            series_abbr = "Net" if series == "netflix" else "BA"
            label = f"{series_abbr} S{season_num}:E{ep_num}"

            trend_data.append({
                "absolute_episode": global_episode_counter,
                "label": label,
                "series": series,
                "season": season_num,
                "episode": ep_num,
                "theme_count": total_count
            })

            global_episode_counter += 1

    # Save output to your script data folder
    output_path = os.path.join(base_dir, "script data", "religious_themes.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as jf:
        json.dump(trend_data, jf, indent=4)

    print(f"Analysis complete. Tracked {len(trend_data)} episodes.")
    print(f"Data saved to {output_path}")

if __name__ == "__main__":
    # Assumes the script is executed from the 'Project 3' root directory
    analyze_religious_themes(".")