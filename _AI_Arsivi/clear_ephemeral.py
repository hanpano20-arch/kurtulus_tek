import os

filepath = r"d:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_0.html"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace assignments to clear ephemeral data when _sc is cleared or recomputed
content = content.replace("_sc = {};", "_sc = {}; _ephemeral_ms = {};")

# For _sc = computeAll(..., maxN);
content = content.replace(" _sc = computeAll(", " _ephemeral_ms = {}; _sc = computeAll(")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("CLEARED EPHEMERAL")
