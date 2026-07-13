import re

with open('reconstructed.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all occurrences of t.jsx(VAR, or t.jsxs(VAR
# where VAR is not a string literal starting with ' or "
matches = re.findall(r't\.(?:jsx|jsxs)\(([^,\s)]+)', content)

unique_vars = set(matches)
non_string_vars = []
for v in unique_vars:
    if not (v.startswith('"') or v.startswith("'") or v.startswith("t.")):
        non_string_vars.append(v)

print("Non-string elements in JSX calls:")
print(sorted(non_string_vars))
