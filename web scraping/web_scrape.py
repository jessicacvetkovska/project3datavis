import os
from bs4 import BeautifulSoup
import requests as req

# Define the target directory and file path
directory_path = os.path.join("netflix", "season 1")
file_path = os.path.join(directory_path, "ep1.txt")

# Create the nested directories if they do not exist (exist_ok=True prevents errors if it's already there)
os.makedirs(directory_path, exist_ok=True)

# Requesting the website
response = req.get('https://genius.com/Daredevil-into-the-ring-script-annotated')

if response.status_code == 200:
    # Creating a BeautifulSoup object and specifying the parser
    S = BeautifulSoup(response.content, 'html.parser')

    # Find all divs that hold the actual transcript/lyrics
    lyric_containers = S.find_all('div', attrs={'data-lyrics-container': 'true'})
    
    # Open the file in write mode ('w') with UTF-8 encoding to avoid character map errors
    with open(file_path, 'w', encoding='utf-8') as file:
        for container in lyric_containers:
            # get_text() extracts all the text inside the HTML tags.
            # separator='\n' ensures that <br> tags are converted into newlines.
            transcript_text = container.get_text(separator='\n', strip=True)
            
            # Write the text block to the file
            file.write(transcript_text + '\n\n')
            
    print(f"Success! Transcript saved to: {file_path}")
else:
    print(f"Failed to retrieve the webpage. Status code: {response.status_code}")