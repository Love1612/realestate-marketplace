export const LISTING_PLANS = {
  basic: {name:'Basic', cents:500, label:'$5 / 30 days', multiplier:1},
} as const;

/** Single-building packs. Price is for advertised vacancies only, not every unit in the building. */
export const BUILDING_BULK_PACKS = [
  {tier:'b4', units:4, price:16, perUnit:4, label:'Small building', blurb:'Up to 4 vacant units at one address. Photos + basics for 30 days.'},
  {tier:'b8', units:8, price:28, perUnit:3.5, label:'Walk-up / small community', blurb:'Up to 8 advertised vacancies. Better than $5 each.'},
  {tier:'b16', units:16, price:48, perUnit:3, label:'Mid-size building', blurb:'Up to 16 open units. One checkout for the whole building.'},
  {tier:'b32', units:32, price:80, perUnit:2.5, label:'Large building', blurb:'Up to 32 advertised vacancies at one community.'},
  {tier:'b64', units:64, price:null, perUnit:null, label:'Full community 64+', blurb:'Custom quote for big properties and multi-building sites.'},
] as const;

export const PORTFOLIO_TIERS = [
 {tier:'10', listings:10, price:35}, {tier:'25', listings:25, price:70}, {tier:'50', listings:50, price:140},
 {tier:'100', listings:100, price:225}, {tier:'250', listings:250, price:450}, {tier:'500+', listings:500, price:null}
] as const;

export type ListingPlan = keyof typeof LISTING_PLANS;
export function activeListingPlan(plan:string){ return LISTING_PLANS[plan as ListingPlan] || LISTING_PLANS.basic; }
export function buildingBulkPack(tier:string){ return BUILDING_BULK_PACKS.find(p => p.tier === tier); }
