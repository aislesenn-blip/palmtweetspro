
// Mocking the environment
const logs: string[] = [];

// Mock Axios
const axios = {
    get: async (url: string) => {
        logs.push(`FETCH: ${url}`);
        // Simulate delay
        await new Promise(r => setTimeout(r, 100));
        return {
            data: [
                { currencies: { EUR: { name: "Euro" } }, idd: { root: "+33", suffixes: [""] } }
            ]
        };
    }
};

// Mock Dashboard Component
async function Dashboard() {
    console.log("--- Dashboard Mount ---");
    let loading = true;

    // 1. Dashboard starts fetching
    const dashboardFetch = axios.get(`https://restcountries.com/v3.1/name/France?fields=currencies,idd,region...`);

    // 2. Dashboard renders QuickFactsCard immediately with null props and loading=true
    await QuickFactsCard({
        name: "Paris",
        country: "France",
        initialCurrency: null,
        initialIdd: null,
        loading: true
    });

    // 3. Dashboard fetch finishes
    await dashboardFetch;
    loading = false;
    console.log("--- Dashboard Fetch Complete ---");

    // 4. Dashboard re-renders QuickFactsCard with data and loading=false
    await QuickFactsCard({
        name: "Paris",
        country: "France",
        initialCurrency: { EUR: { name: "Euro" } },
        initialIdd: { root: "+33", suffixes: [""] },
        loading: false
    });
}

// Mock QuickFactsCard Component
// Logic mirrors the new implementation
async function QuickFactsCard(props: any) {
    const { country, initialCurrency, initialIdd, loading } = props;

    // Effect logic for Country
    if (initialCurrency && initialIdd) {
         console.log("QuickFactsCard: Props present, using them.");
    } else if (!loading) {
         console.log("QuickFactsCard: Missing props AND not loading from parent, initiating fetch...");
         axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies,idd`);
    } else {
         console.log("QuickFactsCard: Missing props but parent is loading. Waiting...");
    }
}

// Run simulation
Dashboard().then(() => {
    console.log("\n--- Network Logs ---");
    console.log(logs.join('\n'));

    const count = logs.filter(l => l.includes("restcountries.com")).length;
    console.log(`\nTotal calls to restcountries: ${count}`);
    if (count > 1) {
        console.log("RESULT: Redundant fetching DETECTED (Fix Failed).");
    } else {
        console.log("RESULT: No redundant fetching (Fix Verified).");
    }
});
