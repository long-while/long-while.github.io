/**
 * SiteFooter — 시안 '푸터' (1920×476, 검정 바탕, 위아래 패딩 120, file.json 실측).
 *  위: 왼쪽 로고(Inter 700 34/41 흰색) + 설명(body2 흰색 60%), 오른쪽 링크 묶음 3개(간격 60).
 *      묶음 제목 body3 흰색 60% → (20) → 링크 body3 흰색, 간격 12.
 *  (48) 아래: 저작권 body3 흰색 60% ↔ '크레페 DM 바로가기' 버튼(#111111, 64px, 패딩 20).
 * 문구와 링크는 기존 Footer 그대로 (Q9).
 */
import clsx from 'clsx';
import { Icon } from './Icon';
import type { ReactNode } from 'react';
import { navLinkProps } from '@/app/lib/navLink';
import type { FooterProps } from '@/app/types/navigation';
import { buttonClassName } from './Button';
import { focusRingInverse } from './shared';

const CREPE_ORDER_URL = 'https://crepe.cm/@longwhile/lw5w0ofg';
const CREPE_PROFILE_URL = 'https://crepe.cm/@longwhile';

const linkClass = clsx('inline-flex items-center gap-1 text-body3 text-text-inverse hover:underline underline-offset-2', focusRingInverse);

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-body3 text-text-inverse-muted">{title}</h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

interface SiteFooterProps extends FooterProps {
  /** 본문과 붙여 놓기 (시안 페이지는 본문 바로 아래 푸터). 기본은 위 여백 32px */
  flush?: boolean;
}

export function SiteFooter({ onNavigate, flush = false }: SiteFooterProps) {
  return (
    <footer className={clsx('bg-background-inverse py-[60px] text-text-inverse lg:py-[120px]', !flush && 'mt-8')}>
      <div className="container-ds flex flex-col gap-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-5">
            <a {...navLinkProps('home', onNavigate)} className={clsx('self-start font-inter text-logo-footer text-text-inverse', focusRingInverse)}>
              한참 커미션
            </a>
            <p className="text-body2 text-text-inverse-muted">
              마스토돈 자캐커뮤를 위한 코딩 커미션.<br />
              서버 설치부터 자동봇까지 한번에.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-[60px] gap-y-10 sm:flex sm:flex-wrap">
            <Column title="서비스">
              <li className="flex"><a {...navLinkProps('server', onNavigate)} className={linkClass}>서버 설치 커미션</a></li>
              <li className="flex"><a {...navLinkProps('bot', onNavigate)} className={linkClass}>자동봇 커미션</a></li>
            </Column>
            <Column title="고객 지원">
              <li className="flex"><a {...navLinkProps('faq', onNavigate)} className={linkClass}>자주 묻는 질문</a></li>
              <li className="flex"><a {...navLinkProps('terms', onNavigate)} className={linkClass}>이용안내</a></li>
              <li className="flex">
                <a href={CREPE_ORDER_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  크레페 <Icon name="external-link" className="inline" />
                </a>
              </li>
            </Column>
            <div className="col-span-2 flex flex-col gap-5">
              <h3 className="text-body3 text-text-inverse-muted">문의하기</h3>
              <div className="flex flex-col gap-1 text-body3">
                <p className="text-text-inverse">운영: 평일 10:00 - 22:00</p>
                <p className="text-text-inverse-muted">답변은 평일 기준 1~2일 내에 드립니다.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body3 text-text-inverse-muted">© {new Date().getFullYear()} 한참 커미션. All rights reserved.</p>
          <a
            href={CREPE_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(buttonClassName({ variant: 'dark', size: 'lg', onDark: true }), 'sm:w-[220px]')}
          >
            크레페 DM 바로가기 →
          </a>
        </div>
      </div>
    </footer>
  );
}
