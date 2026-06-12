from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]

NAVY = (0, 7, 58, 255)
NAVY_SHADOW = (13, 27, 42, 145)
GOLD = (212, 170, 106, 255)


def make_foot(fill, mirror=False):
  width, height = 260, 500
  image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
  draw = ImageDraw.Draw(image)

  draw.ellipse((82, 130, 184, 392), fill=fill)
  draw.ellipse((56, 270, 202, 470), fill=fill)
  draw.ellipse((102, 82, 178, 228), fill=fill)

  toes = [
    (118, 16, 184, 82),
    (76, 42, 132, 98),
    (44, 82, 94, 132),
    (28, 128, 74, 174),
    (28, 176, 68, 216),
  ]
  for bounds in toes:
    draw.ellipse(bounds, fill=fill)

  if mirror:
    image = ImageOps.mirror(image)
  return image


def paste_rotated(base, foot, center, angle, scale=1.0):
  resized = foot.resize(
    (round(foot.width * scale), round(foot.height * scale)),
    Image.Resampling.LANCZOS,
  )
  rotated = resized.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
  x = round(center[0] - rotated.width / 2)
  y = round(center[1] - rotated.height / 2)
  base.alpha_composite(rotated, (x, y))


def footprint_mark(size, scale=1.0, shadow=True):
  image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
  shadow_scale = size / 1024 * scale
  foot_scale = size / 1024 * scale

  if shadow:
    left_shadow = make_foot(NAVY_SHADOW)
    right_shadow = make_foot(NAVY_SHADOW, mirror=True)
    paste_rotated(image, left_shadow, (size * 0.42 + size * 0.012, size * 0.48 + size * 0.018), -17, shadow_scale)
    paste_rotated(image, right_shadow, (size * 0.61 + size * 0.012, size * 0.58 + size * 0.018), 17, shadow_scale)

  left = make_foot(GOLD)
  right = make_foot(GOLD, mirror=True)
  paste_rotated(image, left, (size * 0.42, size * 0.48), -17, foot_scale)
  paste_rotated(image, right, (size * 0.61, size * 0.58), 17, foot_scale)
  return image


def icon_image(size, mark_scale=1.12):
  image = Image.new('RGBA', (size, size), NAVY)
  mark = footprint_mark(size, mark_scale, shadow=False)
  image.alpha_composite(mark)
  return image


def save_png(path, image):
  path.parent.mkdir(parents=True, exist_ok=True)
  image.save(path, 'PNG', optimize=True)


def save_webp(path, image):
  path.parent.mkdir(parents=True, exist_ok=True)
  image.save(path, 'WEBP', quality=100, lossless=True)


def main():
  save_png(ROOT / 'assets' / 'logo-transparent.png', footprint_mark(1024, 1.04, shadow=True))
  save_png(ROOT / 'assets' / 'adaptive-icon.png', footprint_mark(1024, 1.08, shadow=False))
  save_png(ROOT / 'assets' / 'icon.png', icon_image(1024))
  save_png(ROOT / 'assets' / 'favicon.png', icon_image(512))
  save_png(ROOT / 'FullLogo (2).png', icon_image(1024))
  save_png(ROOT / 'FullLogo_Transparent (4).png', footprint_mark(1024, 1.04, shadow=True))

  densities = {
    'mdpi': (48, 108, 288),
    'hdpi': (72, 162, 432),
    'xhdpi': (96, 216, 576),
    'xxhdpi': (144, 324, 864),
    'xxxhdpi': (192, 432, 1152),
  }

  for density, (legacy_size, foreground_size, splash_size) in densities.items():
    mipmap_dir = ROOT / 'android' / 'app' / 'src' / 'main' / 'res' / f'mipmap-{density}'
    drawable_dir = ROOT / 'android' / 'app' / 'src' / 'main' / 'res' / f'drawable-{density}'
    save_webp(mipmap_dir / 'ic_launcher.webp', icon_image(legacy_size))
    save_webp(mipmap_dir / 'ic_launcher_round.webp', icon_image(legacy_size))
    save_webp(mipmap_dir / 'ic_launcher_foreground.webp', footprint_mark(foreground_size, 1.0, shadow=False))
    save_png(drawable_dir / 'splashscreen_logo.png', footprint_mark(splash_size, 0.82, shadow=False))


if __name__ == '__main__':
  main()
