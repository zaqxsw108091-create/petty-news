/**
 * Supabase 연결 정보.
 *
 * 이 프로젝트는 Metro/Hermes 기반이라 Vite의 import.meta.env나 process.env 인라인
 * 치환이 기본 지원되지 않는다. anon key는 공개 전제 키(RLS로 보호됨)라 소스에
 * 그대로 두어도 노출 문제가 되지 않으므로, 이 파일 한 곳에만 모아둔다.
 */
export const SUPABASE_URL = 'https://mjqcdstxibcjubsrbtow.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWNkc3R4aWJjanVic3JidG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1Njg0NTgsImV4cCI6MjEwMzE0NDQ1OH0.j7I3Vd0fNdTaIzp32eXdQmHctwN_ZsSviB5OOwykNu8';

/** 모든 Supabase fetch 공통 타임아웃. 이 시간을 넘기면 즉시 포기하고 조용히 실패한다 */
export const SUPABASE_FETCH_TIMEOUT_MS = 3000;
