// Icon registry for owner-defined profile links: the curated set of glyphs
// the site already speaks in (lucide), addressable by a short name in the
// links field syntax `Label [icon]: URL`. A link with no icon (or an unknown
// name) renders as a text chip instead; nothing is ever rejected.

import { type LucideIcon, AtSign, Award, BarChart3, BookOpen, Bot, Brain, Briefcase, Camera, Clapperboard, Codepen, Cpu, Database, Dribbble, Dumbbell, Facebook, FileText, Gamepad2, Github, Gitlab, Globe, GraduationCap, Heart, Instagram, Link2, Mail, MapPin, MessageCircle, Mic, Music, PenLine, Phone, Rss, Send, Sparkles, Twitch, Twitter, Youtube } from "lucide-react";

/** The glyphs a profile link may wear, keyed by the name a settings file stores. */
export const LINK_ICONS: Record<string, LucideIcon> = {
  at: AtSign,
  award: Award,
  book: BookOpen,
  bot: Bot,
  brain: Brain,
  briefcase: Briefcase,
  camera: Camera,
  chart: BarChart3,
  chip: Cpu,
  codepen: Codepen,
  database: Database,
  dribbble: Dribbble,
  dumbbell: Dumbbell,
  facebook: Facebook,
  file: FileText,
  film: Clapperboard,
  gamepad: Gamepad2,
  github: Github,
  gitlab: Gitlab,
  globe: Globe,
  heart: Heart,
  instagram: Instagram,
  link: Link2,
  mail: Mail,
  map: MapPin,
  message: MessageCircle,
  mic: Mic,
  music: Music,
  pen: PenLine,
  phone: Phone,
  rss: Rss,
  scholar: GraduationCap,
  send: Send,
  sparkles: Sparkles,
  twitch: Twitch,
  twitter: Twitter,
  youtube: Youtube,
};

/** Every icon name a link may name, for the editor's picker. */
export const LINK_ICON_NAMES = Object.keys(LINK_ICONS).sort();
