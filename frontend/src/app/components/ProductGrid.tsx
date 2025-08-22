export type Product = {
  id: string | number;
  title: string;
  image: string;
  price: number;
  endsIn?: string;
  badge?: string;
};

export default function ProductGrid({ items }: { items: Product[] }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
          Featured Auctions
        </h2>
        <a href="/auctions" className="text-primary-light dark:text-primary-dark text-sm hover:underline">
          View all
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <article key={p.id} className="group rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark shadow-sm hover:shadow-md transition">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {p.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-secondary-light dark:bg-secondary-dark text-white text-xs font-medium px-2 py-0.5">
                  {p.badge}
                </span>
              )}
              {p.endsIn && (
                <span className="absolute right-3 bottom-3 rounded-md bg-black/70 text-white text-xs px-2 py-1">
                  ⏱ {p.endsIn}
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-semibold text-text-light dark:text-text-dark min-h-[2.5rem]">
                {p.title}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-mutedLight dark:text-text-mutedDark">Current bid</p>
                  <p className="text-base font-semibold text-text-light dark:text-text-dark">
                    LKR {p.price.toLocaleString()}
                  </p>
                </div>
                <a href={`/auctions/${p.id}`} className="inline-flex items-center justify-center rounded-lg bg-primary-light dark:bg-primary-dark text-white text-sm font-medium px-3 py-2 hover:opacity-90">
                  Place Bid
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
