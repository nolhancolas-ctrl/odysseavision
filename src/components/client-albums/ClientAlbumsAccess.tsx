import { clientAlbumAccessFeatures, clientAlbumImages } from "@/data/clients";

export function ClientAlbumsAccess() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-16 md:px-14 md:py-20">
      <div className="mx-auto grid max-w-[1450px] items-center gap-12 lg:grid-cols-[0.55fr_1.45fr]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#242617]/55">
            Easy & secure access
          </p>

          <h2 className="mt-5 font-serif text-4xl uppercase leading-[1.05]">
            Your gallery,
            <br />
            your way.
          </h2>

          <div className="my-6 h-px w-10 bg-[#242617]/35" />

          <div className="space-y-6">
            {clientAlbumAccessFeatures.map((feature) => (
              <div key={feature.title} className="grid grid-cols-[64px_1fr] gap-5">
                <div className="flex h-28 w-28 -translate-x-10 -translate-y-5 items-center justify-center">
                  <img
                    src={feature.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-28 w-28 object-contain opacity-100"
                  />
                </div>

                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#242617]/70">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-xs leading-6 text-[#242617]/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px] md:min-h-[560px] lg:min-h-[430px]">
          {/* Background image: shifted right on desktop to let the card breathe */}
          <div
            className="ml-auto mt-[150px] h-[330px] w-full bg-cover bg-center md:mt-[165px] md:h-[390px] lg:mt-0 lg:h-[430px] lg:w-[82%]"
            style={{
              backgroundImage: `url(${clientAlbumImages.accessFond.src})`,
            }}
          />

          {/* Access card */}
          <div className="absolute left-1/2 top-0 w-[min(86vw,330px)] -translate-x-1/2 rotate-[-4deg] border-[5px] border-white/70 bg-[#172016] p-7 text-[#f4efe4] shadow-2xl md:w-[350px] lg:left-0 lg:top-1/2 lg:w-[340px] lg:-translate-y-1/2 lg:translate-x-0">
            {/* Tape */}
            <div className="absolute left-1/2 top-[-22px] h-9 w-28 -translate-x-1/2 rotate-[2deg] bg-[#d8cdb8]/70 shadow-sm backdrop-blur-[1px]" />

            <p className="mb-5 font-hand text-3xl leading-[0.95] text-white/80">
              access your
              <br />
              gallery
            </p>

            <label className="text-[9px] uppercase tracking-[0.18em] text-white/50">
              Enter your password
            </label>

            <input
              type="password"
              placeholder="Password"
              className="mt-3 w-full border border-white/30 bg-transparent px-4 py-3 text-xs outline-none placeholder:text-white/35"
            />

            <button
              type="button"
              className="mt-5 w-full border border-white/35 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#172016]"
            >
              View gallery
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
