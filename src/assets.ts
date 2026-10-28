import { defineAssets } from '@iwsdk/core';
import { createStreetPlaza } from './scene-assets/street-plaza.scene-asset.js';
import { createStationEntrance } from './scene-assets/station-entrance.scene-asset.js';
import {
  createStairwellVisual,
  createStairwellWalkable,
} from './scene-assets/stairwell.scene-asset.js';

export default defineAssets({
  'street-plaza': createStreetPlaza(),
  'station-entrance': createStationEntrance(),
  'stairwell-walkable': createStairwellWalkable(),
  'stairwell-visual': createStairwellVisual(),
});
