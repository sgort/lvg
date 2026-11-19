// A link whose target the page has already resolved: a route, an external site, or a plain
// address such as a download. Components never work out targets themselves.
import { LuxLink } from '@lux-design-system/components-react';
import type { ReactNode } from 'react';

import { Extern } from './icons';
import { LinkNaar } from './LinkNaar';

export type Doel = { naar: string } | { extern: string } | { href: string };

type Props = { doel: Doel; children: ReactNode; icon?: ReactNode };

export function Koppeling({ doel, children, icon }: Props) {
  if ('naar' in doel) {
    return (
      <LinkNaar naar={doel.naar} icon={icon ? <>{icon}</> : undefined}>
        {children}
      </LinkNaar>
    );
  }
  if ('extern' in doel) {
    return (
      <LuxLink href={doel.extern} external icon={<Extern />} iconPosition="start">
        {children}
      </LuxLink>
    );
  }
  return (
    <LuxLink href={doel.href} icon={icon ? <>{icon}</> : undefined} iconPosition="start">
      {children}
    </LuxLink>
  );
}
