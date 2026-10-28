/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createScenePrimitiveObject,
  DataTexture,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from '@iwsdk/core';

/** Opaque sRGB texture from RGBA pixels, filtered like an image texture. */
function pixelTexture(size: number, pixels: Uint8Array): DataTexture {
  const texture = new DataTexture(
    pixels,
    size,
    size,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * One tile of the floor lattice: a faint diamond through the middle of each
 * edge on warm clay.
 */
function createLatticeTexture(size = 512): DataTexture {
  const clay = [0xea, 0xe6, 0xdf];
  const line = [151, 155, 166];
  const half = size / 2;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance =
        Math.abs(Math.abs(x + 0.5 - half) + Math.abs(y + 0.5 - half) - half) /
        Math.SQRT2;
      const alpha = 0.26 * Math.min(1, Math.max(0, 1.25 + 0.5 - distance));
      const index = (y * size + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        pixels[index + channel] = Math.round(
          clay[channel] + (line[channel] - clay[channel]) * alpha,
        );
      }
      pixels[index + 3] = 255;
    }
  }
  return pixelTexture(size, pixels);
}

/**
 * Large plain floor with faint lattice for the player to stand on.
 */
export function createStudioFloor(size = 120): Group {
  const lattice = createLatticeTexture();
  lattice.wrapS = lattice.wrapT = RepeatWrapping;
  lattice.repeat.set(size / (0.6 * 2), size / (0.6 * 3.2));
  const floor = createScenePrimitiveObject(
    { geometry: { type: 'plane', size: [size, size] } },
    new MeshStandardMaterial({ map: lattice, roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI / 2;
  const root = new Group();
  root.add(floor);
  return root;
}
