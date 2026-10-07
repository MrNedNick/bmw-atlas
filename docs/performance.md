# Loading the collection

The browser loads a compact catalogue index and translations as static JSON. Complete family histories are fetched only when a model is opened and cached for the current visit. The collection, model detail and atelier views have separate JavaScript chunks. Builds regenerate the JSON snapshots from the typed source data.

Compressed `.json.gz` copies keep transfers small on static hosting. The loader handles both raw gzip files and hosts that set `Content-Encoding: gzip`; browsers without `DecompressionStream` use plain JSON. Failed initial loads offer a reload, and failed family loads offer retry and return controls.

Covers have 480 and 960 px AVIF and WebP variants. Browsers select a supported format and suitable size; the original WebP remains the fallback. Detail covers load eagerly with high priority. Direct model links preload the selected cover and fetch the family history early.

## Production-build measurements

Chrome, 1440 × 900, a new browser context for each of three runs, local production preview. Network: 150 ms latency, 200,000 bytes/s download and 93,750 bytes/s upload; CPU: 4× slowdown. Route: `?view=models&model=bmw-3-series&generation=bmw-g20`.

| Metric                                              | Before                  | After                   |
| --------------------------------------------------- | ----------------------- | ----------------------- |
| JavaScript loaded by the detail route, uncompressed | 849.8 kB                | 378.4 kB                |
| LCP, three runs                                     | 3.704 / 2.592 / 2.588 s | 2.612 / 2.484 / 2.520 s |
| Median LCP                                          | 2.592 s                 | 2.520 s                 |

The detail route loads about 55% less JavaScript. The collection entry loads less because the detail chunk is deferred. These are controlled local measurements, not field performance or a guarantee for every device and connection.

Search/filter parity is checked against the complete dataset, including chassis queries, years, fuel, body, country and saved families. Local and published checks cover reload, direct links, historic cars in one grid, responsive covers, both themes and 360/1440 px widths.
