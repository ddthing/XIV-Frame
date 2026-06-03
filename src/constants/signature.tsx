import React from 'react'
import { SignaturePosition, SignatureAlign } from '@/store/useStore'

export const FONT_MAP: Record<string, string> = {
  'Pretendard': 'fontDefault',
  'NexonMaplestory': 'fontMaplestory',
  'TMoneyDungunbaram': 'fontTmoney',
  'OgRenaissanceSecret': 'fontOg',
  'Shouting': 'fontShouting',
  'BookkMyungjo': 'fontBookk',
  'x12y12pxMaruMinyaHangul': 'fontMaru',
  'LotteriaChwapttaenggyeo': 'fontLotteria',
  'HsBombaram30': 'fontBombaram',
  'GoodNeighbor': 'fontGoodNeighbor',
  'SlowGothic': 'fontSlowGothic',
}

export const POSITION_OPTIONS: { value: SignaturePosition; label: string; icon: React.ReactNode }[] = [
  { value: 'top-left', label: 'posTopLeft', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 4h5M4 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="4" y="4" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'top-center', label: 'posTopCenter', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M7.5 4h5M10 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="7.5" y="4" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'top-right', label: 'posTopRight', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M16 4h-5M16 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="11" y="4" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'bottom-left', label: 'posBottomLeft', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 16h5M4 16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="4" y="11" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'bottom-center', label: 'posBottomCenter', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M7.5 16h5M10 16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="7.5" y="11" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'bottom-right', label: 'posBottomRight', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M16 16h-5M16 16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="11" y="11" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
]

export const LOGO_POSITION_OPTIONS: { value: SignaturePosition; label: string; icon: React.ReactNode }[] = [
  ...POSITION_OPTIONS,
  { value: 'center', label: 'posCenter', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M7.5 10h5M10 7.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
]

export const ALIGN_OPTIONS: { value: SignatureAlign; label: string; icon: React.ReactNode }[] = [
  { value: 'left', label: 'alignLeft', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 6h12M4 10h8M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  { value: 'center', label: 'alignCenter', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 6h12M6 10h8M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  { value: 'right', label: 'alignRight', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 6h12M8 10h8M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
]

// Canvas Magic Numbers
export const SIGNATURE_PADDING = 60
export const SIGNATURE_GAP = 8
