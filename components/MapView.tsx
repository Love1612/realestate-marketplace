"use client";
import { useEffect, useRef } from "react";
type Point={id?:string;title?:string;lat:number;lon:number;price?:number;href?:string};
export default function MapView({points,height=430}:{points:Point[];height?:number}){
 const ref=useRef<HTMLDivElement>(null), mapRef=useRef<any>(null);
 useEffect(()=>{let cancelled=false;
  const init=async()=>{if(!ref.current)return;
   if(!(window as any).L){
    const css=document.createElement("link"); css.rel="stylesheet"; css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
    await new Promise<void>((resolve,reject)=>{const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";s.crossOrigin="";s.onload=()=>resolve();s.onerror=()=>reject();document.head.appendChild(s)});
   }
   if(cancelled||!ref.current)return; const L=(window as any).L;
   if(!mapRef.current){mapRef.current=L.map(ref.current,{scrollWheelZoom:false}).setView([39.8283,-98.5795],4);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(mapRef.current);}
   const map=mapRef.current; map.eachLayer((layer:any)=>{if(layer instanceof L.Marker)map.removeLayer(layer)});
   if(points.length){const bounds=L.latLngBounds(points.map(p=>[p.lat,p.lon]));points.forEach(p=>{const m=L.marker([p.lat,p.lon]).addTo(map);const price=typeof p.price==="number"?`<strong>$${p.price.toLocaleString()}/mo</strong><br/>`:"";m.bindPopup(`${price}<a href="${p.href||"#"}" style="font-weight:700">${escapeHtml(p.title||"Rental")}</a>`)});map.fitBounds(bounds.pad(.12),{maxZoom:13});}else map.setView([39.8283,-98.5795],4);setTimeout(()=>map.invalidateSize(),50);
  }; init().catch(()=>{}); return()=>{cancelled=true};
 },[points]);
 return <div ref={ref} style={{width:"100%",height,borderRadius:14,overflow:"hidden",background:"#eef2f6"}} aria-label="Interactive rental map"/>;
}
function escapeHtml(v:string){return v.replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||c))}
