export const ENCOURAGEMENT_PRESETS = [
  {
    id: 'praying-with-you',
    label: 'Praying with you',
    message: 'Praying with you.',
  },
  {
    id: 'not-alone',
    label: 'You are not alone',
    message: 'You are not alone.',
  },
  {
    id: 'standing-with-you',
    label: 'Standing with you in prayer',
    message: 'Standing with you in prayer.',
  },
];

export function getEncouragementPreset(presetId) {
  return ENCOURAGEMENT_PRESETS.find((preset) => preset.id === presetId) || null;
}

export function isValidEncouragementPreset(presetId) {
  return Boolean(getEncouragementPreset(presetId));
}
