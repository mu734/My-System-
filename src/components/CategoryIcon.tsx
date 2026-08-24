import React from 'react';
import {
  Coffee,
  CupSoda,
  Sparkles,
  Flame,
  Leaf,
  GlassWater,
  Soup,
  UtensilsCrossed,
  Sandwich,
  Egg,
  Salad as SaladIcon,
  ShoppingBag,
  CircleDot,
  Pizza,
  Zap,
  Wifi,
  Laptop,
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = '', size = 18 }) => {
  const cat = category.toLowerCase();

  if (cat.includes('wifi') || cat.includes('wi-fi')) {
    return <Wifi size={size} className={className} />;
  }
  if (cat.includes('coworking') || cat.includes('table') || cat.includes('desk')) {
    return <Laptop size={size} className={className} />;
  }
  if (cat.includes('hot drink') || cat.includes('more hot')) {
    return <Coffee size={size} className={className} />;
  }
  if (cat.includes('iced coffee')) {
    return <CupSoda size={size} className={className} />;
  }
  if (cat.includes('matcha')) {
    return <Leaf size={size} className={className} />;
  }
  if (cat.includes('kombucha') || cat.includes('kefir')) {
    return <Sparkles size={size} className={className} />;
  }
  if (cat.includes('juice') || cat.includes('smoothie')) {
    return <GlassWater size={size} className={className} />;
  }
  if (cat.includes('soda') || cat.includes('soft drink')) {
    return <CupSoda size={size} className={className} />;
  }
  if (cat.includes('omelette') || cat.includes('egg') || cat.includes('benedict')) {
    return <Egg size={size} className={className} />;
  }
  if (cat.includes('bowl') || cat.includes('plate')) {
    return <Soup size={size} className={className} />;
  }
  if (cat.includes('toast')) {
    return <Sandwich size={size} className={className} />;
  }
  if (cat.includes('burger')) {
    return <UtensilsCrossed size={size} className={className} />;
  }
  if (cat.includes('fajita')) {
    return <Flame size={size} className={className} />;
  }
  if (cat.includes('salad')) {
    return <SaladIcon size={size} className={className} />;
  }
  if (cat.includes('taco') || cat.includes('quesadilla') || cat.includes('appetizer') || cat.includes('nacho')) {
    return <Pizza size={size} className={className} />;
  }
  if (cat.includes('coworking')) {
    return <Zap size={size} className={className} />;
  }

  return <CircleDot size={size} className={className} />;
};
