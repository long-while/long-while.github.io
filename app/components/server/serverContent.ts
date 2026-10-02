/**
 * 서버 커미션 옵션 (기존 ServerCommission.tsx 의 이름·가격·설명 그대로, Q9).
 * name/estimateName 은 견적함 항목 이름이라 바꾸면 안 된다 (견적함·신청서 매핑에 쓰임).
 */
export const SEARCH_ITEM_NAME = '검색 기능';

export const INSTALL = {
  name: '마스토돈 서버 설치',
  price: 20000,
  description: '자캐 커뮤에 특화된 한참 인스턴스를 설치합니다.',
};

export const THEME_OPTIONS = [
  { name: '테마 전체 커스텀', price: 30000, description: '낮/밤 2종의 전반적인 색상테마+로고+배경 변경. 로고, 배경 PNG 필요.' },
  { name: '테마 1종 커스텀', price: 20000, description: '낮/밤 택 1종의 전반적인 색상테마+로고+배경 변경.' },
  { name: '로고만 변경', price: 5000, description: '트위터 테마에 로고만 바꾸는 옵션. 로고 PNG 파일 필요. 규격은 신청 후 안내드립니다.' },
];

export const ADDITIONAL_OPTIONS = [
  { name: '툿 글자수 제한 변경', price: 5000, description: '기본 공백포함 1000자.' },
  { name: SEARCH_ITEM_NAME, price: 15000, description: '단어 단위 검색. 팔로우 중인 유저의 툿+멘션에서 찾아 결과를 반환합니다.' },
  { name: 'masto.host 에서 서버 데이터 이전', price: 20000, description: '팔로우 관계, 텍스트 데이터, 이미지 등 모든 정보를 기존 서버에서 새로운 서버로 옮겨드립니다.' },
];

export const RUSH_OPTIONS = [
  { estimateName: '빠른마감: 48시간 내 기본 서버 설치', displayName: '48시간 내 기본 서버 설치 마감', price: 5000, description: '결제 요청 시각으로부터 48시간 내에 기본 옵션 서버를 설치합니다.' },
  { estimateName: '빠른마감: 24시간 내 기본 서버 설치', displayName: '24시간 내 기본 서버 설치 마감', price: 10000, description: '결제 요청 시각으로부터 24시간 내에 기본 옵션 서버를 설치합니다.' },
  { estimateName: '빠른마감: 48시간 내 로고 변경 서버 설치', displayName: '48시간 내 로고 변경된 서버 설치 마감', price: 15000, description: '결제 요청 시각으로부터 48시간 내에 로고 변경 옵션 서버를 설치합니다.' },
  { estimateName: '빠른마감: 48시간 내 테마 커스텀 서버 설치', displayName: '48시간 내 테마 커스텀된 서버 설치 마감', price: 20000, description: '결제 요청 시각으로부터 48시간 내에 커스텀 테마 옵션 서버를 설치합니다.' },
];
