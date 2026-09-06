import {createServerSupabaseClient} from "@/lib/supabase-server";
import type {Metadata} from "next";
import ContactOwner from "@/components/ContactOwner"; import FavoriteButton from "@/components/FavoriteButton"; import ShareButton from "@/components/ShareButton"; import ReportButton from "@/components/ReportButton"; import PublishListing from "@/app/social/PublishListing";

export async function generateMetadata({params}:{params:Promise<{id:string}>}): Promise<Metadata>{
  const {id}=await params;
  const supabase=await createServerSupabaseClient();
  const {data:l}=await supabase.from("listings").select("title,description,monthly_rent,city,state,listing_photos(public_url)").eq("id",id).eq("status","live").gt("expires_at",new Date().toISOString()).single();
  if(!l) return {title:"Rental listing | RentHub"};
  const description = `${l.title} · $${Number(l.monthly_rent).toLocaleString()}/month · ${l.city}, ${l.state}. ${String(l.description||"").slice(0,120)}`;
  const image = l.listing_photos?.[0]?.public_url;
  return {
    title:`${l.title} | RentHub`,
    description,
    openGraph:{
      title:l.title,
      description,
      type:"website",
      ...(image ? {images:[{url:image,alt:l.title}]} : {})
    },
    twitter:{
      card:image ? "summary_large_image" : "summary",
      title:l.title,
      description,
      ...(image ? {images:[image]} : {})
    }
  };
}

export default async function ListingDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const supabase=await createServerSupabaseClient();
 const {data:l}=await supabase.from("listings").select("*,listing_photos(*)").eq("id",id).eq("status","live").gt("expires_at",new Date().toISOString()).single();
 if(!l)return <main className="section"><div className="container"><div className="empty"><h2>Listing unavailable</h2><p className="muted">This rental may have expired or been removed.</p></div></div></main>;
 const {data:{user}}=await supabase.auth.getUser(); const photos=(l.listing_photos||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order), q=encodeURIComponent(`${l.address}, ${l.city}, ${l.state} ${l.zip}`);
 return <main className="section"><div className="container">
  <div className="toolbar"><a className="muted" href="/listings">← Back to rentals</a><div className="dashboard-actions"><ShareButton/><FavoriteButton listingId={l.id}/></div></div>
  {photos.length>0&&<div className="gallery" style={{marginBottom:22}}><img className="main" src={photos[0].public_url} alt={l.title}/>{photos.slice(1,5).map((p:any)=><img key={p.id} src={p.public_url} alt="Property photo"/>)}</div>}
  <div className="detail-layout"><div><div className="panel"><span className="badge live">Available</span><h1>{l.title}</h1><div className="price">${Number(l.monthly_rent).toLocaleString()}/month</div><div className="listing-meta"><span className="badge">{l.property_type}</span><span className="badge">{l.bedrooms||0} bd</span><span className="badge">{l.bathrooms||0} ba</span></div><p className="muted">{l.address}, {l.city}, {l.state} {l.zip}</p><hr style={{border:0,borderTop:"1px solid #e5e7eb",margin:"20px 0"}}/><p style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{l.description}</p>{l.available_on&&<div className="notice"><strong>Available:</strong> {new Date(l.available_on+"T00:00:00").toLocaleDateString()}</div>}</div><ContactOwner listingId={l.id}/>{user?.id===l.owner_id&&<div style={{marginTop:12}}><PublishListing listingId={l.id}/></div>}<div style={{marginTop:12}}><ReportButton listingId={l.id}/></div></div>
  <div><div className="panel"><h3>Location</h3><p className="muted">{l.city}, {l.state} {l.zip}</p><iframe title="Property map" style={{width:"100%",height:260,border:0,borderRadius:12}} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?search=${q}`}/><div style={{marginTop:8}}><a className="muted" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/search?query=${q}`}>Open map →</a></div></div></div></div>
 </div></main>
}