import Image from "next/image";
import Link from "next/link";
import { getAttractions, getCategories, getCities, getLocalProducts } from "@/lib/queries";
import { AttractionCard } from "@/components/AttractionCard";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, attractions, cities, products] = await Promise.all([
    getCategories(),
    getAttractions(),
    getCities(),
    getLocalProducts(),
  ]);

  const featured = attractions.filter((a) => a.isFeatured).slice(0, 6);

  return (
    <main style={{ background: "#F0E4CB", direction: "rtl" }}>

      {/* ══════════ HERO ══════════ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* ── BACKGROUND: Desert landscape image ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-desert-bg.png"
          alt="صحراء الوادي الجديد عند الغروب"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            zIndex: 0,
          }}
        />

        {/* ── OVERLAY: dark right side for text readability + warm left glow ── */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(to left, rgba(15,8,2,0.82) 0%, rgba(15,8,2,0.55) 40%, rgba(180,100,10,0.12) 70%, transparent 100%)",
          pointerEvents: "none",
        }} />
        {/* Bottom darkening for cards */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55%",
          zIndex: 1,
          background: "linear-gradient(to top, rgba(10,5,0,0.72) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* ── CONTENT ── */}
        <div style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "4rem 2rem 0",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "92vh",
        }}>

          {/* ── شعار المحافظة — أعلى يسار الـ Hero ── */}
          <div style={{
            position: "absolute",
            top: "1.5rem",
            left: "2rem",
            zIndex: 3,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-new-valley.png"
              alt="شعار محافظة الوادي الجديد"
              style={{
                width: "clamp(90px, 11vw, 145px)",
                height: "auto",
                display: "block",
                /* multiply: البيكسلات البيضاء تضرب بألوان الخلفية → تختفي تماماً */
                mixBlendMode: "multiply",
                filter: "drop-shadow(0 0 20px rgba(228,184,92,0.9)) drop-shadow(0 3px 10px rgba(0,0,0,0.75)) saturate(1.3) contrast(1.2) brightness(1.05)",
                opacity: 1,
              }}
            />
          </div>

          {/* Top: Text block on the LEFT + Cards on the RIGHT */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flex: 1,
            paddingBottom: "2rem",
            gap: "2rem",
          }}>

            {/* TEXT — اليسار */}
            <div style={{ maxWidth: 520, textAlign: "right" }}>
              {/* Location label */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "rgba(228,184,92,0.9)",
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "1rem",
                letterSpacing: "0.04em",
              }}>
                <span>📍</span> الواحات الجديدة – مصر
              </div>

              {/* Main heading */}
              <h1 style={{
                fontSize: "clamp(3rem, 8vw, 6rem)",
                fontWeight: 900,
                lineHeight: 1.05,
                marginBottom: "0.6rem",
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              }}>
                <span style={{ color: "#fff", display: "block" }}>اكتشف</span>
                <span style={{
                  display: "block",
                  color: "#E4B85C",
                  textShadow: "0 0 40px rgba(228,184,92,0.4), 0 2px 20px rgba(0,0,0,0.5)",
                }}>الوادي الجديد</span>
              </h1>

              {/* Subtitle — أصغر ومضيء */}
              <p style={{
                fontSize: "clamp(1.1rem, 2.5vw, 1.55rem)",
                fontWeight: 800,
                color: "#E4B85C",
                textShadow: "0 0 28px rgba(228,184,92,0.55), 0 2px 12px rgba(0,0,0,0.4)",
                marginBottom: "1rem",
                lineHeight: 1.3,
              }}>
                بذكاء اصطناعي حقيقي
              </p>

              {/* Description */}
              <p style={{
                fontSize: "0.95rem",
                lineHeight: 1.75,
                color: "rgba(240,228,200,0.88)",
                marginBottom: "2rem",
                maxWidth: 440,
              }}>
                دليلك المتكامل لاكتشاف واحات الخارجة والداخلة والفرافرة — خطط رحلتك خلال دقيقتين مع مخطط الرحلات الذكي.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link href="/explore" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.8rem 1.8rem",
                  background: "linear-gradient(135deg, #D9A441, #E4B85C)",
                  color: "#1a0d00",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  borderRadius: 9999,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(217,164,65,0.45)",
                }}>
                  → استكشف الوجهات
                </Link>
                <Link href="/planner" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.8rem 1.8rem",
                  background: "rgba(20,12,4,0.55)",
                  color: "#E4B85C",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  borderRadius: 9999,
                  textDecoration: "none",
                  border: "1.5px solid rgba(228,184,92,0.55)",
                  backdropFilter: "blur(8px)",
                }}>
                  ✦ خطط رحلتي
                </Link>
              </div>
            </div>

            {/* CARDS — اليمين */}
            <div style={{
              display: "flex",
              gap: "0.9rem",
              alignItems: "flex-end",
              flexShrink: 0,
            }}>
              {[
                { src: "/dest-qasr.jpg", label: "القصر" },
                { src: "/dest-white-desert.jpg", label: "الصحراء البيضاء" },
                { src: "/dest-dakhla.jpg", label: "الواحات" },
              ].map((card) => (
                <Link
                  key={card.label}
                  href="/explore"
                  style={{
                    display: "block",
                    width: 155,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1.5px solid rgba(228,184,92,0.45)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
                    textDecoration: "none",
                    flexShrink: 0,
                    transition: "transform 0.3s ease",
                  }}
                >
                  <div style={{ position: "relative", height: 200 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.src}
                      alt={card.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(15,8,0,0.82) 0%, transparent 55%)",
                    }} />
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      left: 0,
                      padding: "0.6rem 0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <span style={{ color: "#E4B85C", fontSize: "0.75rem", fontWeight: 700 }}>→</span>
                      <span style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 800 }}>{card.label}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>

          {/* Palm icon bottom-left decoration */}
          <div style={{
            color: "rgba(228,184,92,0.35)",
            fontSize: "3.5rem",
            lineHeight: 1,
            paddingBottom: "0.5rem",
            alignSelf: "flex-start",
          }} aria-hidden="true">🌴</div>
        </div>

        {/* ── WAVE TRANSITION ── */}
        <div style={{ position: "relative", zIndex: 3, marginTop: "-2px" }}>
          <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
            <path d="M0,60 C200,90 400,30 600,55 C800,80 1000,20 1200,50 C1320,68 1400,75 1440,72 L1440,90 L0,90 Z" fill="#D9A441" opacity="0.35" />
            <path d="M0,70 C180,45 360,88 600,65 C840,42 1080,85 1440,62 L1440,90 L0,90 Z" fill="#EDD9B0" opacity="0.55" />
            <path d="M0,78 C240,60 480,90 720,75 C960,60 1200,88 1440,78 L1440,90 L0,90 Z" fill="#EDD9B0" />
          </svg>
        </div>
      </section>

      {/* ══════════ VALUE STRIP ══════════ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.25rem 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: "1rem",
          }}
        >
          {[
            { icon: "🤖", title: "ذكاء اصطناعي حقيقي", text: "مخطط رحلات يبني برنامجك اليومي في دقيقتين" },
            { icon: "🗺️", title: "معلومات موثوقة", text: "بيانات منقحة عن أماكن وفنادق وأنشطة" },
            { icon: "🏨", title: "حجز فنادق مباشر", text: "اختر فندقك ضمن خطة رحلتك بسهولة" },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: "#F5EDD8",
                borderRadius: 16,
                padding: "1.4rem",
                border: "1px solid #D9C49A",
                boxShadow: "0 1px 3px rgb(23 35 33 / 0.05)",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#F0E4CB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1A0D00", marginBottom: "0.25rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.78rem", color: "#17232177", lineHeight: 1.5 }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CATEGORIES ══════════ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 1.25rem" }}>
        <SectionHeading eyebrow="استكشف حسب اهتمامك" title="أربع طرق لاكتشاف الوادي الجديد" />
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
            gap: "1rem",
          }}
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.slug}`}
              className="w-hover-lift animate-fade-up"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1.5rem 1rem",
                background: "#F5EDD8",
                borderRadius: 20,
                border: "1px solid #D9C49A",
                boxShadow: "0 1px 3px rgb(23 35 33 / 0.05)",
                textDecoration: "none",
                textAlign: "center",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  backgroundColor: cat.colorHex ?? "#C98B2E",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "transform 0.22s ease",
                }}
              >
                {cat.icon}
              </span>
              <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1A0D00" }}>{cat.nameAr}</h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                  color: "#17232177",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {cat.descriptionAr}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURED ATTRACTIONS ══════════ */}
      <section style={{ background: "#EDD9B0", padding: "4rem 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
            <SectionHeading eyebrow="الأعلى تقييمًا" title="معالم لا يجب أن تفوّتك" />
            <Link
              href="/explore"
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#9A6318",
                textDecoration: "none",
                display: "none",
              }}
              className="sm:block"
            >
              عرض الكل ←
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
              gap: "1.25rem",
            }}
          >
            {featured.map((a, i) => (
              <AttractionCard key={a.id} attraction={a} index={i} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link
              href="/explore"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 2rem",
                borderRadius: 9999,
                background: "#F0E4CB",
                color: "#9A6318",
                fontWeight: 800,
                fontSize: "0.87rem",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              عرض جميع المعالم ←
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ CITIES ══════════ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 1.25rem" }}>
        <SectionHeading eyebrow="الواحات الثلاث" title="أين تقع هذه الكنوز؟" />
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: "1.25rem",
          }}
        >
          {cities.map((city, i) => (
            <Link
              key={city.id}
              href={`/explore?city=${city.slug}`}
              className="animate-fade-up"
              style={{
                position: "relative",
                height: 240,
                borderRadius: 20,
                overflow: "hidden",
                display: "block",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgb(23 35 33 / 0.1)",
                animationDelay: `${i * 100}ms`,
              }}
            >
              <Image
                src={city.imageUrl ?? ""}
                alt={city.nameAr}
                fill
                sizes="33vw"
                style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                className="group-hover:scale-110"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(18,60,58,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, padding: "1.25rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#fff" }}>{city.nameAr}</h3>
                <p
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {city.descriptionAr}
                </p>
              </div>
              {/* Accent line */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  left: 0,
                  height: 3,
                  background: "linear-gradient(to left, #D9A441, transparent)",
                }}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════ AI PLANNER CTA ══════════ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem 4rem" }}>
        <div
          style={{
            borderRadius: 28,
            overflow: "hidden",
            background: "linear-gradient(135deg,#1A0D00 0%,#2A1500 40%,#3D1F00 100%)",
            position: "relative",
            padding: "3.5rem 2.5rem",
          }}
        >
          {/* BG decoration */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: -60,
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(216,168,78,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "2rem",
              alignItems: "center",
            }}
            className="responsive-cta-grid"
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(217,164,65,0.2)",
                  border: "1px solid rgba(217,164,65,0.4)",
                  color: "#E4B85C",
                  borderRadius: 9999,
                  padding: "0.3rem 0.9rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                مدعوم بالذكاء الاصطناعي
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: "0.75rem",
                  lineHeight: 1.3,
                }}
              >
                لا تعرف كيف تخطط لرحلتك؟
                <br />اترك الأمر لـ وادينا
              </h2>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 440, marginBottom: "1.75rem" }}>
                أخبرنا عن أيامك وميزانيتك ومن ستسافر معه — ستحصل على برنامج يومي كامل مرتب حسب المناطق.
              </p>
              <Link
                href="/planner"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.85rem 2rem",
                  background: "#D9A441",
                  color: "#1A0D00",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  borderRadius: 9999,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(201,139,46,0.45)",
                  transition: "transform 0.2s",
                }}
              >
                ابدأ التخطيط الآن ✦
              </Link>
            </div>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3.5rem",
                flexShrink: 0,
              }}
            >
              🗺️
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PRODUCTS TEASER ══════════ */}
      <section style={{ background: "#EDD9B0", padding: "4rem 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>
          <SectionHeading eyebrow="اقتصاد الواحة" title="ادعم الحرفيين المحليين" />
          <div
            style={{
              marginTop: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))",
              gap: "0.85rem",
            }}
          >
            {products.slice(0, 6).map((p, i) => (
              <Link
                key={p.id}
                href="/products"
                className="animate-fade-up w-hover-lift-sm"
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#F5EDD8",
                  border: "1px solid #D9C49A",
                  boxShadow: "0 1px 3px rgb(23 35 33 / 0.05)",
                  textDecoration: "none",
                  transition: "transform 0.22s ease, box-shadow 0.22s ease",
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div style={{ position: "relative", height: 96, overflow: "hidden" }}>
                  <Image
                    src={p.imageUrl}
                    alt={p.nameAr}
                    fill
                    style={{ objectFit: "cover", transition: "transform 0.4s" }}
                  />
                </div>
                <p
                  style={{
                    padding: "0.5rem",
                    textAlign: "center",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#1A0D00",
                  }}
                >
                  {p.nameAr}
                </p>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
            <Link
              href="/products"
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#9A6318",
                textDecoration: "none",
              }}
            >
              تصفح جميع المنتجات المحلية ←
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ── Shared helpers ── */
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#9A6318",
          display: "block",
          marginBottom: "0.5rem",
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          fontWeight: 900,
          color: "#1A0D00",
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h2>
    </div>
  );
}
