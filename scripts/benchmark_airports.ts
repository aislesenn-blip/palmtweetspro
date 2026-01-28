
// Remove import, verify if performance exists, else use Date
const now = (typeof performance !== 'undefined' && performance.now)
    ? () => performance.now()
    : () => Date.now();

// Copy of calculateDistance from src/lib/distance.ts
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Benchmark
function runBenchmark() {
    console.log("Starting Benchmark...");

    // 1. Setup Mock Data
    const centerLat = 40.7128; // NYC
    const centerLng = -74.0060;
    const NUM_NODES = 1000;
    const ITERATIONS = 1000;

    const nodes = [];
    for (let i = 0; i < NUM_NODES; i++) {
        nodes.push({
            lat: centerLat + (Math.random() - 0.5), // +/- 0.5 deg
            lon: centerLng + (Math.random() - 0.5),
            tags: {
                name: `Airport ${i}`,
                iata: `A${i}`
            }
        });
    }

    // 2. Measure Processing Time
    const start = now();

    for (let i = 0; i < ITERATIONS; i++) {
        const processed = nodes.map((node: any) => ({
             name: node.tags.name,
             iata: node.tags.iata,
             distance: calculateDistance(centerLat, centerLng, node.lat, node.lon)
           })).sort((a: any, b: any) => a.distance - b.distance).slice(0, 3);
    }

    const end = now();
    const totalTime = end - start;
    const avgTime = totalTime / ITERATIONS;

    console.log(`Processed ${NUM_NODES} nodes over ${ITERATIONS} iterations.`);
    console.log(`Total Time: ${totalTime.toFixed(2)} ms`);
    console.log(`Average Time per Operation: ${avgTime.toFixed(4)} ms`);
}

runBenchmark();
