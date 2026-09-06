"use client";
import {useEffect,useRef,useState} from "react"; import MapView from "./MapView";
export default function LocationMap({lat,lon,address,title}:{lat?:number|null;lon?:number|null;address:string;title?:string}){
 const [coords,setCoords]=useState(lat!=null&&lon!=null?{lat:Number(lat),lon:Number(lon)}:null); const tried=useRef(false);
 useEffect(()=>{if(coords||tried.current)return;tried.current=true;const c=new AbortController();fetch(`/api/geocode?q=${encodeURIComponent(address)}`,{signal:c.signal}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(d.lat!=null&&d.lon!=null)setCoords({lat:Number(d.lat),lon:Number(d.lon)})}).catch(()=>{});return()=>c.abort()},[address,coords]);
 const url=coords?`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`:`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
 return <div className="location-map">{coords?<MapView points={[{lat:coords.lat,lon:coords.lon,title:title||"Rental"}]} height={300}/>:<div className="map-placeholder"><strong>Map location</strong><span>Locating this property…</span></div>}<div className="map-footer"><span className="muted">Approximate location shown for privacy.</span><a className="btn btn-light" href={url} target="_blank" rel="noreferrer">Get directions</a></div></div>
}
