export default function PrivacyPage() {
  return (
    <article className="prose prose-invert mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-violet-100">개인정보 처리방침</h1>
      <p className="mt-4 text-violet-300">
        네이버 로그인 시 제공되는 식별자, 닉네임, 프로필 이미지 URL을 서비스 제공
        목적으로 저장합니다.
      </p>
      <h2 className="mt-6 text-lg font-semibold text-violet-100">수집 항목</h2>
      <ul className="list-disc pl-6 text-violet-300">
        <li>네이버 ID (naverId)</li>
        <li>닉네임</li>
        <li>프로필 이미지 URL</li>
      </ul>
      <h2 className="mt-6 text-lg font-semibold text-violet-100">보관·삭제</h2>
      <p className="text-violet-300">
        서비스 운영 기간 동안 보관하며, 문의를 통해 삭제를 요청할 수 있습니다.
      </p>
    </article>
  );
}
