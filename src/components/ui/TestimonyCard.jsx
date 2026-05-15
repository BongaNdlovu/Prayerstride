import { Heart, MessageCircle } from 'lucide-react';
import Card from './Card';

export default function TestimonyCard({ testimony, onPress }) {
  return (
    <Card onClick={onPress} className="p-4">
      <div className="text-xs text-slate-500">Praise Report - {testimony.time}</div>
      <h3 className="mt-1 font-serif text-xl text-slate-950">{testimony.title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-600 line-clamp-3">{testimony.text}</p>
      <div className="mt-3 flex items-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Heart size={14} /> {testimony.likes}</span>
        <span className="flex items-center gap-1"><MessageCircle size={14} /> {testimony.comments}</span>
      </div>
    </Card>
  );
}
