"use client";

import {useState} from "react";

type Props = {
  title?: string;
};

export default function ShareButton({title = "RentHub listing"}: Props){
  const [open,setOpen] = useState(false);
  const [copied,setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";

  async function copyLink(){
    try{
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(()=>setCopied(false),1800);
    }catch{}
  }

  async function nativeShare(){
    try{
      if(navigator.share) await navigator.share({title,url});
    }catch{}
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="share-wrap">
      <button className="btn btn-light" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-haspopup="menu">
        ↗ Share
      </button>
      {open && (
        <div className="share-menu" role="menu">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button role="menuitem" onClick={nativeShare}>Share from your device</button>
          )}
          <a role="menuitem" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}>Facebook</a>
          <a role="menuitem" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}>X</a>
          <a role="menuitem" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}>WhatsApp</a>
          <a role="menuitem" target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}>LinkedIn</a>
          <a role="menuitem" href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>Email</a>
          <button role="menuitem" onClick={copyLink}>{copied ? "✓ Link copied" : "Copy link"}</button>
        </div>
      )}
    </div>
  );
}
