import re
import sys

def convert_schema(input_path, output_path):
    with open(input_path, 'r') as f:
        content = f.read()

    # 1. Change provider
    content = re.sub(r'provider\s*=\s*"postgresql"', 'provider = "sqlite"', content)

    # 2. Change URL
    content = re.sub(r'url\s*=\s*env\("DATABASE_URL"\)', 'url = "file:./test.db"', content)

    # 3. Remove directUrl
    content = re.sub(r'directUrl\s*=\s*env\("DIRECT_URL"\)', '', content)

    # 4. Remove enums and replace with String
    enums = re.findall(r'enum\s+(\w+)\s+\{[^}]*\}', content)
    for enum_name in enums:
        content = re.sub(r':\s+' + enum_name, ': String', content)
        content = re.sub(r'\s+' + enum_name + r'\?', ' String?', content)
        content = re.sub(r'\s+' + enum_name + r'(\s+)', ' String\\1', content)

    content = re.sub(r'enum\s+\w+\s+\{[^}]*\}', '', content)

    # 5. Change String[] to String? (make it optional and string)
    content = content.replace('String[]', 'String?')

    # 6. Change Int[] to String?
    content = content.replace('Int[]', 'String?')

    # 7. Remove @unique from date in QuizSession to allow multiple sessions per day for matching
    content = content.replace('date        DateTime @unique', 'date        DateTime')

    # 8. Remove unsupported index attributes
    content = re.sub(r',\s*type:\s*\w+', '', content)

    # 9. Remove db attributes
    content = content.replace('@db.Text', '')
    content = content.replace('@db.Date', '')

    with open(output_path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    convert_schema(sys.argv[1], sys.argv[2])
