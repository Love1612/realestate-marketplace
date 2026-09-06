const PROPERTY_TYPES = new Set(['House','Apartment','Condo','Townhome','Room','Duplex','Triplex','Fourplex','Multi-family','Cabin','Vacation rental','RV space','Parking','Commercial','Office/Retail','Land','Warehouse/Industrial','Other']);

const text = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : '';

export function validateListingInput(body: any) {
  const title = text(body.title, 120);
  const description = text(body.description, 5000);
  const property_type = text(body.property_type, 40);
  const address = text(body.address, 200);
  const city = text(body.city, 100);
  const state = text(body.state, 50);
  const zip = text(body.zip, 20);
  const monthly_rent = Number(body.monthly_rent);
  const bedrooms = Number(body.bedrooms ?? 0);
  const bathrooms = Number(body.bathrooms ?? 0);
  const available_on = body.available_on ? text(body.available_on, 10) : null;

  if (title.length < 3 || description.length < 10) throw new Error('Please provide a clear title and description.');
  if (!PROPERTY_TYPES.has(property_type)) throw new Error('Please choose a valid property type.');
  if (![address, city, state, zip].every(Boolean)) throw new Error('Please complete the property address.');
  if (!Number.isFinite(monthly_rent) || monthly_rent < 0 || monthly_rent > 100000000) throw new Error('Enter a valid monthly rent.');
  if (!Number.isFinite(bedrooms) || bedrooms < 0 || bedrooms > 1000) throw new Error('Enter a valid bedroom count.');
  if (!Number.isFinite(bathrooms) || bathrooms < 0 || bathrooms > 1000) throw new Error('Enter a valid bathroom count.');
  if (available_on && !/^\d{4}-\d{2}-\d{2}$/.test(available_on)) throw new Error('Enter a valid availability date.');

  return { title, description, property_type, address, city, state, zip, monthly_rent, bedrooms, bathrooms, available_on };
}
