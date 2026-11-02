import {
  Baby,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CircleDollarSign,
  Coffee,
  Dumbbell,
  Film,
  Fuel,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sofa,
  Stethoscope,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { type CategoryIcon, categoryColorVar } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const CATEGORY_ICONS: Record<CategoryIcon, LucideIcon> = {
  house: House,
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  coffee: Coffee,
  car: Car,
  bus: Bus,
  fuel: Fuel,
  plane: Plane,
  zap: Zap,
  wifi: Wifi,
  smartphone: Smartphone,
  repeat: Repeat,
  "heart-pulse": HeartPulse,
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  "shopping-bag": ShoppingBag,
  shirt: Shirt,
  sofa: Sofa,
  film: Film,
  music: Music,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  baby: Baby,
  "paw-print": PawPrint,
  gift: Gift,
  receipt: Receipt,
  landmark: Landmark,
  briefcase: Briefcase,
  laptop: Laptop,
  "trending-up": TrendingUp,
  "piggy-bank": PiggyBank,
  wallet: Wallet,
  "circle-dollar-sign": CircleDollarSign,
  tag: Tag,
};

/** The category's icon on a tinted tile of its color. Name text always sits beside it. */
export function CategoryIconBadge({
  icon,
  color,
  className,
}: {
  icon: string;
  color: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[icon as CategoryIcon] ?? Tag;
  return (
    <span
      className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", className)}
      style={{
        color: categoryColorVar(color),
        backgroundColor: `color-mix(in oklab, ${categoryColorVar(color)} 14%, transparent)`,
      }}
      aria-hidden
    >
      <Icon className="size-4" />
    </span>
  );
}
