import {useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject} from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Icon from '@site/src/components/Icon';
import ZenTile from '@site/src/components/ZenTile';
import {usePrefersReducedMotion} from '@site/src/hooks/usePrefersReducedMotion';
import {useScrollSpy} from '@site/src/hooks/useScrollSpy';
import data from '@site/src/data/changelog.json';

import styles from './styles.module.css';

type StageItem = {
  src: string;
  w: number;
  h: number;
  label?: string;
  dot?: 'zen' | 'amber' | 'ember';
  video?: {mp4: string; webm?: string};
};

type StageMedia = {
  type: 'stage';
  layout: 'trio' | 'duo' | 'fan' | 'wide' | 'cover' | 'spotlight';
  tone: 'ink' | 'wash' | 'zen' | 'ember' | 'dawn' | 'gold';
  alt: string;
  items: StageItem[];
  callouts?: {text: string; pos: 'tl' | 'tr' | 'bl' | 'br'}[];
};
type YouTubeMedia = {type: 'youtube'; id: string; poster: string; alt: string; label: string};
type Media = StageMedia | YouTubeMedia;

type Release = {
  id: string;
  version: string;
  date: string;
  icon: string;
  sidebarLabel: string;
  title: string;
  intro: string;
  heroMedia: Media | null;
  features: {title: string; body: string; media?: Media}[];
  improvements: string[];
  fixes: string[];
  signoff: string;
  todos?: string[];
};

const releases = data.releases as Release[];
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.zenlauncher.zenmode';
const STORY_URL = 'https://zenmodeos.com/story/index.html';
const latest = releases[0];
const first = releases[releases.length - 1];

const TITLE = 'Changelog | ZenMode OS';
const DESCRIPTION =
  "Every ZenMode OS release, in plain words: what's new in the intentional launcher for Android.";

// Calendar days: format in UTC so they never slip a day.
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const shortDate = (iso: string) =>
  asDate(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'}).toUpperCase();
const longDate = (iso: string) =>
  asDate(iso).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'});

/* ------------------------------------------------------------------ hooks */

/** Flags an element once it first comes into view, so its stage can settle in. */
function useSeen<T extends Element>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      {rootMargin: '0px 0px -12% 0px'},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, seen];
}

/* ----------------------------------------------------------------- stages */

function StageVideo({video, poster}: {video: NonNullable<StageItem['video']>; poster: string}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const mp4 = useBaseUrl(video.mp4);
  const webm = useBaseUrl(video.webm ?? '');
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.preload = 'auto';
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      {threshold: 0.3},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);
  return (
    <video ref={ref} muted loop playsInline preload="none" poster={poster} aria-hidden="true">
      {video.webm && <source src={webm} type="video/webm" />}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

function StagePiece({item, index, count}: {item: StageItem; index: number; count: number}) {
  const src = useBaseUrl(item.src);
  // Offset from the middle of the set: fans spread and stack around it.
  const offset = index - (count - 1) / 2;
  const style = {
    '--i': index,
    '--o': offset,
    '--zf': 10 - Math.ceil(Math.abs(offset)),
    '--ar': `${item.w} / ${item.h}`,
    '--arn': item.w / item.h,
  } as CSSProperties;
  return (
    <div className={styles.piece} style={style}>
      <div className={styles.screen}>
        {item.video ? (
          <StageVideo video={item.video} poster={src} />
        ) : (
          <img src={src} alt="" width={item.w} height={item.h} loading="lazy" decoding="async" />
        )}
      </div>
      {item.label && (
        <span className={styles.pieceLabel}>
          {item.dot && <span className={clsx(styles.labelDot, styles[`dot-${item.dot}`])} />}
          {item.label}
        </span>
      )}
    </div>
  );
}

function Stage({media, hero}: {media: StageMedia; hero?: boolean}) {
  const [ref, seen] = useSeen<HTMLElement>();
  return (
    <figure
      ref={ref}
      role="img"
      aria-label={media.alt}
      className={clsx(
        styles.stage,
        styles[`tone-${media.tone}`],
        styles[`layout-${media.layout}`],
        hero && styles.stageHero,
      )}
      data-seen={seen || undefined}
      style={{'--n': media.items.length, '--car': `${media.items[0].w} / ${media.items[0].h}`} as CSSProperties}>
      <div className={styles.stageGlow} aria-hidden="true" />
      <div className={styles.stageSet}>
        {media.items.map((item, i) => (
          <StagePiece key={item.src} item={item} index={i} count={media.items.length} />
        ))}
      </div>
      {media.callouts?.map((c) => (
        <span key={c.text} className={clsx(styles.callout, styles[`at-${c.pos}`])} aria-hidden="true">
          <span className={styles.calloutDot} />
          {c.text}
        </span>
      ))}
    </figure>
  );
}

/** Click-to-load YouTube: nothing from YouTube loads until someone asks for it. */
function YouTubeStage({media}: {media: YouTubeMedia}) {
  const [playing, setPlaying] = useState(false);
  const poster = useBaseUrl(media.poster);
  return (
    <figure className={clsx(styles.stage, styles.stageHero, styles.stageVideo)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&rel=0`}
          title={media.alt}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className={styles.videoButton} onClick={() => setPlaying(true)}>
          <img src={poster} alt="" loading="lazy" decoding="async" />
          <span className={styles.playPill}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
            </svg>
            {media.label}
          </span>
          <span className={styles.srOnly}>: {media.alt}</span>
        </button>
      )}
    </figure>
  );
}

function MediaBlock({media, hero}: {media: Media; hero?: boolean}) {
  return media.type === 'youtube' ? <YouTubeStage media={media} /> : <Stage media={media} hero={hero} />;
}

/* --------------------------------------------------------------- timeline */

// Staggered pill drops under the ruler, like notes on a stave.
const DROPS = [0, 30, 10, 38, 18, 4, 34, 14, 26];

// Platforms on their way: dashed "SOON" columns ahead of the newest release on the ruler.
// `label` sits on the ruler; `short` joins the others on the header's single coming-soon badge.
const UPCOMING: {label: string; short: string; drop: number; glyph: ReactNode}[] = [
  {
    label: 'iOS',
    short: 'iOS',
    drop: 22,
    glyph: (
      <>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
        <path d="M10.5 18.5h3" />
      </>
    ),
  },
  {
    label: 'Win · Mac · Linux',
    short: 'Desktop',
    drop: 6,
    glyph: (
      <>
        <rect x="2.5" y="4" width="19" height="13" rx="2" />
        <path d="M9 21h6M12 17v4" />
      </>
    ),
  },
  {
    label: 'Browser extension',
    short: 'Extension',
    drop: 30,
    glyph: (
      <>
        <circle cx="12" cy="12" r="9.5" />
        <path d="M2.5 12h19M12 2.5c2.6 2.6 4 6 4 9.5s-1.4 6.9-4 9.5c-2.6-2.6-4-6-4-9.5s1.4-6.9 4-9.5z" />
      </>
    ),
  },
];


function Timeline({active}: {active: string}) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [edges, setEdges] = useState({start: true, end: true});

  // Which ends still have releases past them: drives the arrow buttons.
  const syncEdges = () => {
    const box = scroller.current;
    if (!box) return;
    setEdges({
      start: box.scrollLeft <= 4,
      end: box.scrollLeft + box.clientWidth >= box.scrollWidth - 4,
    });
  };

  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    syncEdges();
    const observer = new ResizeObserver(syncEdges);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Keep the current release in view as the page scrolls.
  useEffect(() => {
    const box = scroller.current;
    const col = box?.querySelector<HTMLElement>('[aria-current]')?.closest('li');
    if (!box || !col) return;
    const left = col.offsetLeft - (box.clientWidth - col.offsetWidth) / 2;
    box.scrollTo({left, behavior: reduced ? 'auto' : 'smooth'});
  }, [active, reduced]);

  // Click-and-drag with a mouse; touch and trackpads scroll natively.
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = box.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        box.setPointerCapture(e.pointerId);
        box.dataset.dragging = 'true';
      }
      if (moved) box.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      dragging = false;
      delete box.dataset.dragging;
    };
    // A drag shouldn't also count as a click on the pill it started on.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    box.addEventListener('pointerdown', onDown);
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerup', onUp);
    box.addEventListener('pointercancel', onUp);
    box.addEventListener('click', onClick, true);
    return () => {
      box.removeEventListener('pointerdown', onDown);
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerup', onUp);
      box.removeEventListener('pointercancel', onUp);
      box.removeEventListener('click', onClick, true);
    };
  }, []);

  const page = (direction: 1 | -1) => {
    const box = scroller.current;
    if (!box) return;
    box.scrollBy({left: direction * box.clientWidth * 0.7, behavior: reduced ? 'auto' : 'smooth'});
  };

  return (
    <nav className={styles.timeline} aria-label="Releases">
      <button
        type="button"
        className={clsx(styles.timelineArrow, styles.arrowStart)}
        onClick={() => page(-1)}
        hidden={edges.start}
        aria-label="Scroll timeline left">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        ref={scroller}
        className={styles.timelineScroller}
        tabIndex={0}
        aria-label="Release timeline, scrolls sideways"
        onScroll={syncEdges}
        data-fade-start={!edges.start || undefined}
        data-fade-end={!edges.end || undefined}>
        <ol className={styles.track} style={{'--soon': UPCOMING.length, '--n': releases.length} as CSSProperties}>
          {UPCOMING.map((u, i) => (
            <li key={u.label} className={styles.soonCol} style={{'--drop': `${u.drop}px`} as CSSProperties}>
              <span className={styles.tickDate} aria-hidden="true">
                {i === Math.floor(UPCOMING.length / 2) && 'COMING SOON'}
              </span>
              <span className={clsx(styles.tick, styles.tickSoon)} aria-hidden="true" />
              <span className={clsx(styles.pill, styles.pillSoon)}>
                <svg className={styles.icon} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {u.glyph}
                </svg>
                <span>{u.label}</span>
                <span className={styles.srOnly}>: coming soon</span>
              </span>
            </li>
          ))}
          {releases.map((r, i) => (
            <li key={r.id} style={{'--drop': `${DROPS[i % DROPS.length]}px`} as CSSProperties}>
              <span className={styles.tickDate} aria-hidden="true">
                {shortDate(r.date)}
              </span>
              <span className={styles.tick} aria-hidden="true" />
              <a href={`#${r.id}`} className={styles.pill} aria-current={active === r.id ? 'location' : undefined} draggable={false}>
                <Icon name={r.icon} className={styles.icon} />
                <span>{r.sidebarLabel}</span>
                <span className={styles.srOnly}>, {longDate(r.date)}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <button
        type="button"
        className={clsx(styles.timelineArrow, styles.arrowEnd)}
        onClick={() => page(1)}
        hidden={edges.end}
        aria-label="Scroll timeline right">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ entry */

function Collapsible({title, items}: {title: string; items: string[]}) {
  if (items.length === 0) return null;
  return (
    <details className={styles.details}>
      <summary>
        <span>{title}</span>
        <span className={styles.count}>{String(items.length).padStart(2, '0')}</span>
        <svg className={styles.chevron} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </summary>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  );
}

function Entry({release, isLatest}: {release: Release; isLatest: boolean}) {
  const reviewNotes = process.env.NODE_ENV === 'development' ? release.todos ?? [] : [];
  return (
    <article id={release.id} className={styles.entry} aria-labelledby={`title-${release.id}`}>
      <div className={styles.meta}>
        <div className={styles.metaInner}>
          <time dateTime={release.date}>{longDate(release.date)}</time>
          <div className={styles.metaRow}>
            <a className={styles.anchor} href={`#${release.id}`} aria-label={`Release ${release.id}: link to this entry`}>
              #{release.id}
            </a>
            <span className={styles.version}>v{release.version}</span>
            {isLatest && <span className={styles.latest}>Latest</span>}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {release.heroMedia && <MediaBlock media={release.heroMedia} hero />}

        <h2 id={`title-${release.id}`} className={styles.title}>
          {release.title}
        </h2>
        <p className={styles.intro}>{release.intro}</p>

        {release.features.map((feature) => (
          <section key={feature.title} className={styles.feature}>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
            {feature.media && <MediaBlock media={feature.media} />}
          </section>
        ))}

        <div className={styles.collapsibles}>
          <Collapsible title="Improvements" items={release.improvements} />
          <Collapsible title="Fixes & housekeeping" items={release.fixes} />
        </div>

        <p className={styles.signoff}>{release.signoff}</p>

        {reviewNotes.length > 0 && (
          <aside className={styles.reviewNote}>
            <strong>Review note · dev only</strong>
            <ul>
              {reviewNotes.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}

/* --------------------------------------------------------------- story */

function StoryCard() {
  const img = useBaseUrl('/img/changelog/story-diorama.webp');
  return (
    <a className={styles.storyCard} href={STORY_URL} target="_blank" rel="noopener noreferrer">
      <img
        src={img}
        alt="A miniature clay workshop in warm gold: tiny people build around a large green ZenMode tile, beside a silenced bell, a streak calendar and stacks of gold coins."
        width={2000}
        height={1125}
        loading="lazy"
        decoding="async"
      />
      <span className={styles.storyCopy}>
        <span className={styles.storyEyebrow}>Our story</span>
        <span className={styles.storyTitle}>If there’s a hook, why can’t we unhook it?</span>
        <span className={styles.storyMore}>
          Read the thesis behind ZenMode OS
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------- page */

export default function Changelog(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const ids = releases.map((r) => r.id);
  const active = useScrollSpy(ids);
  const ogImage = `${siteConfig.url}${useBaseUrl('/img/changelog/os-hero.webp')}`;

  // Fonts and stages settle after the browser's first hash jump: land on /changelog#n again.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Layout title="Changelog" description={DESCRIPTION}>
      <Head>
        <title>{TITLE}</title>
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerPattern} aria-hidden="true" />
          <div className={styles.headerGlow} aria-hidden="true" />
          <ZenTile className={styles.zenTile} />
          <a className={styles.latestChip} href={`#${latest.id}`}>
            <span className={styles.calloutDot} aria-hidden="true" />
            <span>Latest · v{latest.version}</span>
            <span className={styles.latestDate}>{longDate(latest.date)}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <h1>
            What's new in{' '}
            <span className={styles.nowrap}>
              ZenMode <span className={styles.os}>OS</span>
            </span>
          </h1>
          <p>Small, steady releases. Less noise, every time.</p>
          <div className={styles.platforms}>
            <a className={clsx(styles.store, styles.storeLive)} href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              <svg className={styles.storeGlyph} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3.8v16.4c0 .9 1 1.4 1.7.9l13-8.2c.7-.4.7-1.4 0-1.8l-13-8.2C7 2.4 6 2.9 6 3.8z" fill="currentColor" />
              </svg>
              <span className={styles.storeText}>
                <span className={styles.storeEyebrow}>Get it on</span>
                <span className={styles.storeName}>Google Play</span>
              </span>
            </a>
            <span className={clsx(styles.store, styles.storeSoon)} aria-disabled="true">
              <span className={styles.storeGlyphs} aria-hidden="true">
                {UPCOMING.map((u) => (
                  <svg key={u.label} className={styles.storeGlyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {u.glyph}
                  </svg>
                ))}
              </span>
              <span className={styles.storeText}>
                <span className={styles.storeEyebrow}>Coming soon</span>
                <span className={styles.storeName}>
                  {UPCOMING.map((u, i) => (
                    <span key={u.short}>
                      {i > 0 && <span className={styles.storeSep}>·</span>}
                      {u.short}
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>Releases</dt>
              <dd>{String(releases.length).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>Since</dt>
              <dd>{shortDate(first.date).split(' ')[0]} {first.date.slice(0, 4)}</dd>
            </div>
            <div>
              <dt>Open source</dt>
              <dd>GPLv3</dd>
            </div>
          </dl>
        </header>

        <Timeline active={active} />

        <div className={styles.entries}>
          {releases.map((r, i) => (
            <Entry key={r.id} release={r} isLatest={i === 0} />
          ))}
        </div>

        <StoryCard />
      </main>
    </Layout>
  );
}
