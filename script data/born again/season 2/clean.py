import re
import os
from pathlib import Path


def clean_script_in_place(file_path):
    if not os.path.exists(file_path):
        print(f"Error: The file '{file_path}' does not exist.")
        return

    try:
        # 1. Read the content into memory
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 2. Perform cleaning logic
        # Remove <script> and <ins> blocks
        content = re.sub(r'<(script|ins).*?>.*?</\1>', '', content, flags=re.DOTALL | re.IGNORECASE)
        # Remove all remaining HTML tags
        content = re.sub(r'<.*?>', '', content)
        # Remove tags
        content = re.sub(r'\\', '', content)
        # Remove literal backslashes (Fixed with double backslash)
        content = re.sub(r'\\', '', content)

        # 3. Format lines
        lines = content.splitlines()
        cleaned_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped:
                # Transform "[Character]" to "CHARACTER:"
                stripped = re.sub(r'^\[([A-Za-z\s]+)\]', r'\1:', stripped)
                cleaned_lines.append(stripped)

        final_script = "\n\n".join(cleaned_lines)

        # 4. Overwrite the original file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_script)
            
        print(f"Successfully updated '{file_path}' in place.")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

for path in Path('.').iterdir():
    if path.suffix == '.txt':
        clean_script_in_place(path.name)
