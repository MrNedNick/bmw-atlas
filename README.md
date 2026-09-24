# BMW Atlas

An independent BMW encyclopedia covering generations, model-year updates, powertrains, production, and source-backed editorial imagery.

**[Open BMW Atlas](https://mrnednick.github.io/bmw-atlas/)**

![BMW X5 G65 in BMW Atlas](public/images/editorial-bmw-x5-g65.webp)

## Coverage

- 260 **BMW-only** names from NHTSA vPIC. This is a regulatory index that includes motorcycle names; it is not a complete technical history of every BMW.
- 35 detailed families and 93 generations or overview branches, covering core series, BMW X, M, i, Isetta and Motorrad. The [coverage report](docs/catalog-status.md) lists the exact scope.
- One local editorial image per detailed generation. Each reference-backed M and i image identifies its official source and the visual details checked against it.
- The English interface is the default; Russian remains available as a second language while catalog content is translated record by record.

The catalog is expanding across historic and current BMW cars, M, i, X, Z, rare versions, race cars, concepts, and Motorrad. Missing information does not imply that a model, update, or powertrain did not exist. See the [data contract](docs/data-sources.md), [coverage plan](docs/coverage.md), and [catalog roadmap](docs/catalog-roadmap.md).

## Development

Requires Node.js 22.18 or later:

```sh
npm ci
npm run dev
```

Run checks with `npm run check`, `npm test`, `npm run data:validate`, and `npm run build`. `npm run preview` serves the production build. `npm run data:import` refreshes the BMW-only index and preserves the last valid snapshot if an import fails.

Catalog data ships with the application; browsing does not require external APIs. Theme, language, and garage preferences persist in the browser. Legacy links to unavailable models return to the catalog, and only existing BMW entries appear in saved items.

Switching generations keeps a single model entry in browser history. Back returns to the previous catalog position, and model cards support opening in a new tab. The photo gallery includes an enlarged viewer with previous/next controls, arrow-key navigation and Escape to close. Image credits remain available in expandable captions.

The internal project name is `motor-atlas`; the public route is `/bmw-atlas/`. BMW Atlas is not an official BMW website.

## GitHub Pages

The workflow checks formatting, types, tests, and catalog data before publishing `main`. In Settings → Pages, select GitHub Actions. Builds with `GITHUB_PAGES=true` use `/bmw-atlas/`; model links keep state in the query string and work without server rewrites. See [deployment](docs/deployment.md).

For exact per-generation coverage, see [catalog status](docs/catalog-status.md). Run `npm run data:report` after changing catalog data.
