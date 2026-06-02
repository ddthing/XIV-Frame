import React from 'react'
import { SignaturePosition, SignatureAlign } from '@/store/useStore'

export const FONT_MAP: Record<string, string> = {
  'Pretendard': '기본 (Pretendard)',
  'NexonMaplestory': '넥슨 메이플스토리',
  'TMoneyDungunbaram': '티머니 둥근바람',
  'OgRenaissanceSecret': 'OG 르네상스 비밀',
  'Shouting': '샤우팅체',
  'BookkMyungjo': '부크크 명조',
  'x12y12pxMaruMinyaHangul': '마루미냐 한글',
  'LotteriaChwapttaenggyeo': '롯데리아 촵땡겨체',
  'HsBombaram30': '봄바람체 3.0',
  'GoodNeighbor': '좋은이웃체',
  'SlowGothic': '느림보고딕',
}

export const POSITION_OPTIONS: { value: SignaturePosition; label: string; icon: React.ReactNode }[] = [
  { value: 'top-left', label: '좌상단', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 4h5M4 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="4" y="4" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'top-center', label: '중앙상단', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M7.5 4h5M10 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="7.5" y="4" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'top-right', label: '우상단', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M16 4h-5M16 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="11" y="4" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'bottom-left', label: '좌하단', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 16h5M4 16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="4" y="11" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'bottom-center', label: '중앙하단', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M7.5 16h5M10 16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="7.5" y="11" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
  { value: 'bottom-right', label: '우하단', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M16 16h-5M16 16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="11" y="11" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
    </svg>
  )},
]

export const LOGO_POSITION_OPTIONS: { value: SignaturePosition; label: string; icon: React.ReactNode }[] = [
  ...POSITION_OPTIONS,
  { value: 'center', label: '정중앙', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="currentColor" opacity="0.15"/>
      <path d="M10 4v3M10 13v3M4 10h3M13 10h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
]

export const ALIGN_OPTIONS: { value: SignatureAlign; label: string; icon: React.ReactNode }[] = [
  { value: 'left', label: '왼쪽 정렬', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M3 5h14M3 9h8M3 13h11M3 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
  { value: 'center', label: '가운데 정렬', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M3 5h14M5 9h10M4 13h12M6 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
  { value: 'right', label: '오른쪽 정렬', icon: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M3 5h14M9 9h8M6 13h11M11 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
]

// Canvas Magic Numbers
export const SIGNATURE_PADDING = 60
export const SIGNATURE_GAP = 8
