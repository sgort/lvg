// Which site and which build is being viewed, in the stand-in band.
import { getBuildInfo } from '../lib/buildInfo';
import { getSiteHost, getSiteUrl } from '../lib/siteInfo';
import styles from './StandInFrame.module.scss';

export function BuildLine() {
  const siteUrl = getSiteUrl();
  const build = getBuildInfo();
  return (
    <span className={styles.build}>
      <a href={siteUrl}>{getSiteHost(siteUrl)}</a>
      {' · '}
      {/* The full SHA is in the title, so it can be copied without cluttering the line. */}
      <span title={build.sha || undefined}>{build.label}</span>
    </span>
  );
}
