#!/usr/bin/env python3
"""Generate PWA PNG icons (no external deps) for the AI 艺术创作手册 app.

Draws a brand-gradient rounded square with a stylized white artist palette
and a few colored paint dots. Pure-Python PNG encoder using zlib.
"""
import os
import struct
import zlib
import math

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")

# Brand colors (match index.html :root)
BRAND = (0x7c, 0x5c, 0xff)   # purple
BRAND3 = (0xf4, 0x72, 0xb6)  # pink
DOTS = [
    (0x22, 0xd3, 0xee),  # cyan
    (0xfb, 0xbf, 0x24),  # amber
    (0x34, 0xd3, 0x99),  # green
    (0xf8, 0x71, 0x71),  # red
    (0x7c, 0x5c, 0xff),  # purple
]


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def gradient(x, y, size):
    # diagonal gradient top-left -> bottom-right
    t = (x + y) / (2 * (size - 1))
    return lerp(BRAND, BRAND3, t)


def inside_circle(px, py, cx, cy, r):
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r


def render(size):
    rows = []
    cx, cy = size / 2, size / 2
    pal_r = size * 0.33          # palette radius
    thumb_r = size * 0.10        # thumb hole radius
    thumb_cx = cx + pal_r * 0.55
    thumb_cy = cy + pal_r * 0.45
    dot_r = size * 0.052
    # arrange dots in an arc inside the palette
    dot_centers = []
    for i, _ in enumerate(DOTS):
        ang = math.radians(200 + i * 32)
        dx = cx + pal_r * 0.52 * math.cos(ang)
        dy = cy + pal_r * 0.52 * math.sin(ang)
        dot_centers.append((dx, dy))

    radius = size * 0.22  # rounded-square corner radius for the icon background

    for y in range(size):
        row = bytearray()
        for x in range(size):
            # rounded-square mask for background (transparent corners)
            in_bg = True
            for (mx, my) in ((radius, radius), (size - radius, radius),
                             (radius, size - radius), (size - radius, size - radius)):
                # corner regions
                if ((x < radius and y < radius) or
                        (x > size - radius and y < radius) or
                        (x < radius and y > size - radius) or
                        (x > size - radius and y > size - radius)):
                    pass
            # simpler: distance-based rounded rect
            qx = max(radius - x, x - (size - radius), 0)
            qy = max(radius - y, y - (size - radius), 0)
            if qx * qx + qy * qy > radius * radius:
                in_bg = False

            if not in_bg:
                row += bytes((0, 0, 0, 0))
                continue

            r, g, b = gradient(x, y, size)
            a = 255

            # palette: white circle with a thumb hole
            if inside_circle(x, y, cx, cy, pal_r) and not inside_circle(x, y, thumb_cx, thumb_cy, thumb_r):
                r, g, b = 0xff, 0xff, 0xff
                # paint dots on top
                for (dx, dy), col in zip(dot_centers, DOTS):
                    if inside_circle(x, y, dx, dy, dot_r):
                        r, g, b = col
                        break
            row += bytes((r, g, b, a))
        rows.append(bytes(row))
    return rows


def write_png(path, size):
    rows = render(size)
    raw = bytearray()
    for row in rows:
        raw.append(0)  # filter type 0
        raw += row
    compressed = zlib.compress(bytes(raw), 9)

    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        crc = zlib.crc32(typ + data) & 0xffffffff
        return c + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + \
        chunk(b"IDAT", compressed) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print("wrote", path, size, "x", size, len(png), "bytes")


def main():
    os.makedirs(OUT, exist_ok=True)
    for s in (192, 512, 180):
        write_png(os.path.join(OUT, f"icon-{s}.png"), s)


if __name__ == "__main__":
    main()
