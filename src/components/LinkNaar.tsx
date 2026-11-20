// A LUX link to a route: LUX styling, router navigation without a page load.
import { LuxLink, type LuxLinkProps } from '@lux-design-system/components-react';
import { useHref, useLinkClickHandler } from 'react-router';

type Props = Omit<LuxLinkProps, 'href' | 'onClick'> & { naar: string };

export function LinkNaar({ naar, ...props }: Props) {
  const href = useHref(naar);
  const onClick = useLinkClickHandler<HTMLAnchorElement>(naar);
  return <LuxLink {...props} href={href} onClick={onClick} />;
}
