export const LISTING_PLANS = {
  basic: {name:'Basic', cents:500, label:'$5 / 30 days', multiplier:1},
} as const;

export const SINGLE_UNIT_PRICE = 5;
export const BULK_THRESHOLD = 10;
export const BULK_UNIT_PRICE = 2.5;

/** Under 10 vacancies: $5 each. 10 or more advertised units: $2.50 each for 30 days. */
export function buildingBulkPrice(units:number){
  if(units < BULK_THRESHOLD) return units * SINGLE_UNIT_PRICE;
  return units * BULK_UNIT_PRICE;
}

export const BUILDING_BULK_PACKS = [
  {tier:'b4', units:4, price:20, perUnit:5, label:'Under 10 units', blurb:'1–9 vacancies stay $5 each. No volume rate yet.'},
  {tier:'b10', units:10, price:25, perUnit:2.5, label:'Volume rate starts', blurb:'10 advertised vacancies. $2.50 each — 50% off $5.'},
  {tier:'b16', units:16, price:40, perUnit:2.5, label:'Mid-size building', blurb:'16 open units at $2.50. Occupied doors do not count.'},
  {tier:'b32', units:32, price:80, perUnit:2.5, label:'Large building', blurb:'32 advertised vacancies at $2.50 each.'},
  {tier:'b64', units:64, price:null, perUnit:2.5, label:'Full community 64+', blurb:'Custom quote. Same idea: only vacant units, $2.50 once you clear 10.'},
] as const;

export const PORTFOLIO_TIERS = [
 {tier:'10', listings:10, price:35}, {tier:'25', listings:25, price:70}, {tier:'50', listings:50, price:140},
 {tier:'100', listings:100, price:225}, {tier:'250', listings:250, price:450}, {tier:'500+', listings:500, price:null}
] as const;

export type ListingPlan = keyof typeof LISTING_PLANS;
export function activeListingPlan(plan:string){ return LISTING_PLANS[plan as ListingPlan] || LISTING_PLANS.basic; }
export function buildingBulkPack(tier:string){ return BUILDING_BULK_PACKS.find(p => p.tier === tier); }
