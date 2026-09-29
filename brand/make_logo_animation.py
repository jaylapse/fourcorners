"""Render the Four Corners Games logo animation as GIFs.

Sequence: logo fades in -> blue corner flashes 4 times -> corners slide apart
left/right -> "Four Corners Games" forms in the middle.

    python brand/make_logo_animation.py

Needs Pillow and the Lato font (SIL Open Font License, free for commercial use).
"""

import math
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

W, H = 960, 540          # output size (16:9)
SS = 3                   # supersampling factor for smooth edges
FPS = 25
UNIT = 1.7               # px per logo unit (logo viewBox is 100 units -> 170px)
STROKE = 12              # stroke width in logo units, same as favicon.svg
TEXT = "Four Corners Games"
FONT_SIZE = 62
TEXT_PAD = 40            # px between the text and the bracket strokes

FONT_CANDIDATES = [
    r"C:\Windows\Fonts\LatoWeb-Semibold.ttf",
    "/usr/share/fonts/truetype/lato/Lato-Semibold.ttf",
    os.path.join(HERE, "Lato-Semibold.ttf"),
]

THEMES = {
    "light": dict(bg="#ffffff", fg="#16191d", accent="#3347c4", flash="#dfe3fb"),
    "dark": dict(bg="#0f1216", fg="#e9ebee", accent="#97a6ff", flash="#262c46"),
}

# Timeline, in seconds.
FADE_IN = (0.0, 0.8)
FLASH_START, FLASH_PERIOD, FLASH_COUNT = 1.0, 0.4, 4
EXPAND = (2.9, 3.9)
TEXT_IN = (3.15, 4.4)
HOLD_UNTIL = 7.0
FADE_OUT = 0.5           # looping version only


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def clamp01(x):
    return max(0.0, min(1.0, x))


def progress(t, span):
    return clamp01((t - span[0]) / (span[1] - span[0]))


def ease_out_cubic(x):
    return 1 - (1 - x) ** 3


def ease_in_out_cubic(x):
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def corner_points(sx, sy):
    """One corner of favicon.svg as a polyline, in logo units centred on 0,0."""
    pts = [(sx * 42, sy * 16)]
    for i in range(13):
        a = math.radians(90 * i / 12)
        pts.append((sx * (36 + 6 * math.cos(a)), sy * (36 + 6 * math.sin(a))))
    pts.append((sx * 16, sy * 42))
    return pts


CORNERS = [  # (sx, sy, is_accent)
    (-1, -1, False), (1, -1, False), (1, 1, True), (-1, 1, False),
]


def load_font():
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, FONT_SIZE * SS)
    raise SystemExit("Lato Semibold not found; download it from Google Fonts into brand/")


def layout_text(font):
    """Ink width of the text and each character's x (centre-relative, output px)."""
    left, _, right, _ = font.getbbox(TEXT)
    ink_w = (right - left) / SS
    xs = [(font.getlength(TEXT[:i]) - left) / SS - ink_w / 2 for i in range(len(TEXT))]
    return ink_w, xs


def render(theme, t, font, text_w, char_xs, fade_out=None):
    c = {k: hex_rgb(v) for k, v in theme.items()}
    img = Image.new("RGB", (W * SS, H * SS), c["bg"])
    d = ImageDraw.Draw(img)
    cx, cy = W / 2, H / 2

    # Overall opacity: fade in, optional fade out before the loop restarts.
    p_in = ease_out_cubic(progress(t, FADE_IN))
    alpha = p_in
    if fade_out is not None:
        alpha *= 1 - clamp01((t - fade_out[0]) / (fade_out[1] - fade_out[0]))
    scale = 0.9 + 0.1 * p_in

    # Blue corner flashes: a smooth blink toward the "flash" colour and back.
    flash = 0.0
    ft = t - FLASH_START
    if 0 <= ft < FLASH_PERIOD * FLASH_COUNT:
        flash = math.sin(math.pi * (ft % FLASH_PERIOD) / FLASH_PERIOD) ** 2

    # Corners slide left/right far enough to frame the text.
    target_dx = text_w / 2 + TEXT_PAD - 42 * UNIT + STROKE * UNIT / 2
    dx = target_dx * ease_in_out_cubic(progress(t, EXPAND))

    u = UNIT * scale
    width = STROKE * u
    for sx, sy, accent in CORNERS:
        col = c["accent"] if accent else c["fg"]
        if accent:
            col = mix(col, c["flash"], flash)
        col = mix(c["bg"], col, alpha)
        pts = [((cx + sx * dx + x * u) * SS, (cy + y * u) * SS) for x, y in corner_points(sx, sy)]
        # Draw the stroke as a union of capsules: seamless round joins and caps.
        r = width * SS / 2
        for p, q in zip(pts, pts[1:]):
            d.line([p, q], fill=col, width=round(width * SS))
        for px, py in pts:
            d.ellipse((px - r, py - r, px + r, py + r), fill=col)

    # Text forms from the middle outward as the corners open.
    p_text = progress(t, TEXT_IN)
    if p_text > 0:
        n = len(TEXT)
        mid = (n - 1) / 2
        ascent, descent = font.getmetrics()
        base_y = cy - (ascent + descent) / SS / 2 + 2
        for i, ch in enumerate(TEXT):
            if ch == " ":
                continue
            delay = abs(i - mid) / mid * 0.45          # centre letters first
            lp = ease_out_cubic(clamp01((p_text - delay) / 0.55))
            if lp <= 0:
                continue
            x = char_xs[i]
            y = base_y + 10 * (1 - lp)                 # each letter rises into place
            col = mix(c["bg"], c["fg"], lp * alpha)
            d.text(((cx + x) * SS, y * SS), ch, font=font, fill=col)

    return img.resize((W, H), Image.LANCZOS)


def build(theme_name, loop):
    theme = THEMES[theme_name]
    font = load_font()
    text_w, char_xs = layout_text(font)
    end = HOLD_UNTIL + (FADE_OUT if loop else 0)
    fade_out = (HOLD_UNTIL, end) if loop else None
    n = round(end * FPS) + 1
    frames = []
    for i in range(n):
        rgb = render(theme, i / FPS, font, text_w, char_xs, fade_out)
        frames.append(rgb.quantize(colors=96, method=Image.Quantize.MEDIANCUT,
                                   dither=Image.Dither.NONE))
    durations = [1000 // FPS] * n
    if loop:
        durations[-1] = 400          # short beat of empty screen before restarting
    else:
        durations[-1] = 60000        # effectively stops on the full lockup

    suffix = "" if loop else "-once"
    out = os.path.join(HERE, f"fourcorners-logo-{theme_name}{suffix}.gif")
    save_kw = dict(save_all=True, append_images=frames[1:], duration=durations,
                   optimize=True, disposal=1)
    if loop:
        save_kw["loop"] = 0
    frames[0].save(out, **save_kw)
    # Also a still of the final lockup, handy for thumbnails and headers.
    if loop:
        render(theme, HOLD_UNTIL, font, text_w, char_xs).save(
            os.path.join(HERE, f"fourcorners-lockup-{theme_name}.png"))
    print(f"{out}  {len(frames)} frames  {os.path.getsize(out) / 1024:.0f} KB")


def build_logo_png(theme_name, size=1024):
    """The square logo on its own: one transparent PNG and one on the theme background."""
    c = {k: hex_rgb(v) for k, v in THEMES[theme_name].items()}
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = s / 100
    r = STROKE * u / 2
    for sx, sy, accent in CORNERS:
        col = c["accent"] if accent else c["fg"]
        pts = [((50 + x) * u, (50 + y) * u) for x, y in corner_points(sx, sy)]
        for p, q in zip(pts, pts[1:]):
            d.line([p, q], fill=col, width=round(STROKE * u))
        for px, py in pts:
            d.ellipse((px - r, py - r, px + r, py + r), fill=col)
    img = img.resize((size, size), Image.LANCZOS)
    img.save(os.path.join(HERE, f"fourcorners-logo-{theme_name}-transparent.png"))
    bg = Image.new("RGBA", (size, size), c["bg"] + (255,))
    bg.alpha_composite(img)
    bg.convert("RGB").save(os.path.join(HERE, f"fourcorners-logo-{theme_name}.png"))


if __name__ == "__main__":
    for name in THEMES:
        build_logo_png(name)
        build(name, loop=True)
        build(name, loop=False)
