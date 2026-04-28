import os
import re
import json

def update_season_appearances(directory_path, character_list, prefix, output_file="appearances.json"):
    """
    Scans a season directory and appends prefixed results to a central JSON.
    Example Prefix: 'netflix_s1' or 'ba_s2'
    """
    # 1. Load existing data or start fresh
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            all_data = json.load(f)
    else:
        all_data = {}

    # 2. Calculate counts for THIS specific season
    season_counts = {char: 0 for char in character_list}
    
    try:
        files = [f for f in os.listdir(directory_path) if f.endswith('.txt')]
    except FileNotFoundError:
        print(f"Error: Directory '{directory_path}' not found.")
        return

    for filename in files:
        with open(os.path.join(directory_path, filename), 'r', encoding='utf-8') as f:
            content = f.read()
            for char_full_name in character_list:
                name_parts = char_full_name.split(' / ')
                found = False
                for part in name_parts:
                    clean_part = re.escape(part.strip())
                    # Regex matches [MATT] or Matt:
                    pattern = rf"(\[.*?\b{clean_part}\b.*?\])|(^|\n)\b{clean_part}\b\s*:"
                    if re.search(pattern, content, re.IGNORECASE):
                        found = True
                        break
                if found:
                    season_counts[char_full_name] += 1

    # 3. Add to the main dictionary with the prefix
    # Format: "netflix_s1_Matt Murdock / Daredevil"
    for char, count in season_counts.items():
        unique_key = f"{prefix}_{char}"
        all_data[unique_key] = count

    # 4. Save the expanded dataset
    with open(output_file, 'w', encoding='utf-8') as jf:
        json.dump(all_data, jf, indent=4)
    
    print(f"Successfully appended {prefix} data to {output_file}.")

# --- CONFIGURATION ---
# Just update these two variables for each run
current_season_dir = "../Project 3/born again/season 2" 
current_prefix = "ba_s2" 

# Characters from your established cast list
character_list = [
    "Matt", "Foggy", "Karen", 
    "Fisk", "BB", "Poindexter", "Kirsten", 
    "Vanessa", "Heather", "Daniel", "Powell", "Jessica", "Buck",
    "Jack"
]

if __name__ == "__main__":
    update_season_appearances(current_season_dir, character_list, current_prefix)