import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ZenMode OS Changelog',
  tagline: 'Every ZenMode OS release, in plain words',
  favicon: 'img/zenmode-os-favicon.png',

  future: {v4: true},

  url: 'https://kamal007olica.github.io',
  baseUrl: '/zenmode-changelog/',

  organizationName: 'Kamal007OLica',
  projectName: 'zenmode-changelog',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {defaultLocale: 'en', locales: ['en']},

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: 'ZenMode OS',
      logo: {alt: 'ZenMode OS logo', src: 'img/zenmode-os-logo.svg'},
      items: [
        {to: '/', label: 'Changelog', position: 'left'},
        {
          href: 'https://github.com/ThammanaSrinivas/zenmode',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
