/**
 * 메인페이지 문구 (기존 Features.tsx · Process.tsx 의 사이트 문구를 그대로 옮김, Q9).
 */
import type { ImageKey } from '@/app/constants/images';

export interface Feature {
  title: string;
  image: ImageKey;
}

/**
 * 4단계 사용자 요청: 설명 없이 이름만, 이 순서로 (PC 5열: 첫 줄 왼쪽→오른쪽, 둘째 줄 왼쪽→오른쪽).
 * 채팅형 DM·퍼블트 전용 타임라인·텍스트 꾸미기·글자수 1000자·예쁜 커스텀 테마는 새 아이콘, 나머지는 기존 아이콘 재사용
 * (답할 멘션만 모아보기 = 예전 '답글 수 표시' 아이콘). 아이콘 크기·여백은 이미지 단계에서 통일 (images-manifest fit 'icon').
 */
export const FEATURES: Feature[] = [
  { title: '트위터 기반 UI', image: 'homeFeature01' },
  { title: '완전 비공개 서버', image: 'homeFeature02' },
  { title: '다중계정 로그인 & 계정 전환', image: 'homeFeature03' },
  { title: '채팅형 DM', image: 'homeFeature04' },
  { title: '퍼블트 전용 타임라인', image: 'homeFeature05' },
  { title: '답할 멘션만 모아보기', image: 'homeFeature06' },
  { title: '텍스트 꾸미기', image: 'homeFeature07' },
  { title: '글자수 1000자', image: 'homeFeature08' },
  { title: '운영자용 DM 관리', image: 'homeFeature09' },
  { title: '예쁜 커스텀 테마', image: 'homeFeature10' },
];

export const SIMPLE_STEPS: Array<{ number: string; title: string; description: string; image: ImageKey }> = [
  { number: '01', title: '서비스 선택 & 견적 확인', description: '옵션을 견적에 담고 예상 금액을 확인하세요.', image: 'homeStep01' },
  { number: '02', title: '신청서 작성 후 크레페로 제출', description: '신청서를 작성한 뒤 복사한 내용을 크레페로 보내 주세요.', image: 'homeStep02' },
  { number: '03', title: '조율 & 견적서 확인', description: '마감일, 추가 요청사항을 조율하고 최종 견적서를 확인합니다.', image: 'homeStep03' },
  { number: '04', title: '결제 & 작업 진행', description: '마감이 가까워지면 결제를 요청드리고, 작업이 끝나면 전달드려요.', image: 'homeStep04' },
];
