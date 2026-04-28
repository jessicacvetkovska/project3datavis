import os
import re
import json

def calculate_dialogue_percentages(base_dir):
    # Map full names to the exact first names/alias used in the script labels
    character_map = {
        "Matt Murdock": ["Matt", "Daredevil"],
        "Foggy Nelson": ["Foggy"],
        "Karen Page": ["Karen"],
        "Wilson Fisk": ["Fisk", "Kingpin", "Wilson"],
        "Benjamin Poindexter": ["Dex", "Bullseye", "Poindexter"],
        "Kirsten McDuffie": ["Kirsten"],
        "Frank Castle": ["Frank", "Punisher"],
        "Blake Tower": ["Blake", "Tower"],
        "Elektra Natchios": ["Elektra"],
        "Claire Temple": ["Claire"],
        "James Wesley": ["Wesley"],
        "Ben Urich": ["Ben"],
        "Leland Owlsley": ["Leland"],
        "Vanessa Marianna": ["Vanessa"],
        "Ray Nadeem": ["Rahul", "Ray", "Nadeem"],
        "Sister Maggie": ["Maggie"],
        "Heather Glenn": ["Heather"],
        "Daniel Blake": ["Daniel"],
        "BB Urich": ["BB"],
        "Officer Powell": ["Officer Powell", "Powell", "Connor"],
        "Buck Cashman": ["Buck"],
        "Jacques Duquesne": ["Jacques", "Jack", "Duquesne", "Swordsman"],
        "Jessica Jones": ["Jessica"]
    }

    seasons_to_process = [
        ("netflix", "season 1", "s1"),
        ("netflix", "season 2", "s2"),
        ("netflix", "season 3", "s3"),
        ("born again", "season 1", "ba1"),
        ("born again", "season 2", "ba2")
    ]

    dialogue_percentages = {}

    for series, season, prefix in seasons_to_process:
        dir_path = os.path.join(base_dir, series, season)
        
        if not os.path.exists(dir_path):
            print(f"Skipping {dir_path} - directory not found.")
            continue

        # Track line counts for specific season
        season_counts = {char: 0 for char in character_map.keys()}
        total_season_dialogue = 0

        files = [f for f in os.listdir(dir_path) if f.endswith('.txt')]

        for filename in files:
            with open(os.path.join(dir_path, filename), 'r', encoding='utf-8') as f:
                content = f.read()

                for char_full, labels in character_map.items():
                    char_count = 0
                    for label in labels:
                        clean_label = re.escape(label)
                        # Regex matches [Label] or Label: ensuring it captures speaker tags
                        pattern = rf"(\[.*?\b{clean_label}\b.*?\])|(^|\n)\b{clean_label}\b\s*:"
                        matches = re.findall(pattern, content, re.IGNORECASE)
                        char_count += len(matches)
                    
                    season_counts[char_full] += char_count
                    total_season_dialogue += char_count

        # Convert raw counts to decimal percentages
        for char_full, count in season_counts.items():
            if total_season_dialogue > 0:
                # Calculate the percentage and round to 4 decimal places
                percentage = round(count / total_season_dialogue, 4)
            else:
                percentage = 0.0
            
            # Only save characters that actually spoke in this season to keep JSON clean
            if percentage > 0:
                unique_key = f"{prefix}_{char_full}"
                dialogue_percentages[unique_key] = percentage

    # Output to the script data directory
    output_dir = os.path.join(base_dir, "script data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "dialogue_percentages.json")

    with open(output_file, 'w', encoding='utf-8') as jf:
        json.dump(dialogue_percentages, jf, indent=4)

    print(f"Success! Dialogue percentages saved to {output_file}")

if __name__ == "__main__":
    calculate_dialogue_percentages(".")
