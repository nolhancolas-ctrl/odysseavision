type PhotoFrameProps = {
  src: string;
  label: string;
  className?: string;
  imageClassName?: string;
  showLabel?: boolean;
};

export function PhotoFrame({
  src,
  label,
  className = "",
  imageClassName = "",
  showLabel = true,
}: PhotoFrameProps) {
  return (
    <div
      className={`relative overflow-hidden border border-white/50 bg-[#28301f] shadow-2xl ${className}`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center ${imageClassName}`}
        style={{
          backgroundImage: `linear-gradient(rgba(20, 24, 15, 0.12), rgba(20, 24, 15, 0.12)), url(${src})`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />

      {showLabel && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-black/55 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/85 backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
}