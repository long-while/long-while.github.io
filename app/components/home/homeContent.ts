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
  { number: '01', title: '서비스 선택 & 견적 확인', description: '원하는 옵션을 견적에 담고, 예상 금액을 미리 확인하세요.', image: 'homeStep01' },
  { number: '02', title: '신청서 작성 후 크레페로 제출', description: '온라인 신청서를 작성하고, 복사된 내용을 크레페로 보내주세요.', image: 'homeStep02' },
  { number: '03', title: '조율 & 견적서 확인', description: '마감일, 추가 요청사항을 조율하고 최종 견적서를 확인합니다.', image: 'homeStep03' },
  { number: '04', title: '결제 & 작업 진행', description: '작업 일자가 가까워지면 결제 요청을 보내드리고, 완료 후 전달드립니다.', image: 'homeStep04' },
];

export const DETAILED_STEPS: Array<{ number: string; title: string; details?: string[] }> = [
  {
    number: '01',
    title: '신청서 작성',
    details: [
      '테마 신청 시 필요한 이미지 소스 목록과 안내는 신청서 접수 후에 전달드립니다.',
      '이미지 소스는 서버 설치 마감일 1주~2주 전까지 전달해주시면 됩니다. 신청 시점에는 준비하지 않으셔도 됩니다.',
      '서버 설치 이후에도 테마 추가 가능합니다.',
    ],
  },
  {
    number: '02',
    title: '조율 진행',
    details: [
      '원하는 마감일, 견적, 주의사항을 확인 및 전달합니다.',
      '타입 외 기능 구현을 원하실 경우 가격과 구현 방식을 상담합니다.',
      '원하시는 추가 기능이 있다면 이때 꼭! 말씀해주셔야 합니다!',
    ],
  },
  { number: '03', title: '견적서 전달' },
  { number: '04', title: '작업 일자가 가까워지면 결제 요청' },
  { number: '05', title: '개발' },
  { number: '06', title: '자동봇 가동 테스트 (자동봇 신청 시)' },
  { number: '07', title: '크레페 내 작업 완료, 최종 작업물 전달' },
  { number: '08', title: '실 사용 기간 중 유지보수', details: ['신청·문의는 크레페 DM으로, 작업이 끝난 뒤 유지보수 소통은 따로 전달드리는 오픈채팅에서 진행합니다.'] },
];
