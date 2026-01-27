interface PlaceContext {
  name: string;
  country: string;
  weather?: string;
  timezone?: string;
}

const adjectives = ["vibrant", "bustling", "historic", "scenic", "charming", "dynamic", "modern", "culturally rich", "fascinating", "lively"];
const actions = ["Explore", "Discover", "Visit", "Experience", "Uncover", "Journey to", "Wander through", "Get to know", "See", "Tour"];
const intros = ["Welcome to", "This is", "You have arrived at", "Here is", "Presenting", "Your guide to", "Everything about", "Data for", "Insights on", "Overview of"];

const templates: ((ctx: PlaceContext) => string)[] = [];

// Generate 50+ variations procedurally
for (let i = 0; i < 50; i++) {
    const adj = adjectives[i % adjectives.length];
    const act = actions[i % actions.length];
    const intro = intros[i % intros.length];

    templates.push((ctx) => `${intro} ${ctx.name}, a ${adj} destination in ${ctx.country}. ${act} the local sights${ctx.timezone ? ` in the ${ctx.timezone} time zone` : ''}.`);
    templates.push((ctx) => `${act} ${ctx.name}, situated in the heart of ${ctx.country}. This ${adj} place offers unique experiences${ctx.weather ? ` and is currently seeing ${ctx.weather} weather` : ''}.`);
    templates.push((ctx) => `${ctx.name} is a ${adj} location in ${ctx.country}. ${intro} comprehensive data including weather, time, and logistics.`);
}

export function generateSpintaxDescription(ctx: PlaceContext): string {
  // Deterministic rotation based on name length
  const index = ctx.name.length * 7 % templates.length;
  return templates[index](ctx);
}
