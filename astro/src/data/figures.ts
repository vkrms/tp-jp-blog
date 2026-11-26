// In-article figure templates (docs/figures.md). Ids and required data fields live in
// tools/figures/templates.json so the validator (tools/lib/figures.mjs) checks exactly
// what the site renders here.
import manifest from '../../../tools/figures/templates.json';
import type { Figure } from './content';

interface Template {
  kind: string;
  ref?: string;
  caption?: 'required';
  data?: Record<string, unknown>;
}

const templates = manifest.templates as unknown as Record<string, Template>;

/**
 * Template for a figure block. Throws on an unknown id or a mismatched kind so a typo
 * fails the build instead of rendering an empty figure.
 */
export const requireTemplate = (figure: Figure): Template => {
  const template = templates[figure.template];
  if (!template) {
    throw new Error(
      `figure: unknown template "${figure.template}" — add it to tools/figures/templates.json, then to astro/src/components/figures/`,
    );
  }
  if (template.kind !== figure.kind) {
    throw new Error(`figure: template "${figure.template}" is ${template.kind}, block says ${figure.kind}`);
  }
  return template;
};
