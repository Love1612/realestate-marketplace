export const LISTING_PLANS = {
  basic: {name:'Basic', cents:500, label:'$5 / 30 days', multiplier:1},
} as const;
export const PORTFOLIO_TIERS = [
 {tier:'10', listings:10, price:35}, {tier:'25', listings:25, price:70}, {tier:'50', listings:50, price:140},
 {tier:'100', listings:100, price:225}, {tier:'250', listings:250, price:450}, {tier:'500+', listings:500, price:null}
] as const;
export type ListingPlan = keyof typeof LISTING_PLANS;
export function activeListingPlan(plan:string){ return LISTING_PLANS[plan as ListingPlan] || LISTING_PLANS.basic; }
