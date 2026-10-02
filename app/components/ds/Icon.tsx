/**
 * 시안 아이콘 (design/assets/icons/ 의 Figma SVG 를 옮김).
 * 한 가지 색으로 칠하는 아이콘은 currentColor 를 써서 글자색(text-*)으로 색을 바꾼다.
 * 여러 색이 정해진 아이콘(구글 로고, 알림 점)은 원래 색을 유지한다.
 */
import { useId, type SVGProps } from 'react';

export type IconName =
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'check'
  | 'close'
  | 'plus'
  | 'minus'
  | 'search'
  | 'calendar'
  | 'pencil'
  | 'trash'
  | 'bell'
  | 'info'
  | 'warning';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** px. 기본은 시안 크기 */
  size?: number;
  /** 의미가 있는 아이콘이면 읽어 줄 이름. 없으면 장식으로 숨긴다 */
  label?: string;
}

const DEFAULT_SIZE: Record<IconName, number> = {
  'chevron-down': 24,
  'chevron-up': 30,
  'chevron-right': 24,
  check: 24,
  close: 16,
  plus: 16,
  minus: 16,
  search: 20,
  calendar: 24,
  pencil: 28,
  trash: 28,
  bell: 20,
  info: 30,
  warning: 28,
};

const VIEWBOX: Record<IconName, string> = {
  'chevron-down': '0 0 24 24',
  'chevron-up': '0 0 30 30',
  'chevron-right': '0 0 24 24',
  check: '0 0 24 24',
  close: '0 0 16 16',
  plus: '0 0 16 16',
  minus: '0 0 16 16',
  search: '0 0 20 20',
  calendar: '0 0 24 24',
  pencil: '0 0 28 28',
  trash: '0 0 28 28',
  bell: '0 0 20 20',
  info: '0 0 30 30',
  warning: '0 0 28 25',
};

const stroke = { stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function paths(name: IconName) {
  switch (name) {
    case 'chevron-down':
      return <path d="M20 8L12 16L4 8" strokeWidth={2} {...stroke} />;
    case 'chevron-up':
      return <path d="M25 20L15 10L5 20" strokeWidth={2} {...stroke} />;
    case 'chevron-right':
      return <path d="M8 4L16 12L8 20" strokeWidth={2} {...stroke} />;
    case 'check':
      return <path d="M7.64 12L10.91 15.27L16.36 8.73" strokeWidth={2} {...stroke} />;
    case 'close':
      return (
        <>
          <path d="M13.33 2.67L2.67 13.33" strokeWidth={1.5} {...stroke} />
          <path d="M13.33 13.33L2.67 2.67" strokeWidth={1.5} {...stroke} />
        </>
      );
    case 'plus':
      return (
        <>
          <path d="M13.33 8H2.67" strokeWidth={1.5} {...stroke} />
          <path d="M8 2.67V13.33" strokeWidth={1.5} {...stroke} />
        </>
      );
    case 'minus':
      return <path d="M13.33 8H2.67" strokeWidth={1.5} {...stroke} />;
    case 'search':
      return (
        <>
          <circle cx="9" cy="9" r="6" strokeWidth={1.5} {...stroke} />
          <path d="M13.5 13.5L17 17" strokeWidth={1.5} {...stroke} />
        </>
      );
    default:
      return morePaths(name);
  }
}

function morePaths(name: IconName) {
  switch (name) {
    case 'calendar':
      return (
        <>
          <path d="M20 7H4V20H20V7Z" strokeWidth={1.5} {...stroke} />
          <path d="M20 7H4V12H20V7Z" strokeWidth={1.5} {...stroke} />
          <path d="M7 4V7M17 4V7" strokeWidth={1.5} {...stroke} />
        </>
      );
    case 'pencil':
      return (
        <>
          <path d="M5.83 18.67L4.67 23.33L9.33 22.17L23.33 8.17L19.83 4.67L5.83 18.67Z" strokeWidth={1.5} {...stroke} />
          <path d="M14 23.33H23.33" strokeWidth={1.5} {...stroke} />
        </>
      );
    case 'trash':
      return (
        <>
          <rect x="9.33" y="4.67" width="9.33" height="3.5" strokeWidth={1.5} {...stroke} />
          <rect x="7" y="8.17" width="14" height="15.17" strokeWidth={1.5} {...stroke} />
          <path d="M4.67 8.17H23.33M11.67 14V17.5M16.33 14V17.5" strokeWidth={1.5} {...stroke} />
        </>
      );
    case 'bell':
      return (
        <>
          <path d="M8.33 16.67H11.67M10 4.17V3.33" strokeWidth={1.25} {...stroke} />
          <path d="M15.83 14.17H4.17L5.83 12.5V8.33C5.83 5.92 7.5 4.17 10 4.17C12.5 4.17 14.17 5.92 14.17 8.33V12.5L15.83 14.17Z" strokeWidth={1.25} {...stroke} />
          <circle cx="13.75" cy="6.25" r="2.92" fill="var(--color-error-500)" stroke="var(--color-background-inverse-raised)" strokeWidth={1.25} />
        </>
      );
    case 'info':
      return (
        <>
          <circle cx="15" cy="15" r="11.25" fill="currentColor" />
          <circle cx="15" cy="20" r="1.25" fill="var(--color-background-white)" />
          <path d="M15 10V15" stroke="var(--color-background-white)" strokeWidth={1.25} strokeLinecap="round" />
        </>
      );
    case 'warning':
      return (
        <path
          fill="currentColor"
          d="M27.55 20.12L16.74 1.59C15.51 -0.53 12.49 -0.53 11.26 1.59L0.45 20.12C-0.81 22.28 0.72 25 3.19 25H24.81C27.28 25 28.81 22.28 27.55 20.12ZM13.98 20.79C13.22 20.79 12.61 20.16 12.61 19.4C12.61 18.63 13.22 18.01 13.98 18.01C14.74 18.01 15.35 18.63 15.35 19.4C15.35 20.16 14.74 20.79 13.98 20.79ZM15.54 9.67C15.34 11.73 15.15 13.79 14.95 15.85C14.89 16.34 14.48 16.71 14.01 16.73C13.51 16.74 13.07 16.37 12.99 15.85C12.82 13.81 12.65 11.76 12.47 9.72C12.34 8.7 13.08 7.85 13.9 7.8C14.76 7.74 15.63 8.59 15.54 9.67Z"
        />
      );
    default:
      return null;
  }
}

export function Icon({ name, size, label, className, ...rest }: IconProps) {
  const px = size ?? DEFAULT_SIZE[name];
  return (
    <svg
      width={px}
      height={name === 'warning' ? (px * 25) / 28 : px}
      viewBox={VIEWBOX[name]}
      fill="none"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {paths(name)}
    </svg>
  );
}

/** 구글 클라우드 로고 (Figma 원본 경로, 원래 4색 유지). 가격 카드에서 사용 */
export function GoogleLogo({ size = 55, className }: { size?: number; className?: string }) {
  const maskId = `google-logo-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="20 20 57 57" fill="none" className={className} aria-hidden="true" focusable="false">
      <mask id={maskId} style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="20" y="20" width="57" height="57">
        <path d="M75.6876 43.365H49.096V54.0202H64.3757C64.13 55.5282 63.5785 57.0116 62.7708 58.3643C61.8455 59.9141 60.7014 61.0939 59.5289 61.9925C56.0164 64.684 51.9214 65.2343 49.0775 65.2343C41.8933 65.2343 35.7549 60.5911 33.3786 54.2817C33.2827 54.0528 33.219 53.8163 33.1414 53.5825C32.6163 51.9767 32.3294 50.276 32.3294 48.5084C32.3294 46.6688 32.6401 44.9078 33.2066 43.2446C35.4411 36.6851 41.7179 31.7858 49.0826 31.7858C50.5639 31.7858 51.9904 31.9622 53.3432 32.3139C56.4348 33.1176 58.6217 34.7006 59.9617 35.9527L68.0471 28.0345C63.1288 23.5249 56.7172 20.7924 49.0692 20.7924C42.9551 20.7923 37.3103 22.6972 32.6845 25.9167C28.9332 28.5276 25.8566 32.0233 23.7802 36.0832C21.8489 39.8475 20.7914 44.019 20.7914 48.5042C20.7914 52.9896 21.8505 57.2046 23.7818 60.9341V60.9592C25.8218 64.9185 28.8049 68.3276 32.4305 70.9266C35.5978 73.197 41.2772 76.2208 49.0692 76.2208C53.5501 76.2208 57.5215 75.413 61.0238 73.8989C63.5504 72.8068 65.789 71.3822 67.8157 69.5514C70.4937 67.1322 72.591 64.14 74.0226 60.6974C75.4541 57.2547 76.2199 53.3617 76.2199 49.141C76.2199 47.1753 76.0224 45.1791 75.6876 43.3648V43.365Z" fill="white" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M20.4716 48.6246C20.501 53.0393 21.759 57.5941 23.6631 61.271V61.2963C25.0389 63.9666 26.9192 66.0759 29.0608 68.1659L41.9959 63.4462C39.5486 62.203 39.1752 61.4413 37.4209 60.0514C35.6282 58.2437 34.2921 56.1684 33.46 53.7351H33.4265L33.46 53.7098C32.9126 52.1029 32.8586 50.3973 32.8384 48.6246H20.4716Z" fill="#34A853" />
        <path d="M49.184 20.5231C47.9055 25.0146 48.3943 29.3805 49.184 31.9208C50.6604 31.9219 52.0826 32.0979 53.4311 32.4485C56.5227 33.2522 58.7094 34.8353 60.0493 36.0874L68.3418 27.9669C63.4293 23.4627 57.5174 20.5302 49.184 20.5231Z" fill="#EA4335" />
        <path d="M49.1565 20.4876C42.8854 20.4874 37.0957 22.4413 32.3513 25.7434C30.5896 26.9695 28.973 28.3859 27.5335 29.9609C27.1564 33.4987 30.3565 37.8471 36.6937 37.8111C39.7684 34.2345 44.3159 31.9204 49.3772 31.9204C49.3819 31.9204 49.3863 31.9208 49.391 31.9208L49.1843 20.4884C49.1749 20.4884 49.1659 20.4876 49.1565 20.4876Z" fill="#EA4335" />
        <path d="M69.8544 49.905L64.257 53.7503C64.0114 55.2583 63.4595 56.7417 62.6518 58.0944C61.7265 59.6441 60.5825 60.8241 59.41 61.7226C55.9048 64.4085 51.8206 64.9616 48.9774 64.9638C46.0387 69.969 45.5235 72.4761 49.1841 76.5157C53.7138 76.5124 57.7295 75.6947 61.2716 74.1635C63.8321 73.0567 66.1006 71.613 68.1545 69.7576C70.8685 67.306 72.9943 64.2735 74.445 60.7847C75.8958 57.2958 76.6715 53.3508 76.6715 49.0734L69.8544 49.905Z" fill="#4285F4" />
        <path d="M48.7706 42.8925V54.3574H75.7008C75.9377 52.7873 76.721 50.7554 76.721 49.0734C76.721 47.1078 76.5237 44.7068 76.1889 42.8925H48.7706Z" fill="#4285F4" />
        <path d="M27.6618 29.5562C25.9999 31.3745 24.5802 33.4097 23.4545 35.6108C21.5232 39.3751 20.4658 43.9514 20.4658 48.4366C20.4658 48.4999 20.471 48.5617 20.4714 48.6248C21.3267 50.2647 32.2858 49.9507 32.8382 48.6248C32.8375 48.5629 32.8306 48.5026 32.8306 48.4406C32.8306 46.601 33.1413 45.245 33.7078 43.5819C34.4067 41.5304 35.5009 39.6412 36.9002 38.0136C37.2174 37.6086 38.0634 36.7381 38.3103 36.2159C38.4043 36.017 38.1396 35.9054 38.1248 35.8353C38.1082 35.757 37.7533 35.82 37.6737 35.7617C37.4213 35.5765 36.9213 35.4798 36.6177 35.3938C35.9688 35.2101 34.8933 34.8049 34.296 34.3849C32.4079 33.0572 29.4613 31.4712 27.6618 29.5562Z" fill="#FBBC04" />
        <path d="M36.1184 62.635C30.2409 64.7568 29.3208 64.833 28.7798 68.4754C29.8136 69.4843 30.9244 70.4175 32.1049 71.2636C35.2722 73.5341 41.3649 76.5579 49.1568 76.5579C49.166 76.5579 49.1747 76.5571 49.1839 76.5571V64.7614C49.178 64.7614 49.1712 64.7618 49.1653 64.7618C46.2475 64.7618 43.9159 63.9954 41.5252 62.6627C40.9358 62.3341 39.8664 63.2164 39.3228 62.822C38.573 62.278 36.7687 63.2907 36.1184 62.635Z" fill="#34A853" />
      </g>
    </svg>
  );
}
