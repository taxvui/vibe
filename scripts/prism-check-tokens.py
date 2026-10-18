"""Check opaque token contrast; real glass backdrops still need browser review."""
from pathlib import Path
import re

source = (Path(__file__).resolve().parents[1] / "packages/style/src/prism.scss").read_text()
light_source, dark_source = source.split('[data-vibe-prism="dark"]', 1)
dark_source = dark_source.split("}", 1)[0]

def tokens(text):
    return dict(re.findall(r"--prism-([a-z-]+):\s*(#[0-9a-fA-F]{6}|var\(--prism-[a-z-]+\));", text))

def color(values, key):
    value = values[key]
    if value.startswith("var("):
        return color(values, value[12:-1])
    return [int(value[i:i + 2], 16) / 255 for i in (1, 3, 5)]

def luminance(rgb):
    channels = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in rgb]
    return sum(a * b for a, b in zip(channels, (0.2126, 0.7152, 0.0722)))

def ratio(a, b):
    a, b = sorted((luminance(a), luminance(b)))
    return (b + 0.05) / (a + 0.05)

light = tokens(light_source)
for mode, values in (("light", light), ("dark", {**light, **tokens(dark_source)})):
    for foreground, background, minimum in (
        ("foreground", "background", 4.5),
        ("foreground", "surface", 4.5),
        ("muted-foreground", "background", 4.5),
        ("primary-foreground", "primary", 4.5),
        ("primary-foreground", "primary-hover", 4.5),
        ("input", "surface", 3.0),
        ("ring", "surface", 3.0),
    ):
        actual = ratio(color(values, foreground), color(values, background))
        assert actual >= minimum, f"{mode} {foreground}/{background}: {actual:.2f} < {minimum}"
        print(f"PASS {mode} {foreground}/{background}: {actual:.2f}:1")
