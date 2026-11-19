// A link whose target the page has already resolved: a route, an external site, or a plain
// address such as a download. Components never work out targets themselves. With `pijl` it is
// the design's bold "Bekijk … ›" link: the chevron after the text.
import { LuxLink } from '@lux-design-system/components-react';
import type { ReactNode } from 'react';

import { ChevronRechts, Extern } from './icons';
import styles from './Koppeling.module.scss';
import { LinkNaar } from './LinkNaar';

export type Doel = { naar: string } | { extern: string } | { href: string };

type Props = { doel: Doel; children: ReactNode; icon?: ReactNode; pijl?: boolean };

export function Koppeling({ doel, children, icon, pijl = false }: Props) {
  const opmaak = pijl
    ? { icon: <ChevronRechts />, iconPosition: 'end' as const, className: styles.pijl }
    : { icon: icon ? <>{icon}</> : undefined, iconPosition: 'start' as const };

  if ('naar' in doel) {
    return (
      <LinkNaar naar={doel.naar} {...opmaak}>
        {children}
      </LinkNaar>
    );
  }
  if ('extern' in doel) {
    return (
      <LuxLink href={doel.extern} external {...opmaak} icon={pijl ? opmaak.icon : <Extern />}>
        {children}
      </LuxLink>
    );
  }
  return (
    <LuxLink href={doel.href} {...opmaak}>
      {children}
    </LuxLink>
  );
}
