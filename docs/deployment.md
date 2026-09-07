# GitHub Pages

Target repository: `MrNedNick/bmw-atlas`, public. Default branch: `main`.

The workflow builds with Node 22, runs type checking, tests and the data validator, then uploads `dist` and deploys it using the Pages environment. Pull requests verify the build without deploying. No application secrets or server are required.

Enable GitHub Actions as the Pages source before the first deployment. The resulting URL is `https://mrnednick.github.io/bmw-atlas/`. A URL is considered live only after the deployment succeeds and is checked in a browser.

Local production check:

```sh
npm run build:pages
npm run preview:pages
```

Open `/bmw-atlas/`. Verify photographs, `data/catalog.json`, a filtered query, a direct `?model=bmw-3-series&generation=bmw-g20` link, reload, saved models and theme. All assets must resolve below the base path. There are no pathname routes requiring a 404 fallback.

To roll back a bad dataset, revert the data commit and let the same checks rebuild it. Do not bypass validation or publish an incomplete import.
