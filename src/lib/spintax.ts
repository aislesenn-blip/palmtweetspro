interface PlaceContext {
  name: string;
  country: string;
  weather?: string;
  timezone?: string;
}

const templates = [
  (ctx: PlaceContext) => `Explore ${ctx.name}, a vibrant location in ${ctx.country}. Known for its unique atmosphere${ctx.weather ? ` and currently experiencing ${ctx.weather}` : ''}.`,
  (ctx: PlaceContext) => `Discover the hidden gems of ${ctx.name} located in ${ctx.country}. A perfect destination for travelers seeking adventure${ctx.timezone ? ` in the ${ctx.timezone} timezone` : ''}.`,
  (ctx: PlaceContext) => `Welcome to ${ctx.name}, ${ctx.country}. Whether you are here for business or leisure, experience the local culture${ctx.weather ? ` amidst ${ctx.weather} weather` : ''}.`
];

export function generateSpintaxDescription(ctx: PlaceContext): string {
  // Simple rotation based on name length to be deterministic but varied
  const index = ctx.name.length % templates.length;
  return templates[index](ctx);
}
