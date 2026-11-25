<?php

return [
    // Repo-level content/ folder (stage-1 files): source for the one-off import (docs/spec.md §10)
    // and for rules.json / policy.yaml, which stay in the repo as configuration.
    'path' => env('CONTENT_PATH') ?: base_path('../content'),

    // Bearer token for the build-time export API (docs/spec.md §8.1). Set in .env and in GitHub Actions secrets.
    'export_token' => env('EXPORT_API_TOKEN') ?: null,
];
