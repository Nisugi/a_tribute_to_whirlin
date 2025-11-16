import type { EnhanciveSlot, SubscriptionTier } from '../types';

export interface SlotLimit {
  prime: number;
  premium: number;
  platinum: number;
}

export interface EnhanciveSlotDefinition {
  id: EnhanciveSlot;
  label: string;
  functionalLimit: SlotLimit;
}

const DEFAULT_LIMIT: SlotLimit = {
  prime: 1,
  premium: 1,
  platinum: 1,
};

export const ENHANCIVE_SLOT_DEFINITIONS: Record<EnhanciveSlot, EnhanciveSlotDefinition> = {
  pin: {
    id: 'pin',
    label: 'Pin-worn',
    functionalLimit: { prime: 8, premium: 8, platinum: 8 },
  },
  wrist: {
    id: 'wrist',
    label: 'Wrist',
    functionalLimit: { prime: 2, premium: 3, platinum: 4 },
  },
  head: { id: 'head', label: 'Head', functionalLimit: DEFAULT_LIMIT },
  hair: { id: 'hair', label: 'Hair', functionalLimit: DEFAULT_LIMIT },
  ear_single: {
    id: 'ear_single',
    label: 'Single Ear',
    functionalLimit: { prime: 2, premium: 3, platinum: 4 },
  },
  ear_multiple: {
    id: 'ear_multiple',
    label: 'Both Ears',
    functionalLimit: { prime: 2, premium: 3, platinum: 4 },
  },
  neck: { id: 'neck', label: 'Neck', functionalLimit: { prime: 3, premium: 4, platinum: 5 } },
  shoulder: { id: 'shoulder', label: 'Shoulder (Sheath)', functionalLimit: { prime: 2, premium: 3, platinum: 4 } },
  shoulders: { id: 'shoulders', label: 'Draped Shoulders', functionalLimit: DEFAULT_LIMIT },
  back: { id: 'back', label: 'Back', functionalLimit: DEFAULT_LIMIT },
  chest: { id: 'chest', label: 'Over Chest', functionalLimit: DEFAULT_LIMIT },
  front: { id: 'front', label: 'Front-worn', functionalLimit: DEFAULT_LIMIT },
  arms: { id: 'arms', label: 'Arms', functionalLimit: { prime: 2, premium: 3, platinum: 4 } },
  hands: { id: 'hands', label: 'Hands', functionalLimit: DEFAULT_LIMIT },
  finger: { id: 'finger', label: 'Finger', functionalLimit: { prime: 10, premium: 12, platinum: 14 } },
  waist: { id: 'waist', label: 'Waist', functionalLimit: DEFAULT_LIMIT },
  belt: {
    id: 'belt',
    label: 'Attached to Belt',
    functionalLimit: { prime: 4, premium: 6, platinum: 8 },
  },
  legs: { id: 'legs', label: 'Legs', functionalLimit: { prime: 2, premium: 3, platinum: 4 } },
  ankle: { id: 'ankle', label: 'Ankle', functionalLimit: { prime: 1, premium: 2, platinum: 3 } },
  feet: { id: 'feet', label: 'Feet', functionalLimit: DEFAULT_LIMIT },
  battle_standard: {
    id: 'battle_standard',
    label: 'Battle Standard',
    functionalLimit: DEFAULT_LIMIT,
  },
  other: { id: 'other', label: 'Miscellaneous', functionalLimit: DEFAULT_LIMIT },
};

export function getSlotLimit(slot: EnhanciveSlot, tier: SubscriptionTier): number {
  const definition = ENHANCIVE_SLOT_DEFINITIONS[slot] ?? {
    id: slot,
    label: slot,
    functionalLimit: DEFAULT_LIMIT,
  };
  return definition.functionalLimit[tier];
}
