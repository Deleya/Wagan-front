import json
import codecs

with codecs.open(r'C:\Users\DELL\.gemini\antigravity\brain\bd9c55bb-b772-4d8f-a3c3-b3e15beb592f\scratch\extracted_auth.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# The key in json is literally "\"c:\\workspace\\wagan-front\\src\\page\\auth\\authSlice.ts\""
auth_slice_key = '"c:\\\\workspace\\\\wagan-front\\\\src\\\\page\\\\auth\\\\authSlice.ts"'
content = data[auth_slice_key].strip('"').replace('\\n', '\n')

with codecs.open(r'c:\workspace\wagan-front\src\page\auth\authSlice.ts', 'w', encoding='utf-8') as f:
    f.write(content)
