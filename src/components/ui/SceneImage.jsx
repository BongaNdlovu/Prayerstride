import scenes from '../../assets/cinematic-prayer-scenes.jpg';

export default function SceneImage({ scene = 'dawn', className = '', imgClassName = '' }) {
  const scenePosition = {
    dawn: '0% 0%',
    bible: '50% 0%',
    community: '100% 0%',
    chapel: '0% 100%',
    answered: '50% 100%',
    texture: '100% 100%',
  }[scene] || '0% 0%';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-cover bg-no-repeat ${imgClassName}`}
        style={{ backgroundImage: `url(${scenes})`, backgroundSize: '300% 200%', backgroundPosition: scenePosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/18 to-candle/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(244,196,106,0.25),transparent_34%)]" />
    </div>
  );
}
