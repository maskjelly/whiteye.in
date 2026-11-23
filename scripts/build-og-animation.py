#!/usr/bin/env python3
"""Render the animated home-page social card to public/og.gif.

The horse mark flies in, bursts into dots, and the dots settle into the name card.
The loop starts on the finished card, so platforms that only show the first frame
still get the whole design. Requires Pillow, numpy, ffmpeg and gifsicle.

    python3 scripts/build-og-animation.py
"""

import math
import re
import subprocess
import tempfile
import urllib.request
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/og.gif"
STILL = ROOT / "public/og.png"
# Layers for the live card at /card (app/card/route.ts): the backdrop and the text on transparency.
BACKDROP = ROOT / "public/og-base.png"
TEXT = ROOT / "public/og-text.png"

W, H, S, FPS = 1200, 630, 2, 20
TITLE, SUBTITLE = "Aaryan Singh", "engineer · 20"

BG = (247, 246, 245)
INK = (25, 25, 25)
MUTED = (150, 149, 146)
GRID = (226, 225, 222)
ACCENT = (42, 20, 230)
CORAL = (255, 92, 56)
SUN = (255, 186, 0)
MINT = (0, 170, 130)
FLIGHT = [ACCENT, CORAL, SUN, MINT, ACCENT, INK]

# Timeline, in seconds.
HOLD = 2.0
DISSOLVE = (2.0, 2.8)
ENTER = (2.5, 3.6)
CHARGE = (3.6, 4.05)
BURST = 4.05
EXPLODE = 0.8
CONVERGE = (4.75, 6.25)
REVEAL = (6.25, 6.7)
TOTAL = 6.7

STEP = 6
DOT = 2.3


def font(family, weight, size):
    css = urllib.request.urlopen(f"https://fonts.googleapis.com/css2?family={family}:wght@{weight}").read().decode()
    url = re.search(r"src: url\((.+?)\)", css).group(1)
    return ImageFont.truetype(BytesIO(urllib.request.urlopen(url).read()), size * S)


def clamp(x):
    return max(0.0, min(1.0, x))


def phase(t, a, b):
    return clamp((t - a) / (b - a))


def ease_out_cubic(p):
    return 1 - (1 - p) ** 3


def ease_in_out_cubic(p):
    return 4 * p**3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2


def ease_out_expo(p):
    return 1.0 if p >= 1 else 1 - 2 ** (-10 * p)


def mix(c1, c2, p):
    return tuple(round(a + (b - a) * p) for a, b in zip(c1, c2))


title_font = font("Geist", 600, 148)
subtitle_font = font("Geist", 500, 50)
label_font = font("Geist+Mono", 400, 14)

# ---------------------------------------------------------------- static layers

base = Image.new("RGB", (W * S, H * S), BG)
d = ImageDraw.Draw(base)
inset = 28
for gx in range(inset + 22, W - inset, 22):
    for gy in range(inset + 22, H - inset, 22):
        d.ellipse([(gx - 1) * S, (gy - 1) * S, (gx + 1) * S, (gy + 1) * S], fill=GRID)
d.rectangle([inset * S, inset * S, (W - inset) * S, (H - inset) * S], outline=(220, 219, 216), width=S)
for cx, cy in [(inset, inset), (W - inset, inset), (inset, H - inset), (W - inset, H - inset)]:
    d.line([(cx - 9) * S, cy * S, (cx + 9) * S, cy * S], fill=INK, width=S)
    d.line([cx * S, (cy - 9) * S, cx * S, (cy + 9) * S], fill=INK, width=S)
d.text((52 * S, 50 * S), "WHITEYE.IN", font=label_font, fill=MUTED)
d.text(((W - 52) * S, 50 * S), "ASSAM — INDIA", font=label_font, fill=MUTED, anchor="ra")
d.text(((W - 52) * S, (H - 50) * S), "GITHUB.COM/MASKJELLY", font=label_font, fill=MUTED, anchor="rs")

card = Image.new("RGBA", base.size, (0, 0, 0, 0))
cd = ImageDraw.Draw(card)
title_y, subtitle_y = 300, 420


def tracked(draw, text, fnt, cx, y, tracking, fill):
    widths = [fnt.getlength(ch) + tracking * S for ch in text]
    x = cx * S - (sum(widths) - tracking * S) / 2
    for ch, w in zip(text, widths):
        draw.text((x, y * S), ch, font=fnt, fill=fill, anchor="ls")
        x += w


tracked(cd, TITLE, title_font, W / 2, title_y, -5, INK)
tracked(cd, SUBTITLE, subtitle_font, W / 2, subtitle_y, -0.5, ACCENT)

logo = Image.open(ROOT / "public/logo.png").convert("RGBA")
HORSE_SIZE = 430
logo = logo.resize((HORSE_SIZE * S, HORSE_SIZE * S), Image.LANCZOS)
lum = np.asarray(logo.convert("L"), dtype=np.float32)
alpha = np.asarray(logo.getchannel("A"), dtype=np.float32)
horse_alpha = np.clip((lum - 90) / 120, 0, 1) * (alpha / 255)
horse = Image.new("RGBA", logo.size, INK + (0,))
horse.putalpha(Image.fromarray((horse_alpha * 255).astype(np.uint8)))
horse_center = np.array([W / 2, H / 2 + 8])

# ---------------------------------------------------------------- particles

rng = np.random.default_rng(7)


def sample(mask, offset, scale):
    pts = []
    for row, y in enumerate(np.arange(0, mask.shape[0] / scale, STEP)):
        shift = STEP / 2 if row % 2 else 0
        for x in np.arange(shift, mask.shape[1] / scale, STEP):
            if mask[int(y * scale), int(x * scale)] > 0.6:
                pts.append((x + offset[0], y + offset[1]))
    return np.array(pts)


card_alpha = np.asarray(card.getchannel("A"), dtype=np.float32) / 255
card_rgb = np.asarray(card.convert("RGB"))
targets = sample(card_alpha, (0, 0), S)
colors = np.array([card_rgb[int(y * S), int(x * S)] for x, y in targets])
colors = np.where(colors[:, 2:3] > 150, ACCENT, INK)
order = np.argsort(targets[:, 0] + rng.normal(0, 12, len(targets)))
targets, colors = targets[order], colors[order]
N = len(targets)

horse_pts = sample(horse_alpha, horse_center - HORSE_SIZE / 2, S)
horse_pts = horse_pts[np.argsort(horse_pts[:, 0] + rng.normal(0, 12, len(horse_pts)))]
if len(horse_pts) >= N:
    pick = np.linspace(0, len(horse_pts) - 1, N).astype(int)
    sources = horse_pts[pick]
    sparks = np.delete(horse_pts, pick, axis=0)
else:
    sources = horse_pts[np.sort(rng.integers(0, len(horse_pts), N))] + rng.normal(0, 1.5, (N, 2))
    sparks = horse_pts[rng.choice(len(horse_pts), 160)]


def outward(points, lo, hi, spread):
    rel = points - horse_center
    ang = np.arctan2(rel[:, 1], rel[:, 0]) + rng.uniform(-spread, spread, len(points))
    dist = np.minimum(lo + rng.exponential((hi - lo) / 2, len(points)), hi * 1.6)
    return np.stack([np.cos(ang), np.sin(ang)], axis=1) * dist[:, None]


burst_scale = 1.06
burst_origin = horse_center + (sources - horse_center) * burst_scale
blast = outward(sources, 15, 230, 0.7)
exploded = burst_origin + blast
delay = (targets[:, 0] / W) * 0.55 + rng.uniform(0, 0.08, N)
travel = CONVERGE[1] - CONVERGE[0] - 0.6
swirl = rng.uniform(-90, 90, N)
flight = np.array([FLIGHT[i] for i in rng.integers(0, len(FLIGHT), N)])

spark_origin = horse_center + (sparks - horse_center) * burst_scale
spark_blast = outward(sparks, 160, 440, 0.9)
spark_colors = [FLIGHT[i] for i in rng.integers(0, 4, len(sparks))]
spark_life = rng.uniform(0.6, 1.1, len(sparks))

drift = outward(targets, 30, 150, 3.2)

# ---------------------------------------------------------------- frames


def dots(draw, pts, cols, radii):
    for (x, y), c, r in zip(pts, cols, radii):
        if r > 0.15:
            draw.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=tuple(int(v) for v in c))


def paste_horse(img, offset_x, scale, color=None, opacity=1.0):
    size = int(HORSE_SIZE * scale * S)
    h = horse.resize((size, size), Image.BILINEAR)
    if color is not None or opacity < 1:
        a = np.asarray(h.getchannel("A"), dtype=np.float32) * opacity
        h = Image.new("RGBA", h.size, (color or INK) + (0,))
        h.putalpha(Image.fromarray(a.astype(np.uint8)))
    x = int((horse_center[0] + offset_x) * S - size / 2)
    y = int(horse_center[1] * S - size / 2)
    img.paste(h, (x, y), h)


def frame(t):
    img = base.copy()
    draw = ImageDraw.Draw(img)
    radii = np.full(N, DOT)

    if t < DISSOLVE[0] or t >= REVEAL[1]:
        img.paste(card, (0, 0), card)
    elif t < DISSOLVE[1]:
        p = phase(t, *DISSOLVE)
        fade = clamp(1 - p / 0.2)
        if fade > 0:
            faded = card.copy()
            faded.putalpha(card.getchannel("A").point(lambda a: int(a * fade)))
            img.paste(faded, (0, 0), faded)
        q = p**2
        dots(draw, targets + drift * q, colors, radii * (1 - q) * (1 - fade * 0.999))

    if ENTER[0] <= t < BURST + 0.15:
        p = phase(t, *ENTER)
        offset = -(W / 2 + 320) * (1 - ease_out_expo(p))
        scale = 0.86 + 0.14 * ease_out_cubic(p)
        c = phase(t, CHARGE[0], BURST)
        scale *= 1 + (burst_scale - 1) * c**3
        jitter = math.sin(t * 90) * 3 * c**2
        velocity = (W / 2 + 320) * 10 * math.log(2) * 2 ** (-10 * p) / (ENTER[1] - ENTER[0]) if p < 1 else 0
        for k, ghost in [(3, 0.08), (2, 0.14), (1, 0.24)]:
            if velocity > 200:
                paste_horse(img, offset - k * velocity * 0.012, scale, color=INK, opacity=ghost)
        fade = 1 - phase(t, BURST, BURST + 0.15)
        tint = mix(INK, ACCENT, c**2)
        paste_horse(img, offset + jitter, scale, color=tint, opacity=fade)

    if BURST <= t < BURST + 0.6:
        p = ease_out_cubic(phase(t, BURST, BURST + 0.6))
        r = 30 + 470 * p
        width = max(1, round(3 * (1 - p) * S))
        cx, cy = horse_center
        draw.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], outline=ACCENT, width=width)

    if BURST <= t < REVEAL[1]:
        e = ease_out_cubic(phase(t, BURST, BURST + EXPLODE))
        pts = burst_origin + blast * e
        local = np.clip((t - CONVERGE[0] - delay) / travel, 0, 1)
        k = np.array([ease_in_out_cubic(v) for v in local])
        path = exploded + (targets - exploded) * k[:, None]
        dirn = targets - exploded
        perp = np.stack([-dirn[:, 1], dirn[:, 0]], axis=1) / (np.linalg.norm(dirn, axis=1)[:, None] + 1e-6)
        path += perp * (swirl * np.sin(np.pi * k))[:, None]
        pts = np.where((local > 0)[:, None], path, pts)
        pop = 1 + 0.5 * math.sin(math.pi * phase(t, BURST, BURST + 0.3))
        settle = (k**3)[:, None]
        cols = flight + (colors - flight) * settle
        reveal = phase(t, *REVEAL)
        if reveal > 0:
            faded = card.copy()
            faded.putalpha(card.getchannel("A").point(lambda a: int(a * ease_in_out_cubic(reveal))))
            img.paste(faded, (0, 0), faded)
        dots(draw, pts, cols, radii * pop * (1 - ease_in_out_cubic(reveal)))

        sp = np.clip((t - BURST) / spark_life, 0, 1)
        spark_pts = spark_origin + spark_blast * np.array([ease_out_cubic(v) for v in sp])[:, None]
        dots(draw, spark_pts, spark_colors, 2.0 * (1 - sp))

    frames = int(round(t * FPS))
    draw.text((52 * S, (H - 50) * S), f"00:{frames // FPS:02d}:{frames % FPS * 100 // FPS:02d}", font=label_font, fill=MUTED, anchor="ls")
    return img.resize((W, H), Image.LANCZOS)


def main():
    total = int(round(TOTAL * FPS))
    with tempfile.TemporaryDirectory() as tmp:
        for f in range(total):
            frame(f / FPS).save(f"{tmp}/f{f:03d}.png")
        raw = f"{tmp}/raw.gif"
        subprocess.run(
            [
                "ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%03d.png",
                "-filter_complex",
                "[0:v]split[a][b];[a]palettegen=max_colors=48:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
                "-loop", "0", raw,
            ],
            check=True,
        )
        subprocess.run(["gifsicle", "-O3", "--lossy=30", raw, "-o", str(OUT)], check=True)
    frame(0).convert("RGB").save(STILL, optimize=True)
    base.resize((W, H), Image.LANCZOS).save(BACKDROP, optimize=True)
    card.resize((W, H), Image.LANCZOS).save(TEXT, optimize=True)
    print(f"{OUT}: {total} frames, {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
