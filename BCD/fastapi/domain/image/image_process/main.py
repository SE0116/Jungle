"""
Main script.
Create panoramas from a set of images.
watchdog_for_image.p와 같은 디렉토리에 있어야 함
"""

import argparse
import logging
import time
from pathlib import Path

import cv2
import numpy as np

from src.images import Image
from src.matching import (
    MultiImageMatches,
    PairMatch,
    build_homographies,
    find_connected_components,
)
from src.rendering import multi_band_blending, set_gain_compensations, simple_blending

parser = argparse.ArgumentParser(
    description="Create panoramas from a set of images. \
                 All the images must be in the same directory. \
                 Multiple panoramas can be created at once"
)

parser.add_argument(dest="data_dir", type=Path, help="directory containing the images")
parser.add_argument(
    "-mbb",
    "--multi-band-blending",
    action="store_true",
    help="use multi-band blending instead of simple blending",
)
parser.add_argument(
    "--size", type=int, help="maximum dimension to resize the images to"
)
parser.add_argument(
    "--num-bands", type=int, default=5, help="number of bands for multi-band blending"
)
parser.add_argument(
    "--mbb-sigma", type=float, default=1, help="sigma for multi-band blending"
)

parser.add_argument(
    "--gain-sigma-n", type=float, default=10, help="sigma_n for gain compensation"
)
parser.add_argument(
    "--gain-sigma-g", type=float, default=0.1, help="sigma_g for gain compensation"
)

parser.add_argument(
    "-v", "--verbose", action="store_true", help="increase output verbosity"
)

args = vars(parser.parse_args())

if args["verbose"]:
    logging.basicConfig(level=logging.INFO)

logging.info("이미지 스티칭 시작")
# logging.info("Gathering images...")
# logging.info("이미지 모으는 중...")

valid_images_extensions = {".jpg", ".png", ".bmp", ".jpeg"}
data_dir = Path(args["data_dir"])
#! image_paths 예외 처리 필요
# print(data_dir.is_file())
image_paths = [
    str(filepath) # filepath를 str로 변환
    for filepath in data_dir.iterdir() # for -> data_dir의 하위 디렉토리에 있는 파일들의 경로를 str로 변환
    if filepath.suffix.lower() in valid_images_extensions # if -> 파일의 확장자가 valid_images_extensions에 포함되어 있으면
]

images = [Image(path, args.get("size")) for path in image_paths]

logging.info("Found %d images", len(images))
# logging.info("Computing features with SIFT...")
# logging.info("SIFT로 특징점 계산 중...")

for image in images:
    image.compute_features()

# logging.info("Matching images with features...")
# logging.info("특징점으로 이미지 매칭 중...")

matcher = MultiImageMatches(images)
pair_matches: list[PairMatch] = matcher.get_pair_matches()
pair_matches.sort(key=lambda pair_match: len(pair_match.matches), reverse=True)

# logging.info("Finding connected components...")
# logging.info("연결된 요소 찾는 중...")

connected_components = find_connected_components(pair_matches)

# logging.info("Found %d connected components", len(connected_components))
# logging.info("호모그래피 빌드 중...")

build_homographies(connected_components, pair_matches)

time.sleep(0.1)

# logging.info("Computing gain compensations...")

for connected_component in connected_components:
    component_matches = [
        pair_match
        for pair_match in pair_matches
        if pair_match.image_a in connected_component
    ]

    set_gain_compensations(
        connected_component,
        component_matches,
        sigma_n=args["gain_sigma_n"],
        sigma_g=args["gain_sigma_g"],
    )

time.sleep(0.1)

for image in images:
    image.image = (image.image * image.gain[np.newaxis, np.newaxis, :]).astype(np.uint8)

results = []

if args["multi_band_blending"]:
    # logging.info("Applying multi-band blending...")
    logging.info("Multi-band blending 적용 중...")
    results = [
        multi_band_blending(
            connected_component,
            num_bands=args["num_bands"],
            sigma=args["mbb_sigma"],
        )
        for connected_component in connected_components
    ]


else:
    # logging.info("Applying simple blending...")
    logging.info("Simple blending 적용 중...")
    results = [
        simple_blending(connected_component)
        for connected_component in connected_components
    ]

logging.info("스티칭 결과 저장: %s", args["data_dir"] / "results")

(args["data_dir"] / "results").mkdir(exist_ok=True, parents=True)
for i, result in enumerate(results):
    cv2.imwrite(str(args["data_dir"] / "results" / f"pano_{i}.jpg"), result)
