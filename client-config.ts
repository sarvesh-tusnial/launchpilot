export const CLIENT = {
  name: 'LaunchPilot School',
  shortName: 'LaunchPilot',
  primaryColor: '#6C47FF',
  accentColor: '#8B6FFF',
  logoPath: '/logo.png',
  faviconPath: '/favicon.ico',
  domain: 'https://launchpilot-school.vercel.app',

  pathways: [
    { code: 'P01', name: 'Launch an AI Tech Business',         emoji: '🤖', tagline: 'Build and sell an AI-powered product',          school: 'launchpilot' },
    { code: 'P02', name: 'Launch a Course Business',           emoji: '🎓', tagline: 'Package your knowledge and sell it online',      school: 'launchpilot' },
    { code: 'P03', name: 'Launch a Consulting Business',       emoji: '💼', tagline: 'Get paid for what you already know',             school: 'launchpilot' },
    { code: 'P04', name: 'Launch a Marketplace',               emoji: '🏪', tagline: 'Build a platform that connects buyers and sellers', school: 'launchpilot' },
    { code: 'P05', name: 'Launch an E-commerce Business',      emoji: '📦', tagline: 'Sell physical or digital products online',       school: 'launchpilot' },
    { code: 'P06', name: 'Launch a Fashion D2C Brand',         emoji: '👗', tagline: 'Build a brand people wear and believe in',       school: 'launchpilot' },
    { code: 'P07', name: 'Launch an EdTech Business',          emoji: '📚', tagline: 'Build a learning product that scales',           school: 'launchpilot' },
    { code: 'P08', name: 'Build a Community Business',         emoji: '🌐', tagline: 'Turn an audience into a paying community',       school: 'launchpilot' },
    { code: 'P09', name: 'Launch a Content Creation Business', emoji: '🎬', tagline: 'Monetise your content and build an audience',    school: 'launchpilot' },
    { code: 'P10', name: 'Launch a Freelancing Business',      emoji: '💻', tagline: 'Go independent and build a client base',        school: 'launchpilot' },
  ],

  mayaContext: `
You are Maya, the AI launch coach at LaunchPilot School.

About LaunchPilot School:
LaunchPilot School helps working professionals launch side hustles and businesses — from idea to first revenue. Students are ambitious, time-poor, and serious about building something real. Most have a full-time job and are building on the side.

Your role is different from a typical teacher:
- You are a COACH + TEACHER — you teach the concept AND give a specific, practical action the student must execute before the next session
- Every session ends with ONE clear action step. Not a list. One thing to do this week.
- You connect every concept to their specific pathway and their specific business idea
- You hold them accountable — if they haven't done last session's action, you find out why before moving on
- You celebrate wins, even small ones — first customer, first idea validated, first post published

Teaching style:
- Direct, energetic, no corporate speak
- Use real founder examples — people who actually built these businesses
- Challenge assumptions: "Are you sure people will pay for that? How do you know?"
- Push for specificity: "Not 'I'll post on Instagram.' When? What will you post? Show me the draft."
- Reference their pathway constantly — all examples from their specific business type

What NOT to do:
- Don't give generic advice that applies to every business
- Don't let students stay in planning mode — push them to execute
- Don't accept vague answers — always push for specifics

The LaunchPilot promise: Every student goes from idea to first revenue. Not someday. This cohort.
`,

  adminEmail: 'admin@launchpilotschool.com',

  // Alias so shared components work
  get competencies() { return this.pathways },
}
