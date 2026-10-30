/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeColor, ThemeConfig } from './types';

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  ocean: {
    id: 'ocean',
    name: 'Xanh Nước Biển Tươi Mát',
    badge: '🌊 Nước Trong Vắt',
    desc: 'Tông xanh biển ngọc, cảm giác nước chảy tươi mát, công nghệ hiện đại',
    primaryClass: 'text-cyan-400',
    gradientBg: 'from-sky-950 via-cyan-950 to-slate-950',
    cardBg: 'bg-cyan-950/40',
    borderClass: 'border-cyan-500/30',
    accentText: 'text-cyan-300',
    buttonGradient: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
  },
  mint: {
    id: 'mint',
    name: 'Xanh Bạc Hà / Sage Tươi Sáng',
    badge: '🍃 Bạc Hà Dịu Mắt',
    desc: 'Tông xanh bạc hà thanh khiết, gần gũi thiên nhiên, dịu nhẹ sương sớm',
    primaryClass: 'text-emerald-300',
    gradientBg: 'from-teal-950 via-emerald-950 to-slate-950',
    cardBg: 'bg-teal-950/40',
    borderClass: 'border-teal-500/30',
    accentText: 'text-teal-200',
    buttonGradient: 'bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600 hover:from-teal-400 hover:to-emerald-500',
  },
  forest: {
    id: 'forest',
    name: 'Xanh Rừng Nhiệt Đới',
    badge: '🌲 Lục Bảo Tự Nhiên',
    desc: 'Tông xanh lá lục bảo đậm chất cây cối sinh thái nông trại xanh',
    primaryClass: 'text-emerald-400',
    gradientBg: 'from-emerald-950 via-teal-950 to-slate-950',
    cardBg: 'bg-emerald-950/40',
    borderClass: 'border-emerald-600/30',
    accentText: 'text-emerald-300',
    buttonGradient: 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-500',
  },
  cyber: {
    id: 'cyber',
    name: 'Xanh Lam Công Nghệ IoT',
    badge: '💎 Lam Điện Tử',
    desc: 'Tông xanh dương neon hiện đại, chuyên nghiệp, hiển thị số liệu rõ nét',
    primaryClass: 'text-blue-400',
    gradientBg: 'from-blue-950 via-slate-950 to-slate-950',
    cardBg: 'bg-blue-950/40',
    borderClass: 'border-blue-500/30',
    accentText: 'text-blue-300',
    buttonGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-400 hover:to-indigo-400',
  },
};
