import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * All site data lives in content collections so Phase 3 (interactive 84-ghats
 * map) and Phase 5 (AI yatra planner) can reuse it. Keep lat/lng accurate.
 */

const ghats = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ghats' }),
  schema: z.object({
    name: z.string(),
    hindiName: z.string(),
    title: z.string(), // SEO <title>, 50-60 chars
    description: z.string(), // meta description, 150-160 chars
    excerpt: z.string(), // card teaser
    significance: z.string(), // one-line "why it matters"
    bestTime: z.string(),
    howToReach: z.string(),
    lat: z.number(),
    lng: z.number(),
    order: z.number(), // display order on index
    image: z.string(), // basename in public/images, without -640/-1280 suffix
    heroAlt: z.string(),
    relatedMandirs: z.array(z.string()).default([]), // slugs
    relatedFestivals: z.array(z.string()).default([]),
    relatedGhats: z.array(z.string()).default([]),
  }),
});

const mandirs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mandirs' }),
  schema: z.object({
    name: z.string(),
    hindiName: z.string(),
    title: z.string(),
    description: z.string(),
    excerpt: z.string(),
    deity: z.string(),
    timings: z.string(),
    aartiTimings: z.string().optional(),
    entryTips: z.string(),
    dressCode: z.string(),
    lat: z.number(),
    lng: z.number(),
    order: z.number(),
    image: z.string(),
    heroAlt: z.string(),
    relatedGhats: z.array(z.string()).default([]),
    relatedFestivals: z.array(z.string()).default([]),
    relatedMandirs: z.array(z.string()).default([]),
  }),
});

const khana = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/khana' }),
  schema: z.object({
    name: z.string(),
    hindiName: z.string(),
    excerpt: z.string(),
    whereToTry: z.string(),
    bestTime: z.string(), // time of day / season
    veg: z.boolean().default(true),
    order: z.number(),
  }),
});

const festivals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/festivals' }),
  schema: z.object({
    name: z.string(),
    hindiName: z.string(),
    title: z.string(),
    description: z.string(),
    excerpt: z.string(),
    month: z.string(), // human-readable, e.g. "November (Kartik Purnima)"
    nextDate: z.string(), // ISO date of next occurrence, for Event schema
    location: z.string(),
    order: z.number(),
    image: z.string(),
    heroAlt: z.string(),
    relatedGhats: z.array(z.string()).default([]),
    relatedMandirs: z.array(z.string()).default([]),
  }),
});

export const collections = { ghats, mandirs, khana, festivals };
