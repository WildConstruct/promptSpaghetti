# Asset Starter Library Cut

_Last updated: 2026-03-07_

This note defines the recommended starter fragment library for the release branch.

It is intentionally narrower than the full `assets/library` corpus.

## Goal

Ship a coherent, low-risk starter set for the asset browser without treating all current asset-library churn as release-ready content.

The starter set should:

- match the current `.psg` fragment contract
- import cleanly through the current fragment/runtime path
- feel useful immediately in the asset browser
- avoid placeholders, bespoke extras, and long-tail niche packs

## Starter Set Recommendation

### Preferred Starter 12

- `facial-features/eye-descriptors-multi-aspect.psg`
- `facial-features/age-indicators.psg`
- `facial-features/smile-variations-simple.psg`
- `hair/hair-lengths.psg`
- `hair/hair-textures.psg`
- `hair/hair-colors-natural.psg`
- `body-silhouette/body-types.psg`
- `emotion-mood/primary-emotions.psg`
- `setting-environment/lighting-moods.psg`
- `setting-environment/weather-snapshots.psg`
- `setting-environment/architectural-styles.psg`
- `setting-environment/backdrop-adjectives.psg`

## Why This Cut

The recommended starter set gives:

- character appearance coverage
- one clear first-order emotion fragment
- strong scene/environment coverage
- tested confidence from currently exercised fragment paths

It avoids:

- obvious placeholders
- large second-wave action packs
- overly nuanced mood families
- bespoke historical extras that do not fit the reusable starter profile

## Keep / Defer / Remove

### Keep For Starter

- `facial-features/eye-descriptors-multi-aspect.psg`
- `facial-features/age-indicators.psg`
- `facial-features/smile-variations-simple.psg`
- `hair/hair-lengths.psg`
- `hair/hair-textures.psg`
- `hair/hair-colors-natural.psg`
- `body-silhouette/body-types.psg`
- `emotion-mood/primary-emotions.psg`
- `setting-environment/lighting-moods.psg`
- `setting-environment/architectural-styles.psg`
- `setting-environment/weather-snapshots.psg`
- `setting-environment/backdrop-adjectives.psg`

### Defer To Later Content Drop

- `RomanCitizen.psg`
- all `action-dynamics/*.psg`
- most `body-silhouette/*.psg` beyond `body-types.psg`
- most `emotion-mood/*.psg` beyond `primary-emotions.psg`
- most `setting-environment/*.psg` beyond the recommended environment starter subset
- `facial-features/smile-variations-contextual.psg`

### Remove / Exclude

- `weapons-armor-combat/complete-batch-placeholder.psg`

This should not be part of the starter set because it is explicitly placeholder content.

## Manifest Handling

Do not blindly ship the current full-library manifest as the starter-library release cut.

The asset-library commit should:

1. pick the starter set explicitly
2. regenerate or patch the manifest to match that cut
3. prune mirrored public fragment files to the same shipped set
4. verify the browser only presents the intended starter fragments

## Separate Surface

`packages/asset-browser/public/presets` is a separate preset surface from the fragment library.

Do not mix preset-surface decisions into the fragment starter cut.

## Release Rule

Treat the asset library as a product-content lane with its own review bar.

Do not merge broad fragment churn into the release branch without:

- starter-set selection
- placeholder removal
- manifest review
- at least basic import confidence on the chosen set
