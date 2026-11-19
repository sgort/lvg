import { getBuildInfo } from '../lib/buildInfo';
import { getSiteHost, getSiteUrl } from '../lib/siteInfo';

// One recessive line that says which site and which build is being viewed.
const Footer = () => {
  const siteUrl = getSiteUrl();
  const buildInfo = getBuildInfo();

  return (
    <footer className="mt-6 border-t border-gray-200 pt-4 text-right font-mono text-xs text-gray-500">
      <a href={siteUrl} className="underline hover:text-gray-700">
        {getSiteHost(siteUrl)}
      </a>
      {' · '}
      {/* The full SHA is on the title, so it can be copied without cluttering the line. */}
      <span title={buildInfo.sha || undefined}>{buildInfo.label}</span>
    </footer>
  );
};

export default Footer;
