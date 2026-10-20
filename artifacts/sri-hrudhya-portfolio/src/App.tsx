import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Award, BarChart3,
  Check, ChevronRight, Code2, Database, Download, Globe, Github, GraduationCap, Mail,
  MapPin, Menu, Moon, Sparkles, Sun, Wrench, X,
} from "lucide-react";
import { portfolio } from "./data";

const enter: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const skillIcons = [Code2, BarChart3, Database, Sparkles, Globe, Wrench];

function ResumeLink({ className = "" }: { className?: string }) {
  return <a href="/SriHrudhya_Resume.pdf" download="Sri_Hrudhya_Mediga_Resume.pdf" data-testid="button-download-resume" className={className}>
    <Download size={15} aria-hidden="true" /> {portfolio.navigation.resumeLabel}
  </a>;
}

function SectionHeading({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return <motion.div variants={enter} className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title.split("<br />").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h2>
    </div>
    {note && <p className="max-w-sm text-sm leading-6 text-muted-foreground">{note}</p>}
  </motion.div>;
}

function AnimatedStat({ value, active, delay, reduced }: { value: string; active: boolean; delay: number; reduced: boolean | null }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (!active) return;
    const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!match || reduced || /[a-z]/i.test(match[2])) { setDisplay(value); return; }
    const target = Number(match[1]);
    const suffix = match[2];
    const decimals = match[1].split(".")[1]?.length ?? 0;
    let step = 0;
    let interval: number | undefined;
    setDisplay(`0${decimals ? `.${"0".repeat(decimals)}` : ""}${suffix}`);
    const timer = window.setTimeout(() => {
      interval = window.setInterval(() => {
        step += 1;
        setDisplay(`${(target * Math.min(step / 12, 1)).toFixed(decimals)}${suffix}`);
        if (step >= 12) window.clearInterval(interval);
      }, 20);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [value, active, delay, reduced]);
  return <span className="stat-value">{display}</span>;
}

function ProjectDialog({ project, onClose }: { project: (typeof portfolio.projects)[number] | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!project) return;
    const prior = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key === "Tab") {
        const focusable = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"] button:not([disabled]), [role="dialog"] a[href], [role="dialog"] input:not([disabled]), [role="dialog"] textarea:not([disabled]), [role="dialog"] [tabindex]:not([tabindex="-1"])'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prior?.focus(); };
  }, [project, onClose]);
  return <AnimatePresence>
    {project && <motion.div className="dialog-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" className="dialog-panel"
        initial={{ opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}>
        <div className="mb-8 flex items-start justify-between gap-4">
          <div><p className="eyebrow">{project.category}</p><h2 id="project-dialog-title" className="mt-2 font-display text-3xl font-semibold">{project.name}</h2></div>
          <button ref={closeRef} onClick={onClose} aria-label={portfolio.copy.closeProjectLabel} data-testid="button-close-project-dialog" className="icon-button"><X size={19} /></button>
        </div>
        {project.award && <p className="award-pill mb-5"><Award size={15} />{project.award}</p>}
        <h3 className="font-display text-lg font-semibold">{project.title}</h3>
        <p className="mt-3 leading-7 text-muted-foreground">{project.details}</p>
        <p className="mt-5 border-l-2 border-primary pl-4 text-sm font-semibold">{project.highlight}</p>
        <div className="mt-7 flex flex-wrap gap-2">{project.stack.map((item) => <span key={item} className="tag">{item}</span>)}</div>
        <p className="mt-7 text-sm text-muted-foreground">{project.role}</p>
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}

function projectUrl(link: string) {
  try {
    const url = new URL(link.trim());
    if (url.protocol !== "https:" || /(^|\.)example\.(com|org|net)$/i.test(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function ProjectCard({ project, onOpen }: { project: (typeof portfolio.projects)[number]; onOpen: () => void }) {
  const githubUrl = projectUrl(project.links.github);
  const demoUrl = projectUrl(project.links.demo);
  return <motion.article variants={enter} className={`project-card ${project.featured ? "project-featured" : ""}`}>
    <div className="mb-7 flex items-start justify-between gap-3">
      <div className="project-mark">{project.featured ? <BarChart3 size={21} /> : <Code2 size={21} />}</div>
      {project.award && <span className="award-pill"><Award size={14} />{project.award}</span>}
      {project.featured && <span className="featured-label">{portfolio.copy.projects.featuredLabel}</span>}
    </div>
    <p className="eyebrow">{project.category}</p>
    <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{project.name}</h3>
    <p className="mt-1 text-sm font-medium text-primary">{project.title}</p>
    <p className="mt-4 min-h-[3rem] text-sm leading-6 text-muted-foreground">{project.description}</p>
    <p className="mt-4 flex gap-2 text-sm font-medium leading-6"><Sparkles size={15} className="mt-1 shrink-0 text-primary" />{project.highlight}</p>
    <div className="mt-5 flex flex-wrap gap-2">{project.stack.slice(0, 5).map((item) => <span key={item} className="tag">{item}</span>)}</div>
    <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
      <span className="text-xs text-muted-foreground">{project.role}</span>
      <button onClick={onOpen} data-testid={`button-project-details-${project.id}`} className="text-link">
        {portfolio.copy.projects.detailsLabel} <ArrowUpRight size={15} />
      </button>
    </div>
    {(githubUrl || demoUrl) && <div className="mt-3 flex gap-4">
      {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="subtle-link" data-testid={`link-project-github-${project.id}`}><Github size={14} />{portfolio.copy.projects.githubLabel}</a>}
      {demoUrl && <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="subtle-link" data-testid={`link-project-demo-${project.id}`}>{portfolio.copy.projects.demoLabel} <ArrowUpRight size={13} /></a>}
    </div>}
  </motion.article>;
}

function App() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("shm-theme") === "dark"; } catch { return false; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<(typeof portfolio.projects)[number] | null>(null);
  const [visibleStats, setVisibleStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("shm-theme", dark ? "dark" : "light"); } catch { /* storage is optional */ }
  }, [dark]);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setRoleIndex((index) => (index + 1) % portfolio.roles.length), 2800);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);
  useEffect(() => {
    const element = statsRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisibleStats(true); observer.disconnect(); }
    }, { threshold: .25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div className="min-h-[100dvh] bg-background text-foreground">
    <header className="site-nav">
      <div className="nav-inner">
        <a href="#home" className="brand" aria-label={portfolio.navigation.homeAriaLabel} data-testid="link-home">
          <span className="brand-mark">{portfolio.initials}</span><span className="hidden sm:block">{portfolio.name}</span>
        </a>
        <nav className="hidden items-center gap-6 lg:flex" aria-label={portfolio.navigation.ariaLabel}>
          {portfolio.navigation.items.map(([label, href]) => <a key={href} href={href} className="nav-link" data-testid={`link-nav-${label.toLowerCase()}`}>{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <ResumeLink className="resume-button hidden sm:inline-flex" />
          <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label={dark ? portfolio.navigation.switchToLightLabel : portfolio.navigation.switchToDarkLabel} data-testid="button-theme-toggle">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMenuOpen((value) => !value)} className="icon-button lg:hidden" aria-label={menuOpen ? portfolio.navigation.closeMenuLabel : portfolio.navigation.openMenuLabel} aria-expanded={menuOpen} data-testid="button-mobile-menu">
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && <motion.nav className="mobile-nav lg:hidden" aria-label={portfolio.navigation.ariaLabel} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          {portfolio.navigation.items.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="mobile-nav-link" data-testid={`link-mobile-${label.toLowerCase()}`}>{label}<ChevronRight size={15} /></a>)}
          <ResumeLink className="resume-button mt-2 w-full justify-center" />
        </motion.nav>}
      </AnimatePresence>
    </header>

    <main>
      <section id="home" className="hero-section">
        <div className="hero-grid page-wrap">
          <motion.div variants={stagger} initial="hidden" animate="show" className="hero-copy">
            <motion.p variants={enter} className="eyebrow hero-eyebrow"><span className="live-dot" /> {portfolio.copy.hero.identity}</motion.p>
            <motion.h1 variants={enter} className="hero-title">{portfolio.copy.hero.headline[0]}<br />{portfolio.copy.hero.headline[1]} <span className="hero-accent">{portfolio.copy.hero.headline[2]}</span></motion.h1>
            <motion.div variants={enter} className="role-line" aria-live="polite">
              <span className="role-prefix">{portfolio.copy.hero.rolePrefix}</span>
              <AnimatePresence mode="wait">
                <motion.span key={portfolio.roles[roleIndex]} className="role-current" initial={reduceMotion ? false : { opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .25 }}>{portfolio.roles[roleIndex]}</motion.span>
              </AnimatePresence>
            </motion.div>
            <motion.p variants={enter} className="hero-description">{portfolio.tagline}</motion.p>
            <motion.div variants={enter} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className="button-primary" data-testid="link-view-projects">{portfolio.copy.hero.viewProjects} <ArrowDownRight size={17} /></a>
              <a href="#contact" className="button-secondary" data-testid="link-contact-me">{portfolio.copy.hero.contactMe} <ArrowRight size={16} /></a>
            </motion.div>
            <motion.div variants={enter} className="mt-9 flex items-center gap-5">
              <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="social-link" data-testid="link-github"><Github size={17} /> {portfolio.copy.projects.githubLabel} <ArrowUpRight size={13} /></a>
              <a href={`mailto:${portfolio.email}`} className="social-link" data-testid="link-email"><Mail size={16} /> {portfolio.copy.hero.emailLabel} <ArrowUpRight size={13} /></a>
            </motion.div>
          </motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .95, x: 15 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: .7, delay: .15 }} className="hero-art" aria-label={portfolio.copy.hero.profileAlt}>
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="profile-placeholder"><span>{portfolio.initials}</span></div>
            <div className="floating-note note-top"><span className="note-icon"><BarChart3 size={16} /></span><span><b>{portfolio.copy.hero.appliedTitle}</b><small>{portfolio.copy.hero.appliedDetail}</small></span></div>
            <div className="floating-note note-bottom"><span className="note-icon note-icon-alt"><Check size={16} /></span><span><b>{portfolio.copy.hero.explainTitle}</b><small>{portfolio.copy.hero.explainDetail}</small></span></div>
          </motion.div>
        </div>
        <div className="hero-bottom page-wrap"><span>{portfolio.copy.hero.scrollPrompt}</span><ArrowDown size={15} /><span className="hero-bottom-line" /></div>
      </section>

      <section ref={statsRef} className="stats-band" aria-label={portfolio.copy.statsLabel}>
        <div className="page-wrap stats-grid">{portfolio.stats.map((stat, index) => <div key={stat.label} className="stat-item" data-testid={`stat-${stat.label.toLowerCase().replaceAll(" ", "-")}`}>
          <AnimatedStat value={stat.value} active={visibleStats} delay={index * 50} reduced={reduceMotion} /><span className="stat-label">{stat.label}</span>
        </div>)}</div>
      </section>

      <section id="about" className="section page-wrap">
        <SectionHeading {...portfolio.copy.about} />
        <div className="about-grid">
          <motion.div variants={enter} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} className="about-story">
            <p>{portfolio.about}</p>
            <div className="interest-row"><span className="micro-label">{portfolio.copy.about.interestsLabel}</span>{portfolio.interests.map((interest) => <span key={interest} className="interest-chip">{interest}</span>)}</div>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: .15 }} className="facts-grid">
            {portfolio.quickFacts.map(([label, value], index) => <motion.div variants={enter} key={label} className={`fact-cell ${index === 0 ? "fact-wide" : ""}`}>
              <span className="micro-label">{label}</span><span className="fact-value">{value}</span>
            </motion.div>)}
          </motion.div>
        </div>
      </section>

      <section id="skills" className="section section-tint">
        <div className="page-wrap">
          <SectionHeading {...portfolio.copy.skills} />
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: .12 }} className="skills-grid">
            {portfolio.skills.map((group, index) => {
              const SkillIcon = skillIcons[index] ?? Code2;
              return <motion.article variants={enter} key={group.group} className={`skill-card ${index === 3 ? "skill-card-featured" : ""}`}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary"><SkillIcon size={17} aria-hidden="true" /></span>
                </div>
                <h3>{group.group}</h3>
                <div className="mt-4 flex flex-wrap gap-2">{group.items.map((item) => <span key={item} className="tag">{item}</span>)}</div>
              </motion.article>;
            })}
          </motion.div>
        </div>
      </section>

      <section id="experience" className="section page-wrap">
        <SectionHeading {...portfolio.copy.experience} />
        <motion.article variants={enter} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} className="experience-card">
          <div className="experience-rail"><span className="experience-dot" /><span className="experience-line" /></div>
          <div className="experience-content">
            <div>
              <p className="eyebrow">{portfolio.copy.experience.internshipLabel}</p><h3 className="mt-2 font-display text-2xl font-semibold">{portfolio.experience.title}</h3><p className="mt-1 text-primary">{portfolio.experience.organization}</p>
            </div>
            <div className="mt-6 rounded-lg border border-border bg-background/60 p-4"><span className="micro-label">{portfolio.copy.experience.projectLabel}</span><p className="mt-1 font-medium">{portfolio.experience.project}</p></div>
            <ul className="experience-list">{portfolio.experience.bullets.map((bullet) => <li key={bullet}><Check size={16} />{bullet}</li>)}</ul>
            <div className="mt-6 flex flex-wrap gap-2">{portfolio.experience.stack.map((item) => <span key={item} className="tag">{item}</span>)}</div>
          </div>
        </motion.article>
      </section>

      <section id="projects" className="section section-tint">
        <div className="page-wrap">
          <SectionHeading {...portfolio.copy.projects} />
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: .08 }} className="projects-grid">
            {portfolio.projects.map((project) => <ProjectCard key={project.id} project={project} onOpen={() => setSelectedProject(project)} />)}
          </motion.div>
        </div>
      </section>

      <section id="education" className="section page-wrap">
        <SectionHeading {...portfolio.copy.education} />
        <div className="education-list">
          {portfolio.education.map((item, index) => <motion.article variants={enter} initial="hidden" whileInView="show" viewport={{ once: true, amount: .3 }} key={item.school} className="education-row">
            <div className="education-icon"><GraduationCap size={19} /></div>
            <div className="education-main"><h3>{item.school}</h3><p>{item.program}</p></div>
            <span className="education-years">{item.years}</span><span className="education-result">{item.result}</span>
          </motion.article>)}
        </div>
      </section>

      <section id="leadership" className="section section-tint">
        <div className="page-wrap leadership-layout">
          <div><SectionHeading {...portfolio.copy.leadership} />
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} className="leadership-list">
              {portfolio.leadership.map((item) => <motion.div variants={enter} key={item} className="leadership-item"><span>{item}</span><ArrowUpRight size={15} /></motion.div>)}
            </motion.div>
          </div>
          <motion.aside variants={enter} initial="hidden" whileInView="show" viewport={{ once: true, amount: .3 }} className="interests-panel">
            <span className="micro-label">{portfolio.copy.leadership.interestsLabel}</span><h3>{portfolio.copy.leadership.interestsTitle.split("<br />").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h3>
            <div className="interest-cloud">{portfolio.activities.map((item, index) => <span key={item} className={`interest-large interest-${index}`}>{item}</span>)}</div>
          </motion.aside>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="page-wrap contact-layout">
          <motion.div variants={enter} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} className="contact-intro">
            <p className="eyebrow">{portfolio.copy.contact.eyebrow}</p><h2>{portfolio.copy.contact.title.split("<br />").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h2>
            <p>{portfolio.copy.contact.note}</p>
            <a href={`mailto:${portfolio.email}`} className="contact-email" data-testid="link-contact-email"><Mail size={17} />{portfolio.email}<ArrowUpRight size={16} /></a>
            <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="contact-github" data-testid="link-contact-github"><Github size={17} />{portfolio.copy.contact.githubLabel}<ArrowUpRight size={15} /></a>
            <span className="contact-location"><MapPin size={16} />{portfolio.location}</span>
          </motion.div>
          <motion.form variants={enter} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} className="contact-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const sender = String(form.get("name") ?? "").trim();
              const email = String(form.get("email") ?? "").trim();
              const message = String(form.get("message") ?? "").trim();
              const subject = encodeURIComponent(`${portfolio.copy.contact.subjectPrefix} ${sender}`);
              const body = encodeURIComponent(`${portfolio.copy.contact.fromLabel} ${sender}\n${portfolio.copy.contact.emailBodyLabel} ${email}\n\n${message}`);
              window.location.href = `mailto:${portfolio.email}?subject=${subject}&body=${body}`;
            }}>
            <p className="micro-label">{portfolio.copy.contact.formTitle}</p>
            <label htmlFor="contact-name">{portfolio.copy.contact.nameLabel}</label><input id="contact-name" name="name" required data-testid="input-contact-name" />
            <label htmlFor="contact-email-field">{portfolio.copy.contact.emailLabel}</label><input id="contact-email-field" name="email" type="email" required data-testid="input-contact-email" />
            <label htmlFor="contact-message">{portfolio.copy.contact.messageLabel}</label><textarea id="contact-message" name="message" required rows={4} data-testid="input-contact-message" />
            <p className="form-note">{portfolio.copy.contact.mailNotice}</p>
            <button type="submit" className="button-primary w-full justify-center" data-testid="button-send-message">{portfolio.copy.contact.submitLabel} <ArrowUpRight size={16} /></button>
          </motion.form>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="page-wrap footer-inner">
        <a href="#home" className="brand" aria-label={portfolio.navigation.homeAriaLabel}><span className="brand-mark">{portfolio.initials}</span><span>{portfolio.name}</span></a>
        <span>© {new Date().getFullYear()} {portfolio.name}. {portfolio.copy.footer.builtWith}</span>
        <a href="#home" className="back-top" data-testid="link-back-to-top">{portfolio.copy.footer.backToTop} <ArrowUpRight size={14} /></a>
      </div>
    </footer>
    <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
  </div>;
}

export default App;
