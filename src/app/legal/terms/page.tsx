import React from 'react'
import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-3xl font-bold mb-6">이용약관</h1>
      <div className="prose prose-slate">
        <h2 className="text-xl font-semibold mt-6 mb-3">1. 서비스의 목적</h2>
        <p className="mb-4">XIV Frame은 파이널판타지14 스크린샷 프레임 꾸미기를 목적으로 제공되는 무료 웹 서비스입니다.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. 저작권 및 책임</h2>
        <p className="mb-4">본 서비스를 통해 제작된 이미지의 원 저작권은 파이널판타지14를 서비스하는 SQUARE ENIX 및 엑토즈 소프트에 귀속됩니다. 사용자가 업로드하는 이미지의 내용과 관련하여 발생하는 법적 책임은 사용자 본인에게 있습니다.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. 서비스 변경 및 중단</h2>
        <p className="mb-4">서비스 제공자는 사전 통지 없이 서비스의 내용을 변경하거나 중단할 수 있습니다.</p>
      </div>
    </div>
  )
}
