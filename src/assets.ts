import { defineAssets, AssetType } from '@iwsdk/core';
import {
  createStairwellVisual,
  createStairwellWalkable,
} from './scene-assets/stairwell.scene-asset.js';

export default defineAssets({
  'subway-entrance': {
    url: 'models/subway_entrance.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  'city-buildings': {
    url: 'models/city_buildings.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  'stairwell-walkable': createStairwellWalkable(),
  'stairwell-visual': createStairwellVisual(),
});
