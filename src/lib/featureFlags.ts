import { PUBLIC_SHOW_SECTION_DESCRIPTIONS } from "astro:env/client";

export const featureFlags = {
	showSectionDescriptions: PUBLIC_SHOW_SECTION_DESCRIPTIONS,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isFeatureEnabled = (flag: FeatureFlag): boolean =>
	featureFlags[flag];
