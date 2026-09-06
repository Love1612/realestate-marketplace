/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers(){
    return [{source:'/(.*)',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'X-Frame-Options',value:'SAMEORIGIN'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
      {key:'Content-Security-Policy',value:"default-src 'self'; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.openstreetmap.org https:; style-src 'self' 'unsafe-inline' https://unpkg.com; script-src 'self' 'unsafe-inline' https://unpkg.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://graph.facebook.com https://api.linkedin.com https://api.x.com https://nominatim.openstreetmap.org; frame-src 'self' https://www.openstreetmap.org; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com"}
    ]}];
  }
};
export default nextConfig;
