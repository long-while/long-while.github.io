/**
 * 메인페이지 문구 (기존 Features.tsx · Process.tsx 의 사이트 문구를 그대로 옮김, Q9).
 */
import type { ImageKey } from '@/app/constants/images';

export interface Feature {
  title: string;
  description: string;
  image: ImageKey;
}

/** 시안 순서와 같은 순서로 아이콘을 짝지음 (homeFeature01~10) */
export const FEATURES: Feature[] = [
  { title: '다중계정 로그인 & 계정 전환', description: '웹 마스토돈에서도 웹트처럼 여러 계정 간 원활한 전환 가능! 총괄계에서 NPC 계정으로의 빠른 전환을 지원합니다.', image: 'homeFeature01' },
  { title: '익숙한 UI', description: '트위터 기반 인터페이스로 마스토돈이 처음인 러너도 편히 사용 가능', image: 'homeFeature02' },
  { title: '비공개 서버', description: '로그인하지 않은 사용자 / 서버에 가입하지 않은 사용자에게 툿이 노출되지 않음', image: 'homeFeature03' },
  { title: 'DM 관리기능', description: '운영계가 서버 내 모든 DM을 하나의 페이지에서 확인 가능 (계정 DM창과 별개 페이지)', image: 'homeFeature04' },
  { title: '깔끔한 폰트', description: '코펍돋움 ttf 적용으로 PC 웹에서도 눈이 피로하지 않은 답멘', image: 'homeFeature05' },
  { title: '바이오 표시', description: '팔로잉/팔로워 목록에서 바이오 확인 가능', image: 'homeFeature06' },
  { title: '마크다운 기능', description: '별표와 물결표를 이용한 기울임꼴, 볼드, 취소선 적용', image: 'homeFeature07' },
  { title: '알림창 분리', description: '알림창이 모든 알림/멘션/DM 3가지 탭으로 구성됨', image: 'homeFeature08' },
  { title: 'DM과 팔로워 공개 툿에도 답글 수 표시', description: '모든 유형의 툿에서 답글 수를 확인할 수 있습니다', image: 'homeFeature09' },
  { title: '스크롤 오류 수정', description: '답멘을 위해 타래의 최하단 멘션 선택 시 스크롤이 맨 위로 올라가는 오류 해결', image: 'homeFeature10' },
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
      '이미지 소스는 서버 설치 마감일 1주~2주 전까지 전달해주시면 됩니다. 신청 시점에 준비할 필요 X',
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
  { number: '06', title: '자동봇 가동 테스트' },
  { number: '07', title: '크레페 내 작업 완료, 최종 작업물 전달' },
  { number: '08', title: '실 사용 기간 중 유지보수', details: ['이 시기의 소통은 오픈채팅으로 진행합니다.'] },
];
