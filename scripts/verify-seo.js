const axios = require('axios');
const cheerio = require('cheerio');
const { spawn } = require('child_process');

async function verifySEO() {
    console.log("Starting server for SEO verification...");

    // Start the server in background
    const server = spawn('npm', ['start'], { stdio: 'pipe' });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        const url = 'http://localhost:3000/en/paris';
        console.log(`Fetching ${url}...`);

        const res = await axios.get(url);
        const html = res.data;
        const headers = res.headers;

        // 1. Verify Headers
        console.log("Verifying Security Headers...");
        if (headers['x-content-type-options'] === 'nosniff' &&
            headers['x-frame-options'] === 'DENY' &&
            headers['strict-transport-security'] &&
            headers['last-modified']) {
            console.log("✅ Security & Freshness headers present.");
        } else {
            console.error("❌ Missing security headers.", headers);
        }

        // 2. Verify JSON-LD
        console.log("Verifying JSON-LD Schemas...");
        const $ = cheerio.load(html);
        const script = $('script[type="application/ld+json"]').html();

        if (!script) {
            console.error("❌ No JSON-LD script found.");
            process.exit(1);
        }

        const json = JSON.parse(script);
        const graph = json['@graph'];

        const hasPlace = graph.find(item => item['@type'] === 'Place' && item.containsPlace['@type'] === 'WeatherForecast');
        const hasFinance = graph.find(item => item['@type'] === 'ExchangeRateSpecification');
        const hasFAQ = graph.find(item => item['@type'] === 'FAQPage');
        const hasDataset = graph.find(item => item['@type'] === 'Dataset' && item.license && item.spatialCoverage);
        const hasBreadcrumb = graph.find(item => item['@type'] === 'BreadcrumbList');

        if (hasPlace) console.log("✅ Place & WeatherForecast Schema found.");
        else console.error("❌ Missing Place/Weather Schema.");

        if (hasFinance) console.log("✅ ExchangeRateSpecification Schema found.");
        else console.error("❌ Missing Finance Schema.");

        if (hasFAQ) console.log("✅ FAQPage Schema found.");
        else console.error("❌ Missing FAQ Schema.");

        if (hasDataset) console.log("✅ Dataset Schema found.");
        else console.error("❌ Missing Dataset Schema.");

        if (hasBreadcrumb) console.log("✅ BreadcrumbList Schema found.");
        else console.error("❌ Missing Breadcrumb Schema.");

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        server.kill();
    }
}

verifySEO();
