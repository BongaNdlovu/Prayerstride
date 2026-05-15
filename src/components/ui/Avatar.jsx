export default function Avatar({ color, size = 44, name }) {
  const initial = name ? name.charAt(0).toUpperCase() : '';
  return (
    <div
      className="flex items-center justify-center rounded-full font-serif text-navy"
      style={{ width: size, height: size, backgroundColor: color || '#ded3c4', fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
