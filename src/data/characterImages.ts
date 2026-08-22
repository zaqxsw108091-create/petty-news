import type { Category } from './news';
import anchorImage from '../../assets/anchor.png';
import wakeImage from '../../assets/wake.png';
import eatImage from '../../assets/eat.png';
import nothingImage from '../../assets/nothing.png';
import endureImage from '../../assets/endure.png';
import washImage from '../../assets/wash.png';
import outingImage from '../../assets/outing.png';
import customImage from '../../assets/custom.png';

export const ANCHOR_IMAGE: number = anchorImage;

export const EXPERT_IMAGE: Record<Category, number> = {
  WAKE: wakeImage,
  EAT: eatImage,
  NOTHING: nothingImage,
  ENDURE: endureImage,
  WASH: washImage,
  OUTING: outingImage,
  CUSTOM: customImage,
};
