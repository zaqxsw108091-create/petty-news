"""
하찮은 속보 — 로고 생성 스크립트

사용법:
1. 확정한 앵커 이미지를 anchor.png 로 같은 폴더에 저장
2. python3 make_logo.py
3. logo-600.png 가 생성됨 → 콘솔에 업로드

규격: 600x600, 각진 정사각형, 둥근 모서리 없음
"""

from PIL import Image

SIZE = 600
RED = (224, 27, 27)
WHITE = (255, 255, 255)

BAND_TOP = 452          # 빨간 보도블록 띠 시작 y
SEAM = 10               # 블록 이음새 두께
BIRD_BOTTOM = 470       # 새 발치 y (띠에 살짝 걸치게)


def crop_content(img, bg_tol=245):
    """흰 여백을 잘라내고 캐릭터만 남긴다"""
    g = img.convert("L")
    w, h = g.size
    px = g.load()
    left, top, right, bottom = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if px[x, y] < bg_tol:
                if x < left: left = x
                if x > right: right = x
                if y < top: top = y
                if y > bottom: bottom = y
    return img.crop((left, top, right + 1, bottom + 1))


def main():
    canvas = Image.new("RGB", (SIZE, SIZE), WHITE)

    # 1. 빨간 보도블록 띠
    for y in range(BAND_TOP, SIZE):
        for x in range(SIZE):
            canvas.putpixel((x, y), RED)

    # 2. 블록 이음새 (흰 선)
    px = canvas.load()
    for x in range(SIZE):
        for y in range(BAND_TOP, BAND_TOP + SEAM):
            px[x, y] = WHITE
    for bx in (120, 240, 360, 480):
        for x in range(bx, bx + SEAM):
            for y in range(BAND_TOP, SIZE):
                px[x, y] = WHITE

    # 3. 앵커 배치
    bird = Image.open("anchor.png").convert("RGB")
    bird = crop_content(bird)

    target_h = BIRD_BOTTOM - 90          # 새 높이
    ratio = target_h / bird.height
    target_w = int(bird.width * ratio)
    if target_w > SIZE - 80:             # 좌우 여백 확보
        target_w = SIZE - 80
        target_h = int(bird.height * (target_w / bird.width))
    bird = bird.resize((target_w, target_h), Image.LANCZOS)

    x = (SIZE - target_w) // 2
    y = BIRD_BOTTOM - target_h

    # 흰 배경을 투명 취급해서 붙이기
    mask = bird.convert("L").point(lambda v: 0 if v > 245 else 255)
    canvas.paste(bird, (x, y), mask)

    canvas.save("logo-600.png")
    print("logo-600.png 생성 완료")

    # 축소 확인용
    canvas.resize((48, 48), Image.LANCZOS).resize(
        (240, 240), Image.NEAREST
    ).save("logo-48-check.png")
    print("logo-48-check.png 생성 완료 (작게 줄였을 때 확인용)")


if __name__ == "__main__":
    main()
