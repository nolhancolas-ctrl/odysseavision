import { contactNewsletterImages } from "@/data/contact";

export function ContactNewsletter() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] px-6 py-20 text-[#242617] md:px-14">
      <div className="mx-auto grid max-w-[1450px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative">
          
          <h2 className="font-serif text-4xl uppercase leading-none tracking-[-0.04em] md:text-5xl">
            Stay inspired
          </h2>

          <p className="mt-5 font-hand text-xl leading-8 text-[#242617]/55">
            Join our mailing list for new stories, photos and behind the scenes.
          </p>

          <form className="mt-8 flex max-w-xl border border-[#242617]/35 bg-transparent">
            <input
              type="email"
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-[#242617] outline-none placeholder:text-[#242617]/45"
            />

            <button
              type="submit"
              className="border-l border-[#242617]/35 px-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#242617] transition hover:bg-[#10190f] hover:text-[#f4efe4]"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            contactNewsletterImages.image01,
            contactNewsletterImages.image02,
            contactNewsletterImages.image03,
            contactNewsletterImages.image04,
          ].map((src, index) => (
            <div
              key={src}
              className={`aspect-[0.82] bg-[#d8cfc0] bg-cover bg-center ${
                index % 2 === 0 ? "translate-y-2" : "-translate-y-2"
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
