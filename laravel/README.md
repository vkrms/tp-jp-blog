# laravel/ — admin + orchestrator

Admin panel (Filament, `/admin`), content API for the Astro build, and (later) the writer/updater orchestrator.
Spec: `../docs/spec.md`. The public site is in `../astro/`.

## Local setup

```sh
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate
php artisan content:import          # loads ../content/* (use --fresh to re-import)
php artisan make:filament-user      # admin login
php artisan serve                   # http://127.0.0.1:8000/admin
php artisan test
```

Local dev uses SQLite; production uses MySQL on Hostinger (PHP 8.3+).

## Export API (docs/spec.md §8.1)

`GET /api/export/{articles,categories,glossary,meta}` with `Authorization: Bearer $EXPORT_API_TOKEN`.
Published content only, same shapes as the stage-1 `content/*.json` files.

Build the site from it (repo root):

```sh
CONTENT_API_URL=http://127.0.0.1:8000/api/export CONTENT_API_TOKEN=<token> npm run build
```

Without `CONTENT_API_URL` Astro reads `content/` directly.
