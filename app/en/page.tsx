'use client'
import { useRouter } from 'next/navigation'

export default function EnglishLanding() {
  const router = useRouter()

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root { --bg:oklch(0.97 0.005 80);--ink:oklch(0.20 0.005 80);--ink-2:oklch(0.42 0.005 80);--ink-3:oklch(0.60 0.005 80);--rule:oklch(0.88 0.006 80);--accent:oklch(0.42 0.06 150);--accent-tint:oklch(0.95 0.02 150);--gold:#C8A96E;--serif:"Cormorant Garamond",serif;--sans:"DM Sans",system-ui,sans-serif;--mono:"JetBrains Mono",monospace; }
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @keyframes slow-zoom{0%{transform:scale(1)}100%{transform:scale(1.08)}}
    .cta-btn{display:inline-block;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:500;text-decoration:none;cursor:pointer;border:none;font-family:var(--sans);transition:all 0.2s}
    .cta-btn:hover{transform:translateY(-2px)}
    .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
    .dark{background:#060D08;color:white}
    .light{background:var(--bg);color:var(--ink)}
    @media(max-width:768px){.grid-3{grid-template-columns:1fr}.grid-2{grid-template-columns:1fr}.hide-mob{display:none!important}}
  `

  return (
    <main style={{ fontFamily:'var(--sans)' }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(6,13,8,0.88)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/en" style={{ fontFamily:'var(--serif)', fontSize:22, color:'white', textDecoration:'none' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></a>
        <div style={{ display:'flex', gap:24, fontSize:13 }} className="hide-mob">
          <a href="#why-cr" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Why Costa Rica</a>
          <a href="#visa" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Rentista Visa</a>
          <a href="#zones" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Top Zones</a>
          <a href="#process" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Buying Process</a>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <a href="/propiedades" style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>ES</a>
          <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontSize:13, color:'white', fontWeight:500 }}>EN</span>
          <button onClick={() => router.push('/propiedades')} style={{ marginLeft:8, padding:'9px 20px', borderRadius:999, background:'oklch(0.42 0.06 150)', color:'white', fontSize:13, fontWeight:500, border:'none', cursor:'pointer' }}>
            Browse Properties
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="dark" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:'-5%', backgroundImage:'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.12, animation:'slow-zoom 24s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,8,0.3) 0%, rgba(6,13,8,0.97) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, maxWidth:800, animation:'fadeUp 0.6s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:999, padding:'6px 18px', marginBottom:28 }}>
            <span style={{ fontSize:16 }}>🇨🇷</span>
            <span style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>Premium Real Estate · Costa Rica</span>
          </div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(44px,7vw,88px)', fontWeight:400, lineHeight:1.0, marginBottom:24, color:'white' }}>
            Your home in<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>paradise starts here.</em>
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.55)', lineHeight:1.8, maxWidth:580, margin:'0 auto 40px' }}>
            NIDO is Costa Rica\'s premium real estate platform. We connect international buyers with verified properties, certified advisors, and a transparent buying process — all in English.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/propiedades')} className="cta-btn" style={{ background:'oklch(0.42 0.06 150)', color:'white' }}>
              Browse Properties →
            </button>
            <a href="#why-cr" className="cta-btn" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
              Why Costa Rica? ↓
            </a>
          </div>
          <div className="grid-3" style={{ marginTop:56, maxWidth:540, margin:'56px auto 0' }}>
            {[
              { val:'100%', label:'Verified properties' },
              { val:'4%', label:'Commission only at closing' },
              { val:'English', label:'Full support in English' },
            ].map(s => (
              <div key={s.val} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 12px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--gold)', marginBottom:4 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY COSTA RICA */}
      <section id="why-cr" className="light" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>The opportunity</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Why savvy investors<br/><em style={{ fontStyle:'italic', color:'var(--accent)' }}>choose Costa Rica.</em>
            </h2>
          </div>
          <div className="grid-3" style={{ marginBottom:32 }}>
            {[
              { icon:'🌿', titulo:'Political stability', desc:'Costa Rica has been a democracy since 1949 — no army, strong institutions and one of the most stable governments in Latin America. Your investment is protected.' },
              { icon:'📈', titulo:'8.4% annual appreciation', desc:'Premium zones like Escazú, Santa Ana and coastal areas have seen consistent property value growth over the last decade, outperforming many US and European markets.' },
              { icon:'🌊', titulo:'World-class lifestyle', desc:'From Pacific surf breaks to Caribbean beaches, cloud forests and vibrant cities — Costa Rica offers a quality of life that attracts expats, retirees and remote workers worldwide.' },
              { icon:'✈️', titulo:'3 hours from Miami', desc:'Direct flights from major US and European cities. Easy to visit, easy to access. Costa Rica is one of the most connected countries in Central America.' },
              { icon:'⚖️', titulo:'Foreigners buy freely', desc:"Costa Rica's constitution grants foreigners the same property rights as citizens. No restrictions on foreign ownership — full title, full rights." },
              { icon:'💻', titulo:'Digital nomad hub', desc:'With fast internet, coworking spaces and a growing expat community, Costa Rica is consistently ranked among the top destinations for remote workers and entrepreneurs.' },
            ].map((item, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'24px' }}>
                <div style={{ fontSize:32, marginBottom:14 }}>{item.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{item.titulo}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'var(--accent-tint)', border:'1px solid oklch(0.85 0.04 150)', borderRadius:14, padding:'24px 32px', display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),oklch(0.30 0.08 150))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'#C8A96E', flexShrink:0, marginTop:2 }}>V</div>
            <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.7, fontStyle:'italic' }}>
              "Properties priced correctly and professionally photographed receive 3× more inquiries. Your NIDO advisor will analyze the ideal market value for any property you're interested in."
            </p>
          </div>
        </div>
      </section>

      {/* RENTISTA VISA */}
      <section id="visa" className="dark" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Legal residency</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05, color:'white' }}>
              Live legally in Costa Rica<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>with the Rentista Visa.</em>
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:560, margin:'16px auto 0' }}>
              Costa Rica\'s Rentista residency program allows foreigners to live legally in the country by demonstrating a stable passive income. It is one of the most accessible residency programs in Latin America.
            </p>
          </div>

          <div className="grid-2" style={{ marginBottom:32 }}>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'oklch(0.75 0.06 150)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.08em' }}>Requirements</div>
              {[
                { item:'Minimum $2,500 USD/month in stable passive income', detail:'From pension, investment returns, rental income or annuity' },
                { item:'Proof of income source', detail:'Bank statements, pension documents or investment records' },
                { item:'Clean criminal record', detail:'From your home country, apostilled and translated' },
                { item:'Valid passport', detail:'Must be valid during the application process' },
                { item:'Birth certificate', detail:'Apostilled and officially translated into Spanish' },
              ].map((r, i) => (
                <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:14, color:'white', marginBottom:4, display:'flex', gap:8 }}>
                    <span style={{ color:'oklch(0.75 0.06 150)', flexShrink:0 }}>✓</span> {r.item}
                  </div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', paddingLeft:20 }}>{r.detail}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { titulo:'Residency duration', desc:'Initial 2-year residency, renewable indefinitely. After 3 years you can apply for permanent residency.' },
                { titulo:'Work authorization', desc:"Rentista visa does not authorize employment in Costa Rica, but you can work remotely for foreign companies freely." },
                { titulo:'Path to citizenship', desc:'After 7 years of legal residency you can apply for Costa Rican citizenship, one of the most valued passports in LATAM.' },
                { titulo:'Tax benefits', desc:'Foreign-sourced income is generally not taxed in Costa Rica. Consult a local tax attorney for your specific situation.' },
                { titulo:'Processing time', desc:'Typically 6–18 months. NIDO can connect you with trusted immigration attorneys who specialize in residency applications.' },
              ].map((item, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'18px 20px' }}>
                  <div style={{ fontSize:14, fontWeight:500, color:'white', marginBottom:6 }}>{item.titulo}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.65 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'oklch(0.42 0.06 150/0.1)', border:'1px solid oklch(0.42 0.06 150/0.3)', borderRadius:12, padding:'18px 24px', fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
            ℹ️ The information above is for general reference only. NIDO can connect you with certified immigration attorneys in Costa Rica for personalized legal advice on your residency application.
          </div>
        </div>
      </section>

      {/* TOP ZONES */}
      <section id="zones" className="light" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Where to buy</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Costa Rica's top<br/><em style={{ fontStyle:'italic', color:'var(--accent)' }}>real estate zones.</em>
            </h2>
          </div>

          {/* GAM */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-3)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.08em' }}>Greater Metropolitan Area (GAM)</div>
            <div className="grid-3">
              {[
                { zona:'Escazú', tipo:'Luxury residential', precio:'$2,800/m²', desc:'The Beverly Hills of San José. Upscale condos, international schools, top restaurants and shopping. High demand, strong appreciation.' },
                { zona:'Santa Ana', tipo:'Family residential', precio:'$2,400/m²', desc:'Gated communities, green areas and a relaxed vibe 20 minutes from downtown. Preferred by expat families and professionals.' },
                { zona:'Curridabat', tipo:'Urban mixed', precio:'$2,100/m²', desc:'Growing district with modern apartments, walkable streets and proximity to major business centers. Great for investors.' },
              ].map((z, i) => (
                <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden' }}>
                  <div style={{ height:80, background:`linear-gradient(135deg, oklch(${0.35+i*0.05} 0.06 ${150+i*20}), oklch(${0.25+i*0.05} 0.08 ${150+i*20}))`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize:28, color:'white', fontStyle:'italic' }}>{z.zona}</span>
                  </div>
                  <div style={{ padding:'18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <span style={{ fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{z.tipo}</span>
                      <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--accent)', fontWeight:500 }}>{z.precio}</span>
                    </div>
                    <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.65 }}>{z.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coastal */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-3)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.08em' }}>Coastal & Beach Zones</div>
            <div className="grid-3">
              {[
                { zona:'Tamarindo', tipo:'Beach / Investment', precio:'$3,200/m²', desc:'Guanacaste\'s most vibrant beach town. International airport nearby. Strong rental yields and a well-established expat community.' },
                { zona:'Santa Teresa', tipo:'Premium surf & wellness', precio:'$3,800/m²', desc:'The Tulum of Costa Rica. Boutique hotels, yoga retreats and surf culture. Rapidly appreciating, attracting high-net-worth buyers.' },
                { zona:'Manuel Antonio', tipo:'Eco-luxury', precio:'$2,900/m²', desc:'National park views, luxury villas and strong vacation rental market. One of the most visited tourist destinations in the country.' },
              ].map((z, i) => (
                <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, overflow:'hidden' }}>
                  <div style={{ height:80, background:`linear-gradient(135deg, oklch(${0.30+i*0.04} 0.08 ${200+i*15}), oklch(${0.22+i*0.04} 0.1 ${200+i*15}))`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize:28, color:'white', fontStyle:'italic' }}>{z.zona}</span>
                  </div>
                  <div style={{ padding:'18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <span style={{ fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{z.tipo}</span>
                      <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--accent)', fontWeight:500 }}>{z.precio}</span>
                    </div>
                    <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.65 }}>{z.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BUYING PROCESS */}
      <section id="process" className="dark" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>How it works</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05, color:'white' }}>
              Buying in Costa Rica<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>step by step.</em>
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:520, margin:'16px auto 0' }}>
              NIDO guides you through every step of the process — from the first property search to signing at the notary.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0, marginBottom:48 }}>
            {[
              { num:'01', titulo:'Browse & connect', desc:'Explore verified properties on NIDO\'s portal. Filter by zone, price and type. Contact a certified English-speaking NIDO advisor who will guide you through the process.' },
              { num:'02', titulo:'Property visits', desc:'Your advisor coordinates property visits — in person or via virtual tour. We can schedule multiple properties in a single trip to maximize your time.' },
              { num:'03', titulo:'Due diligence', desc:'NIDO verifies the property in the National Registry of Costa Rica. We check title status, liens, encumbrances and zoning restrictions before you make an offer.' },
              { num:'04', titulo:'Letter of intent & offer', desc:'Once you have found your property, your advisor helps draft a letter of intent and a formal purchase offer with all legal protections in place.' },
              { num:'05', titulo:'Promise of sale contract', desc:'Both parties sign a promissory sale contract (promesa de compraventa) with your deposit — typically 10% of the agreed price. Legally binding in Costa Rica.' },
              { num:'06', titulo:'Closing at the notary', desc:'The final deed (escritura) is signed before a Costa Rican notary public. Transfer tax (1.5%) and legal fees apply. NIDO accompanies you through the entire closing.' },
            ].map((paso, i) => (
              <div key={i} style={{ display:'flex', gap:24, paddingBottom:32, position:'relative' }}>
                {i < 5 && <div style={{ position:'absolute', left:19, top:44, bottom:0, width:2, background:'rgba(255,255,255,0.06)' }}/>}
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent)', display:'grid', placeItems:'center', fontFamily:'var(--mono)', fontSize:11, color:'white', flexShrink:0, zIndex:1 }}>{paso.num}</div>
                <div style={{ flex:1, paddingTop:8 }}>
                  <div style={{ fontSize:16, fontWeight:500, marginBottom:6, color:'white' }}>{paso.titulo}</div>
                  <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Costs */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'28px 32px' }}>
            <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Closing costs reference</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { item:'Property transfer tax', cost:'1.5% of sale price', note:'Paid to the government' },
                { item:'Notary & legal fees', cost:'1.25% – 1.5%', note:'Shared equally between buyer and seller' },
                { item:'National Registry stamps', cost:'~0.5%', note:'Registration of the new deed' },
                { item:'NIDO buyer representation', cost:'Included', note:'No buyer commission — NIDO is paid by the seller' },
              ].map((r, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr', gap:8, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:13 }}>
                  <span style={{ color:'rgba(255,255,255,0.7)' }}>{r.item}</span>
                  <span style={{ fontFamily:'var(--mono)', color:'var(--gold)' }}>{r.cost}</span>
                  <span style={{ color:'rgba(255,255,255,0.35)' }}>{r.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NIDO FOR BUYERS */}
      <section className="light" style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>Why NIDO</div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(32px,5vw,56px)', fontWeight:400, lineHeight:1.05 }}>
              Your trusted partner<br/><em style={{ fontStyle:'italic', color:'var(--accent)' }}>in Costa Rica.</em>
            </h2>
          </div>
          <div className="grid-3" style={{ marginBottom:32 }}>
            {[
              { icon:'🔐', titulo:'100% verified properties', desc:'Every property on NIDO is cross-referenced with the Costa Rican National Registry. No surprises — clear title, verified ownership.' },
              { icon:'🇺🇸', titulo:'English-speaking advisors', desc:'Your NIDO advisor speaks English fluently and understands the needs of international buyers. No language barrier, no confusion.' },
              { icon:'✦', titulo:'AI-powered market analysis', desc:'Valeria, our AI assistant, provides real-time market comparables, price analysis and neighborhood insights to help you make informed decisions.' },
              { icon:'⚖️', titulo:'Legal & notarial support', desc:'NIDO coordinates with trusted Costa Rican attorneys and notaries to ensure your purchase is legally sound from offer to closing.' },
              { icon:'📊', titulo:'Transparent process', desc:'Track every step of your purchase from your buyer dashboard. Know exactly where you are in the process at all times.' },
              { icon:'🤝', titulo:'No buyer commission', desc:"NIDO's commission is paid by the seller (4%). As a buyer, you get full professional representation at no cost to you." },
            ].map((item, i) => (
              <div key={i} style={{ background:'white', border:'1px solid var(--rule)', borderRadius:14, padding:'24px' }}>
                <div style={{ fontSize:32, marginBottom:14 }}>{item.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{item.titulo}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="dark" style={{ padding:'80px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:16 }}>Ready to start?</div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(36px,6vw,64px)', fontWeight:400, color:'white', marginBottom:16, lineHeight:1.0 }}>
            Find your home<br/><em style={{ fontStyle:'italic', color:'oklch(0.75 0.06 150)' }}>in Costa Rica.</em>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.75, marginBottom:36 }}>
            Browse verified properties or connect with a certified English-speaking NIDO advisor. No commitment required.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => router.push('/propiedades')} className="cta-btn" style={{ background:'oklch(0.42 0.06 150)', color:'white', fontSize:16 }}>
              Browse Properties →
            </button>
            <a href="mailto:hola@nido-cr.com?subject=I want to buy property in Costa Rica" className="cta-btn" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
              Contact an advisor
            </a>
          </div>
          <p style={{ marginTop:24, fontSize:13, color:'rgba(255,255,255,0.3)' }}>
            Also available in <a href="/propiedades" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Español →</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#040A06', padding:'28px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.04)', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontFamily:'var(--serif)', fontSize:20, color:'white' }}>NIDO<span style={{ color:'var(--gold)' }}>.</span></span>
        <div style={{ display:'flex', gap:24, fontSize:12 }}>
          <a href="/propiedades" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Properties</a>
          <a href="/nosotros" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>About NIDO</a>
          <a href="/privacidad" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Privacy</a>
          <a href="/terminos" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Terms</a>
        </div>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>© 2026 NIDO · Costa Rica</span>
      </footer>
    </main>
  )
}
