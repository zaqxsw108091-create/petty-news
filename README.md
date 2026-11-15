# 하찮은 속보

앱인토스 바이브코딩 챌린지(2026.08) 출품작입니다.

세상을 바꾸는 일만 뉴스가 아닙니다.
오늘 당신이 해낸 일도 소식입니다.

## 코드 사용 안내
이 저장소는 피드백을 받기 위해 공개했습니다.
코드 복제·재배포·재출품은 금지합니다. 자세한 내용은 LICENSE 파일을 참고해주세요.

## 미니앱 사용해보기
토스 앱에서 '하찮은 속보' 검색

## 기술 스택

- **앱인토스 WebView 미니앱 (SDK 3.x)** (`@apps-in-toss/web-framework`), Vite · React 18 · TypeScript
  - 2026.11 SDK 2.x 종료 공지에 따라 React Native(Granite)에서 WebView로 전환했습니다
- **화면**: 홈(뉴스룸), 속보 상세, 보관함, 제보 (`src/pages/` 4개)
- **로컬 저장**: 보관함 최대 100건 (기기 내 저장)
- **서버**: Supabase REST — 카테고리별 집계용 `reports` 테이블. 앱에는 공개용 `anon` 키만 들어 있고, 접근 제한은 Supabase의 RLS 정책에 의존합니다.
- **개발/빌드**: `npm run dev`(로컬 브라우저 + devtools), `npm run build`(`pettynews.ait` 생성), `npm run typecheck`, `npm run lint`
- **Supabase 유지**: 무료 프로젝트 자동 중지를 막기 위해 `.github/workflows/supabase-keepalive.yml`이 3일마다 조회합니다

## 문서

- `SPEC.md` — 개발 시작 시점의 개발 명세(설계 문서). 최종 구현과 다를 수 있습니다.

