#!/usr/bin/env python3
"""
Generate manuale-utente-screenshots.tex from manuale-utente.tex
by replacing \\screenshotplaceholder invocations with \\includegraphics subfigures.
"""

import re
import os

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'docs', 'manuale-utente.tex')
OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'manuale-utente-screenshots.tex')

# Screenshots that were NOT captured (keep as placeholders)
MISSING = {'dialog-overlap', 'dialog-waitlist-offer', 'dialog-iscrizione-successo', 'dialog-iscrizione-errore'}

with open(INPUT, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add \usepackage{subcaption} after \usepackage{float}
content = content.replace(
    r'\usepackage{float}',
    r'\usepackage{float}' + '\n' + r'\usepackage{subcaption}'
)

# 2. Find and replace each \screenshotplaceholder{...}{...}{...}{LABEL}
# The macro invocations are multi-line. We need a regex that matches them.
# Pattern: \screenshotplaceholder{...}{...}{...}{...}
# where each {...} can span multiple lines and can contain nested braces.

def match_braces(text, start):
    """Find the matching closing brace for an opening brace at position start.
    Returns the index of the closing brace."""
    assert text[start] == '{', f"Expected '{{' at position {start}, got '{text[start]}'"
    depth = 1
    i = start + 1
    while i < len(text) and depth > 0:
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
        elif text[i] == '\\':
            i += 1  # skip escaped character
        i += 1
    return i - 1  # position of closing brace

def find_all_placeholders(text):
    """Find all \\screenshotplaceholder invocations and return their positions and arguments."""
    results = []
    pattern = r'\\screenshotplaceholder'
    for m in re.finditer(pattern, text):
        # Skip the command definition
        # Check if this is the \newcommand definition (has [4] after it)
        pos_after = m.end()
        # Skip whitespace
        while pos_after < len(text) and text[pos_after] in ' \t\n\r':
            pos_after += 1
        # If next char is '[', this is the definition - skip
        if text[pos_after] == '[':
            continue

        # Now read 4 brace-delimited arguments
        args = []
        pos = m.end()
        for _ in range(4):
            # Skip whitespace and comments
            while pos < len(text):
                if text[pos] in ' \t\n\r':
                    pos += 1
                elif text[pos] == '%':
                    # Skip to end of line
                    while pos < len(text) and text[pos] != '\n':
                        pos += 1
                    pos += 1
                else:
                    break

            if pos >= len(text) or text[pos] != '{':
                break

            close = match_braces(text, pos)
            arg_content = text[pos+1:close]
            args.append(arg_content)
            pos = close + 1

        if len(args) == 4:
            results.append({
                'start': m.start(),
                'end': pos,
                'description': args[0],
                'instructions': args[1],
                'caption': args[2],
                'label': args[3],
            })

    return results

placeholders = find_all_placeholders(content)
print(f"Found {len(placeholders)} placeholder invocations")

# 3. Replace each placeholder (from end to start to preserve positions)
for ph in reversed(placeholders):
    label = ph['label']
    caption = ph['caption']

    if label in MISSING:
        # Keep the original placeholder for missing screenshots
        print(f"  KEEPING placeholder: {label} (missing screenshot)")
        continue

    # Build the replacement subfigure block
    replacement = f"""\\begin{{figure}}[htbp]
\\centering
\\begin{{subfigure}}[t]{{0.62\\textwidth}}
  \\centering
  \\includegraphics[width=\\textwidth]{{screenshots_for_manual/{label}.png}}
  \\caption{{Desktop}}
\\end{{subfigure}}
\\hfill
\\begin{{subfigure}}[t]{{0.30\\textwidth}}
  \\centering
  \\includegraphics[width=\\textwidth]{{screenshots_for_manual/{label}-mobile.png}}
  \\caption{{Mobile}}
\\end{{subfigure}}
\\caption{{{caption}}}
\\label{{fig:{label}}}
\\end{{figure}}"""

    content = content[:ph['start']] + replacement + content[ph['end']:]
    print(f"  Replaced: {label}")

# 4. Write output
with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nWrote: {OUTPUT}")
print(f"Total placeholders: {len(placeholders)}")
print(f"Replaced: {len(placeholders) - len(MISSING)}")
print(f"Kept as placeholders: {len(MISSING)}")
