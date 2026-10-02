/**
 * FAQ 검색 (기존 FAQ.tsx 와 같은 규칙): 질문·답변 문자열에 검색어가 들어 있으면 결과, 대소문자 무시.
 * 표시 순번은 분류 안에서의 순서(Q1.~)로 매기고, 검색 결과에서도 그 번호를 유지한다.
 */
import { FAQ_CATEGORIES, type FaqCategory, type FaqItem } from './faqContent';

export interface FaqEntry {
  item: FaqItem;
  /** 분류 안에서의 순번 (1부터) */
  number: number;
}

/** 분류 순서대로, 분류별 순번을 매긴 묶음 */
export function groupByCategory(items: FaqItem[]): { category: FaqCategory; entries: FaqEntry[] }[] {
  return FAQ_CATEGORIES.map((category) => ({
    category,
    entries: items.filter((item) => item.category === category).map((item, index) => ({ item, number: index + 1 })),
  }));
}

export function filterEntries(entries: FaqEntry[], query: string): FaqEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return entries;
  return entries.filter(({ item }) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q));
}

/** 정규식 메타문자가 섞인 검색어(예: "(")로도 하이라이트가 깨지지 않게 이스케이프한다 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 검색어와 일치하는 구간을 나눈다. match=true 인 조각을 강조한다 */
export function splitByQuery(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) return [{ text, match: false }];
  return text
    .split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
    .filter((part) => part !== '')
    .map((part) => ({ text: part, match: part.toLowerCase() === query.toLowerCase() }));
}
