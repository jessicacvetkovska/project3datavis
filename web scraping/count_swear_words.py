import os
import re
import json
from collections import defaultdict

# Common swear words to search for (case-insensitive)
SWEAR_WORDS = [
    'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard', 'hell', 'crap',
    'piss', 'dick', 'cunt', 'cock', 'cocksucker', 'fucker', 'bullshit',
    'goddamn', 'god damn', 'fucking', 'fucked',
    'shitty', 'asshole', 'son of a bitch', 's.o.b', 'sob'
]

def count_swear_words(text):
    """Count occurrences of swear words in text (case-insensitive)"""
    text_lower = text.lower()
    counts = {}
    total = 0
    
    for word in SWEAR_WORDS:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(word) + r'\b'
        matches = len(re.findall(pattern, text_lower))
        if matches > 0:
            counts[word] = matches
            total += matches
    
    return counts, total

def analyze_directory(base_path, series_name):
    """Analyze all transcripts in a directory structure"""
    results = {
        'series': series_name,
        'seasons': {}
    }
    
    if not os.path.exists(base_path):
        print(f"Warning: {base_path} does not exist")
        return results
    
    # Get all season directories
    season_dirs = [d for d in os.listdir(base_path) 
                   if os.path.isdir(os.path.join(base_path, d)) and 'season' in d.lower()]
    season_dirs.sort(key=lambda x: int(re.search(r'\d+', x).group()) if re.search(r'\d+', x) else 0)
    
    for season_dir in season_dirs:
        season_path = os.path.join(base_path, season_dir)
        season_num = re.search(r'(\d+)', season_dir).group(1) if re.search(r'\d+', season_dir) else '0'
        
        season_data = {
            'episodes': {},
            'total_swear_words': 0,
            'swear_word_counts': defaultdict(int)
        }
        
        # Get all episode files
        episode_files = [f for f in os.listdir(season_path) if f.endswith('.txt')]
        episode_files.sort(key=lambda x: int(re.search(r'\d+', x).group()) if re.search(r'\d+', x) else 0)
        
        for ep_file in episode_files:
            ep_path = os.path.join(season_path, ep_file)
            ep_num = re.search(r'(\d+)', ep_file).group(1) if re.search(r'\d+', ep_file) else '0'
            
            try:
                with open(ep_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                
                word_counts, total = count_swear_words(text)
                
                season_data['episodes'][f'ep{ep_num}'] = {
                    'total': total,
                    'breakdown': dict(word_counts)
                }
                season_data['total_swear_words'] += total
                
                for word, count in word_counts.items():
                    season_data['swear_word_counts'][word] += count
                    
            except Exception as e:
                print(f"Error reading {ep_path}: {e}")
        
        # Convert defaultdict to dict for JSON serialization
        season_data['swear_word_counts'] = dict(season_data['swear_word_counts'])
        results['seasons'][f's{season_num}'] = season_data
    
    return results

def main():
    # Path to script data folder (two levels up from web scraping folder)
    script_data_path = os.path.join(os.path.dirname(__file__), '..', 'script data')
    
    # Analyze both series
    netflix_path = os.path.join(script_data_path, 'netflix')
    born_again_path = os.path.join(script_data_path, 'born again')
    
    print("Analyzing Netflix series...")
    netflix_results = analyze_directory(netflix_path, 'Netflix')
    
    print("Analyzing Born Again series...")
    born_again_results = analyze_directory(born_again_path, 'Born Again')
    
    # Combine results
    combined = {
        'netflix': netflix_results,
        'born_again': born_again_results
    }
    
    # Save to JSON
    output_path = os.path.join(script_data_path, 'swear_words.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(combined, f, indent=2)
    
    print(f"\nResults saved to: {output_path}")
    
    # Print summary
    print("\n" + "="*50)
    print("SWEAR WORD SUMMARY BY SEASON")
    print("="*50)
    
    for series_name, series_data in [('Netflix', netflix_results), ('Born Again', born_again_results)]:
        print(f"\n{series_name}:")
        for season, data in series_data['seasons'].items():
            print(f"  {season}: {data['total_swear_words']} total swear words")
            if data['swear_word_counts']:
                top_words = sorted(data['swear_word_counts'].items(), key=lambda x: x[1], reverse=True)[:5]
                print(f"    Top words: {', '.join([f'{w}({c})' for w, c in top_words])}")

if __name__ == '__main__':
    main()