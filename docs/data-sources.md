# Catalogue data

Source records are in `src/data/sources.ts`. The broad name index is a dated NHTSA vPIC snapshot, imported with `npm run data:import`. It is distinct from researched generation histories. The index accepts only BMW. Its model names include motorcycles and derivatives beyond passenger cars. It is not a worldwide specification or production database.

Facts preserve the publisher's scope and date. Production and sales are separate. Overlapping generation dates are allowed. A missing facelift record means unknown coverage, not zero facelifts. Powertrain lists are explicitly partial snapshots. Marketing names do not establish an engine code. UK press-kit horsepower is retained as `hp`, without assuming a conversion to metric PS.

BMW's 2025 seven-generation production retrospective is supplemented with the 2026 Neue Klasse i3 launch. The new electric branch is distinct from the earlier I01 and Chinese i3. No unannounced combustion successor is inferred.

Euro NCAP component results are tied to the test year and tested specification; they are not an overall reliability rating. Ratings from different protocol years are not directly ranked. Photographs carry their own source and licence, independent of the factual catalogue.

Refreshes are explicit imports. Failed imports preserve the previous complete snapshot. No third-party API is required when a visitor opens the application.

Photographs are displayed in the catalogue and selected-generation header, with exact subject labels. No photograph is reused as another generation. Compact cards credit the depicted model; the full caption with author and licence is on the opened page. Isetta is currently a family overview, not a complete Standard/Export chronology.
