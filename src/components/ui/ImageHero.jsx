import SceneImage from './SceneImage';

export default function ImageHero({ scene = 'dawn', eyebrow, title, subtitle, action, className = '' }) {
  return (
    <section className={`relative min-h-[250px] overflow-hidden rounded-b-[34px] shadow-cinematic ${className}`}>
      <SceneImage scene={scene} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/24 to-ink/92" />
      <div className="relative z-10 flex min-h-[250px] flex-col justify-end px-5 pb-6 pt-16">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.24em] text-candle">{eyebrow}</p>}
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ivory">{title}</h1>
        {subtitle && <p className="mt-3 max-w-[285px] text-sm leading-6 text-ivory/78">{subtitle}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </section>
  );
}
