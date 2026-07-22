import Link from "next/link";

export type PromoGraphicTile = {
  id: number;
  image_url: string | null;
  link_url: string;
  alt_text: string;
  column: number;
};

export type PromoGraphicBlock = {
  id: number;
  insert_after_products: number;
  sort_order: number;
  tiles: PromoGraphicTile[];
};

function PromoGraphicTileView({ tile }: { tile: PromoGraphicTile }) {
  const alt = tile.alt_text || "Promo offer";
  const img = (
    <img
      src={tile.image_url || "/imgs/template/monitor.svg"}
      alt={alt}
      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      loading="lazy"
      decoding="async"
    />
  );

  const shell = (
    <div className="group relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200/60 sm:rounded-2xl">
      {img}
    </div>
  );

  if (tile.link_url) {
    const external = /^https?:\/\//i.test(tile.link_url);
    if (external) {
      return (
        <a href={tile.link_url} target="_blank" rel="noopener noreferrer" className="block">
          {shell}
        </a>
      );
    }
    return (
      <Link href={tile.link_url} className="block">
        {shell}
      </Link>
    );
  }

  return shell;
}

export default function PromoGraphicRow({ block }: { block: PromoGraphicBlock }) {
  const tiles = [...(block.tiles || [])].sort((a, b) => a.column - b.column);
  if (!tiles.length) return null;

  return (
    <div
      className={`col-span-full grid gap-3 sm:gap-4 ${
        tiles.length >= 2 ? "grid-cols-2" : "grid-cols-1 max-w-xl mx-auto w-full"
      }`}
      data-promo-graphic-block={block.id}
    >
      {tiles.map((tile) => (
        <PromoGraphicTileView key={tile.id} tile={tile} />
      ))}
    </div>
  );
}
