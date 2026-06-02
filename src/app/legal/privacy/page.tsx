import React from 'react'
import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-3xl font-bold mb-6">개인정보처리방침</h1>
      <div className="prose prose-slate">
        <p className="mb-4">본 웹사이트는 사용자의 개인정보를 소중하게 생각합니다.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. 수집하는 개인정보</h2>
        <p className="mb-4">XIV Frame은 회원가입을 요구하지 않으며, 서버에 이미지를 업로드하거나 저장하지 않습니다. 모든 이미지 처리 및 파일 다운로드는 사용자의 브라우저(클라이언트) 내부에서만 이루어집니다.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. 쿠키 및 분석 도구</h2>
        <p className="mb-4">서비스 개선을 위해 Google Analytics와 같은 웹 분석 도구 및 광고 게재를 위한 구글 애드센스(Google AdSense) 쿠키가 사용될 수 있습니다.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. 문의</h2>
        <p className="mb-4">관련 문의 사항은 서비스 제공자에게 문의해 주시기 바랍니다.</p>
      </div>
    </div>
  )
}
