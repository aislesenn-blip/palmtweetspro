
async function runBenchmark() {
    console.log("Starting Teleport Performance Benchmark");

    // Mock Data
    const mockLocationData = {
        _embedded: {
            'location:nearest-urban-areas': [
                {
                    _links: {
                        'location:nearest-urban-area': {
                            href: 'https://api.teleport.org/api/urban_areas/slug:test-city/'
                        }
                    }
                }
            ]
        }
    };

    const mockDetailsData = {
        categories: [
             {
                 id: 'COST-OF-LIVING',
                 data: [
                     { id: 'COST-RESTAURANT-MEAL', currency_dollar_value: 15.5 },
                     { id: 'COST-CAPPUCCINO', currency_dollar_value: 4.5 },
                     { id: 'COST-IMPORT-BEER', currency_dollar_value: 6.0 }
                 ]
             },
             {
                 id: 'HOUSING',
                 data: [
                     { id: 'APARTMENT-RENT-SMALL', currency_dollar_value: 1200.0 }
                 ]
             }
        ]
    };

    // Optimized Mock Data (With Embed)
    const mockLocationDataEmbedded = {
        _embedded: {
            'location:nearest-urban-areas': [
                {
                    _links: {
                        'location:nearest-urban-area': {
                            href: 'https://api.teleport.org/api/urban_areas/slug:test-city/'
                        }
                    },
                    _embedded: {
                         'location:nearest-urban-area': {
                             _embedded: {
                                 'ua:details': mockDetailsData
                             }
                         }
                    }
                }
            ]
        }
    };

    // 1. Baseline: Sequential Fetch
    const startBaseline = performance.now();
    await (async () => {
         // Mock Fetch for Baseline
         const fetch = async (url: string) => {
             await new Promise(r => setTimeout(r, 100)); // 100ms latency
             if (url.includes('locations')) return { ok: true, json: async () => mockLocationData };
             if (url.includes('details')) return { ok: true, json: async () => mockDetailsData };
             return { ok: false };
         };

         // Original Logic
         const locRes = await fetch(`https://api.teleport.org/api/locations/0,0/`);
         // @ts-ignore
         if (locRes.ok) {
            // @ts-ignore
            const locData = await locRes.json();
            const uaUrl = locData?._embedded?.['location:nearest-urban-areas']?.[0]?.['_links']?.['location:nearest-urban-area']?.href;
            if (uaUrl) {
                const detailsRes = await fetch(`${uaUrl}details/`);
                 // @ts-ignore
                if (detailsRes.ok) {
                     // @ts-ignore
                    const details = await detailsRes.json();
                    // Process...
                }
            }
         }
    })();
    const endBaseline = performance.now();
    console.log(`Baseline (Sequential): ${(endBaseline - startBaseline).toFixed(2)}ms`);


    // 2. Optimized: Single Fetch with Embed
    const startOptimized = performance.now();
    await (async () => {
         // Mock Fetch for Optimized
         const fetch = async (url: string) => {
             await new Promise(r => setTimeout(r, 100)); // 100ms latency (only one RTT)
             if (url.includes('embed=')) return { ok: true, json: async () => mockLocationDataEmbedded };
             return { ok: false };
         };

         // Optimized Logic
         const locRes = await fetch(`https://api.teleport.org/api/locations/0,0/?embed=location:nearest-urban-areas/location:nearest-urban-area/ua:details`);
         // @ts-ignore
         if (locRes.ok) {
             // @ts-ignore
             const locData = await locRes.json();
             const nearestUrbanArea = locData?._embedded?.['location:nearest-urban-areas']?.[0];
             const uaUrl = nearestUrbanArea?.['_links']?.['location:nearest-urban-area']?.href;
             let detailsData = nearestUrbanArea?.['_embedded']?.['location:nearest-urban-area']?.['_embedded']?.['ua:details'];

             if (!detailsData && uaUrl) {
                 const detailsRes = await fetch(`${uaUrl}details/`);
                 // @ts-ignore
                 if (detailsRes.ok) {
                     // @ts-ignore
                     detailsData = await detailsRes.json();
                 }
             }

             if (detailsData) {
                 // Process...
             }
         }
    })();
    const endOptimized = performance.now();
    console.log(`Optimized (Embedded): ${(endOptimized - startOptimized).toFixed(2)}ms`);

}

runBenchmark();
