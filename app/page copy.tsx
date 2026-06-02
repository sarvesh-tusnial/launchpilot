'use client'
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import ScrollRow from '@/components/features/ScrollRow'
import MobileNav from '@/components/layout/MobileNav'
import SchoolsDropdown from '@/components/layout/SchoolsDropdown'

// ── AdmissionsChat ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Maya, Mentogram's admissions guide. You're sharp, warm, and direct — like a knowledgeable friend who knows this place inside out. You're not a salesperson. You genuinely want to match people to the right program.

CRITICAL RULES:
- NEVER use ** or * or any markdown formatting. No bold, no bullets with asterisks, no headers. Plain conversational text only.
- Keep every response under 4 sentences. Short and punchy.
- Ask ONE question at a time, never a numbered list of questions.
- When you recommend a program, end your message with exactly this on a new line: RECOMMEND:[program_name] where program_name is the exact program name from the catalogue.
- Sound human. Use contractions. Be direct. No corporate speak.

CONVERSATION FLOW:
1. Ask what they want to do/build (already asked in the opening)
2. Ask ONE follow-up about their background or timeline
3. Make your recommendation with RECOMMEND:[name]

━━━ FULL PROGRAMME CATALOGUE ━━━

SCHOOL OF BUSINESS
- PM MBA: product management, strategy, GTM, analytics, AI tools. $5K–$8K, 12–18 months, MBA degree.
- PGP in Growth: growth marketing, retention, monetisation, distribution. $3K–$4K, 6 months.
- PGP in Strategy & Leadership: strategy, leadership, ops, negotiation. $3K–$4K, 6 months.
- Certificate in Distribution & Reach: distribution, growth, GTM. $1.5K–$2K, 2 months.
- Build Your Own MBA: pick any 12 competencies. Custom pricing.

SCHOOL OF FINANCE
- Finance MBA: modelling, corporate finance, markets, risk, accounting. $8K–$10K, 12–18 months, MBA degree.
- PGP in Venture Capital: VC mechanics, deal sourcing, term sheets, fundraising. $4K–$5K, 6–9 months.
- PGP in Investment Banking: M&A, LBO, DCF, deal execution. $4K–$5K, 6–9 months.
- PGP in FinTech: digital payments, DeFi, neobanking, regulation. $4K–$5K, 6 months.
- Certificate in Financial Modelling: DCF, LBO, accounting. $1.5K–$2K, 2 months.

SCHOOL OF AI & TECHNOLOGY
- AI MBA: LLMs, agents, ML, data, AI product, ethics. $8K–$10K, 12–18 months, MBA degree.
- PGP in AI Agents: LLM fundamentals, agents, prompt engineering, NLP. $4K–$5K, 6 months.
- PGP in Data & Analytics: ML, data engineering, BI, dashboarding. $4K–$5K, 6 months.
- PGP in AI Strategy for Leaders: AI transformation, strategy, ethics. $4K–$5K, 6 months.
- Certificate in Automation & No-Code: Make/Zapier, prompt engineering, AI tools. $1.5K–$2K, 2 months.

SCHOOL OF MANUFACTURING
- Manufacturing MBA: lean, six sigma, supply chain, production, EHS, plant leadership. $5K–$8K, 12–18 months, MBA degree.
- PGP in Supply Chain Management: procurement, logistics, demand planning. $3K–$4K, 6 months.
- PGP in Industrial AI & Industry 4.0: IIoT, digital twins, predictive maintenance. $4K–$5K, 6 months.
- PGP in Lean & Operational Excellence: lean, six sigma, ops, EHS. $3K–$4K, 6 months.
- Certificate in Lean Operations: lean, six sigma, EHS. $1.5K–$2K, 2 months.

ALL PROGRAMS include: Maya AI mentor 24/7, EU-accredited credential via Woolf University (EQF Level 7), global immersions across Singapore, Dubai, San Francisco, Mumbai, Shanghai, Bali.`

// Shared mentor pool with photo paths
const MENTORS: Record<string, { name: string; role: string; img: string }> = {
  prantik:  { name: 'Prantik Mazumdar',  role: 'President, TiE Singapore · Exited Entrepreneur',         img: '../images/mentors/prantik-mazumdar.jpg' },
  jason:    { name: 'Jason Kraus',        role: 'Founder, Prepare4VC · Partner, EQx Fund',                img: '../images/mentors/jason-kraus.jpg' },
  renuka:   { name: 'Renuka Belwalkar',   role: 'Investor · Forbes Under 30 Scholar',                     img: '../images/mentors/renuka-belwalkar.jpg' },
  yash:     { name: 'Yash Shah',          role: 'GenAI Head India & SEA · AWS',                           img: '../images/mentors/yash-shah.jpg' },
  andrew:   { name: 'Andrew Chow',        role: 'Co-Founder, Asia Pro Ventures · NTU',                   img: '../images/mentors/andrew-chow.jpg' },
  daniel:   { name: 'Daniel Ling',        role: 'ex-VP Design, DBS & Lazada',                             img: '../images/mentors/daniel-ling.jpg' },
  rajesh:   { name: 'Rajesh Setty',       role: '19x Author · Mentor at Founder Institute',               img: '../images/mentors/rajesh-shetty.jpg' },
  shavin:   { name: 'Shavin Goswami',     role: 'Global Risk Ops, Meta · ex-EY Consulting',               img: '../images/mentors/shavin-goswami.jpg' },
  sarvash:  { name: 'Sarvash Malani',     role: 'DeepTech VC, Temasek · Wharton Grad',                   img: '../images/mentors/sarvash-malani.jpg' },
  justin:   { name: 'Justin Strackany',   role: 'LP at GTMFund · 3 exits (SecureLink/Vista)',             img: '../images/mentors/justin-strackany.jpg' },
  gaurav:   { name: 'Gaurav Thakkar',     role: 'Principal VC, Silicon Road · ex-Morgan Stanley',         img: '../images/mentors/gaurav-thakkar.jpg' },
  john:     { name: 'John Lim',           role: 'Partner, Meet Ventures SG · ex-HOD $100M fund',         img: '../images/mentors/john-lim.jpg' },
  hasit:    { name: 'Hasit Dangi',        role: 'School Director · ex-Head of Production, Bayer',         img: '../images/mentors/hasit-dangi.jpg' },
  sarvesh:  { name: 'Sarvesh Tusnial',    role: 'Co-Founder, Mentogram · ex-EY',                         img: '../images/mentors/sarvesh-tusnial.jpg' },
}

const PROGRAM_DATA: Record<string, {
  school: string; schoolColor: string; tier: string; price: string; duration: string; credential: string;
  tagline: string; competencies: string[]; outcomes: string[];
  mentors: { name: string; role: string; img: string }[];
}> = {
  'PM MBA': {
    school: 'School of Business', schoolColor: '#FF6A00', tier: 'MBA', price: '$5,000–$8,000', duration: '12–18 months', credential: 'MBA Degree (EU Accredited)',
    tagline: 'Build products people actually want. Lead with data. Ship with AI.',
    competencies: ['Product Management Fundamentals', 'Product Strategy & Vision', 'User Research & Insight', 'Data Analysis & Interpretation', 'Metrics & Product Analytics', 'Go-to-Market Strategy', 'Marketing in an AI World', 'Consumer Psychology & Behaviour', 'Stakeholder Management', 'Leadership & Management', 'AI Tools for Professionals', 'Strategy'],
    outcomes: ['Launch a product from 0 to 1', 'Lead a product team with confidence', 'Build and own a GTM strategy', 'Make decisions with data, not gut', 'Graduate with an EU-accredited MBA'],
    mentors: [MENTORS.prantik, MENTORS.yash, MENTORS.andrew, MENTORS.daniel, MENTORS.rajesh],
  },
  'PGP in Growth': {
    school: 'School of Business', schoolColor: '#FF6A00', tier: 'PGP', price: '$3,000–$4,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Master the full growth stack — from acquisition to revenue.',
    competencies: ['Growth Marketing & Acquisition', 'Retention & Engagement', 'Metrics & Product Analytics', 'Distribution & Reach', 'Monetisation & Pricing', 'Data Analysis & Interpretation'],
    outcomes: ['Run paid and organic growth campaigns', 'Build retention and lifecycle systems', 'Understand LTV, CAC and unit economics', 'Design distribution and GTM strategy', 'Use AI tools to 10x marketing output'],
    mentors: [MENTORS.daniel, MENTORS.rajesh, MENTORS.prantik, MENTORS.andrew, MENTORS.yash],
  },
  'PGP in Strategy & Leadership': {
    school: 'School of Business', schoolColor: '#FF6A00', tier: 'PGP', price: '$3,000–$4,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Think sharper. Lead better. Execute faster.',
    competencies: ['Strategy', 'Leadership & Management', 'Stakeholder Management', 'Operations & Scaling', 'Negotiation & Influence', 'Communication & Storytelling'],
    outcomes: ['Lead teams and manage up effectively', 'Build and present strategy to stakeholders', 'Negotiate with confidence', 'Scale operations with clear SOPs', 'Communicate with boardroom presence'],
    mentors: [MENTORS.jason, MENTORS.renuka, MENTORS.prantik, MENTORS.sarvesh, MENTORS.john],
  },
  'Certificate in Distribution & Reach': {
    school: 'School of Business', schoolColor: '#FF6A00', tier: 'CERT', price: '$1,500–$2,000', duration: '2 months', credential: 'Competency Certificate',
    tagline: 'Get your product in front of the right people, fast.',
    competencies: ['Distribution & Reach', 'Growth Marketing & Acquisition', 'Go-to-Market Strategy'],
    outcomes: ['Design a channel strategy from scratch', 'Run GTM for a new product launch', 'Build B2B and B2C distribution playbooks'],
    mentors: [MENTORS.daniel, MENTORS.rajesh, MENTORS.andrew, MENTORS.prantik, MENTORS.yash],
  },
  'Finance MBA': {
    school: 'School of Finance', schoolColor: '#3B82F6', tier: 'MBA', price: '$8,000–$10,000', duration: '12–18 months', credential: 'MBA Degree (EU Accredited)',
    tagline: 'The full finance toolkit — modelling, markets, and leadership.',
    competencies: ['Financial Modelling & Valuation', 'Corporate Finance & Capital Structure', 'Investment Analysis & Portfolio Mgmt', 'Financial Markets & Macro Economics', 'Risk Management & Compliance', 'Accounting & Financial Reporting', 'Strategy', 'Negotiation & Influence', 'Communication & Storytelling', 'Data Analysis & Interpretation', 'Marketing in an AI World', 'Global Business Context'],
    outcomes: ['Build financial models from scratch', 'Understand capital markets and macro', 'Manage risk and compliance', 'Lead with financial and strategic clarity', 'Graduate with an EU-accredited MBA'],
    mentors: [MENTORS.jason, MENTORS.sarvash, MENTORS.gaurav, MENTORS.renuka, MENTORS.john],
  },
  'PGP in Venture Capital': {
    school: 'School of Finance', schoolColor: '#3B82F6', tier: 'PGP', price: '$4,000–$5,000', duration: '6–9 months', credential: 'PGP Certificate',
    tagline: 'Learn to find, evaluate and back the best founders.',
    competencies: ['Venture Capital & Startup Finance', 'Investment Analysis & Portfolio Mgmt', 'Startup Fundraising & Investor Relations', 'Financial Modelling & Valuation', 'Marketing in an AI World', 'Entrepreneurial Thinking'],
    outcomes: ['Source and evaluate startup deals', 'Build and manage a cap table', 'Write term sheets and close rounds', 'Understand fund mechanics and LP dynamics', 'Build your investor network in Asia'],
    mentors: [MENTORS.jason, MENTORS.sarvash, MENTORS.gaurav, MENTORS.renuka, MENTORS.justin],
  },
  'PGP in Investment Banking': {
    school: 'School of Finance', schoolColor: '#3B82F6', tier: 'PGP', price: '$4,000–$5,000', duration: '6–9 months', credential: 'PGP Certificate',
    tagline: 'Deal execution, financial modelling, and the IB playbook.',
    competencies: ['Investment Banking & Deal Execution', 'Financial Modelling & Valuation', 'Corporate Finance & Capital Structure', 'Private Equity & Alt Investments', 'Communication & Storytelling', 'Negotiation & Influence'],
    outcomes: ['Run M&A and IPO processes', 'Build LBO and DCF models', 'Construct pitch books', 'Navigate debt and equity capital markets', 'Close deals with negotiation confidence'],
    mentors: [MENTORS.jason, MENTORS.gaurav, MENTORS.sarvash, MENTORS.renuka, MENTORS.john],
  },
  'PGP in FinTech': {
    school: 'School of Finance', schoolColor: '#3B82F6', tier: 'PGP', price: '$4,000–$5,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'The future of finance is digital. Get ahead of it.',
    competencies: ['FinTech & Digital Finance', 'Risk Management & Compliance', 'Financial Markets & Macro Economics', 'AI Tools for Professionals', 'Marketing in an AI World', 'Data Analysis & Interpretation'],
    outcomes: ['Understand digital payments and neobanking', 'Navigate DeFi and blockchain basics', 'Work with open banking APIs', 'Understand MAS, FCA and SEC regulation', 'Build AI-powered financial tools'],
    mentors: [MENTORS.sarvash, MENTORS.jason, MENTORS.yash, MENTORS.gaurav, MENTORS.shavin],
  },
  'Certificate in Financial Modelling': {
    school: 'School of Finance', schoolColor: '#3B82F6', tier: 'CERT', price: '$1,500–$2,000', duration: '2 months', credential: 'Competency Certificate',
    tagline: 'Build models that actually get used in the real world.',
    competencies: ['Financial Modelling & Valuation', 'Accounting & Financial Reporting', 'Corporate Finance & Capital Structure'],
    outcomes: ['Build DCF and comparable company models', 'Read and analyse financial statements', 'Understand WACC and capital structure'],
    mentors: [MENTORS.jason, MENTORS.gaurav, MENTORS.sarvash, MENTORS.renuka, MENTORS.john],
  },
  'AI MBA': {
    school: 'School of AI & Technology', schoolColor: '#A855F7', tier: 'MBA', price: '$8,000–$10,000', duration: '12–18 months', credential: 'MBA Degree (EU Accredited)',
    tagline: 'Build AI products. Lead AI teams. Transform organisations with AI.',
    competencies: ['AI & LLM Fundamentals', 'Prompt Engineering & LLM APIs', 'AI Agents & Agentic Systems', 'AI Product Management', 'AI for Business Transformation', 'Machine Learning for Business', 'Data Strategy & Engineering', 'AI Ethics Safety & Governance', 'Marketing in an AI World', 'Strategy', 'Data Analysis & Interpretation', 'AI Tools for Professionals'],
    outcomes: ['Build AI-native products end to end', 'Lead AI transformation inside organisations', 'Design and ship agentic systems', 'Make ethical, governed AI decisions', 'Graduate with an EU-accredited MBA'],
    mentors: [MENTORS.yash, MENTORS.prantik, MENTORS.shavin, MENTORS.andrew, MENTORS.sarvesh],
  },
  'PGP in AI Agents': {
    school: 'School of AI & Technology', schoolColor: '#A855F7', tier: 'PGP', price: '$4,000–$5,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Build autonomous AI systems that actually work.',
    competencies: ['AI & LLM Fundamentals', 'AI Agents & Agentic Systems', 'Prompt Engineering & LLM APIs', 'NLP & Language AI Applications', 'AI Ethics Safety & Governance', 'AI Tools for Professionals'],
    outcomes: ['Build multi-agent systems with LangChain and CrewAI', 'Design and evaluate RAG pipelines', 'Ship production-grade AI agents', 'Apply NLP to real business problems', 'Navigate AI ethics and governance'],
    mentors: [MENTORS.yash, MENTORS.shavin, MENTORS.sarvesh, MENTORS.andrew, MENTORS.prantik],
  },
  'PGP in Data & Analytics': {
    school: 'School of AI & Technology', schoolColor: '#A855F7', tier: 'PGP', price: '$4,000–$5,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Turn data into decisions. Build the systems that power them.',
    competencies: ['Machine Learning for Business', 'Data Strategy & Engineering', 'Business Intelligence & Dashboarding', 'Data Analysis & Interpretation', 'NLP & Language AI Applications', 'Marketing in an AI World'],
    outcomes: ['Build data pipelines and architecture', 'Create BI dashboards in Looker and Tableau', 'Apply ML to real business problems', 'Design self-serve analytics for teams', 'Use NLP to extract insight from text'],
    mentors: [MENTORS.yash, MENTORS.shavin, MENTORS.sarvash, MENTORS.daniel, MENTORS.prantik],
  },
  'PGP in AI Strategy for Leaders': {
    school: 'School of AI & Technology', schoolColor: '#A855F7', tier: 'PGP', price: '$4,000–$5,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Lead the AI shift inside your organisation.',
    competencies: ['AI for Business Transformation', 'AI & LLM Fundamentals', 'AI Ethics Safety & Governance', 'Strategy', 'Leadership & Management', 'Marketing in an AI World'],
    outcomes: ['Build an AI strategy and roadmap', 'Identify where AI creates value in your org', 'Lead change management for AI adoption', 'Navigate AI governance and ethics', 'Measure and communicate AI ROI'],
    mentors: [MENTORS.yash, MENTORS.prantik, MENTORS.jason, MENTORS.sarvesh, MENTORS.renuka],
  },
  'Certificate in Automation & No-Code': {
    school: 'School of AI & Technology', schoolColor: '#A855F7', tier: 'CERT', price: '$1,500–$2,000', duration: '2 months', credential: 'Competency Certificate',
    tagline: 'Automate the boring stuff. Build more with less.',
    competencies: ['Automation & No-Code Systems', 'Prompt Engineering & LLM APIs', 'AI Tools for Professionals'],
    outcomes: ['Build Make and Zapier workflows', 'Use AI to automate repetitive tasks', 'Integrate AI into your existing tools'],
    mentors: [MENTORS.yash, MENTORS.shavin, MENTORS.sarvesh, MENTORS.andrew, MENTORS.daniel],
  },
  'Manufacturing MBA': {
    school: 'School of Manufacturing', schoolColor: '#14B8A6', tier: 'MBA', price: '$5,000–$8,000', duration: '12–18 months', credential: 'MBA Degree (EU Accredited)',
    tagline: 'Run plants. Fix supply chains. Lead the factory floor.',
    competencies: ['Lean Manufacturing & Waste Elimination', 'Six Sigma & Quality Management', 'Production Planning & Scheduling', 'Supply Chain & Procurement', 'Cost Engineering & Manufacturing Finance', 'EHS', 'New Product Introduction', 'Plant Leadership & Workforce Management', 'Strategy', 'Leadership & Management', 'Marketing in an AI World', 'Global Business Context'],
    outcomes: ['Lead plant operations end to end', 'Apply lean and six sigma to real problems', 'Manage supply chains and procurement', 'Lead frontline teams through change', 'Graduate with an EU-accredited MBA'],
    mentors: [MENTORS.hasit, MENTORS.yash, MENTORS.prantik, MENTORS.jason, MENTORS.gaurav],
  },
  'PGP in Supply Chain Management': {
    school: 'School of Manufacturing', schoolColor: '#14B8A6', tier: 'PGP', price: '$3,000–$4,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Master the end-to-end supply chain.',
    competencies: ['Supply Chain & Procurement', 'Logistics & Distribution Operations', 'Demand Planning & Inventory Optimisation', 'Cost Engineering & Manufacturing Finance', 'Marketing in an AI World', 'Global Business Context'],
    outcomes: ['Design and manage multi-tier supply chains', 'Optimise inventory and demand planning', 'Handle procurement and vendor risk', 'Understand global logistics and trade compliance', 'Apply cost engineering to reduce waste'],
    mentors: [MENTORS.hasit, MENTORS.yash, MENTORS.prantik, MENTORS.gaurav, MENTORS.john],
  },
  'PGP in Industrial AI & Industry 4.0': {
    school: 'School of Manufacturing', schoolColor: '#14B8A6', tier: 'PGP', price: '$4,000–$5,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Bring AI into the factory. Build the smart plant.',
    competencies: ['Industrial AI & Predictive Maintenance', 'Industry 4.0 & Digital Twins', 'Computer Vision & Multimodal AI', 'AI Tools for Professionals', 'Data Analysis & Interpretation', 'Marketing in an AI World'],
    outcomes: ['Design IIoT sensor systems', 'Build predictive maintenance models', 'Create digital twins for factory monitoring', 'Apply computer vision on the production line', 'Build a factory digitisation roadmap'],
    mentors: [MENTORS.hasit, MENTORS.yash, MENTORS.shavin, MENTORS.sarvesh, MENTORS.prantik],
  },
  'PGP in Lean & Operational Excellence': {
    school: 'School of Manufacturing', schoolColor: '#14B8A6', tier: 'PGP', price: '$3,000–$4,000', duration: '6 months', credential: 'PGP Certificate',
    tagline: 'Cut waste. Improve quality. Run a tighter operation.',
    competencies: ['Lean Manufacturing & Waste Elimination', 'Six Sigma & Quality Management', 'Production Planning & Scheduling', 'EHS', 'Plant Leadership & Workforce Management', 'Leadership & Management'],
    outcomes: ['Run Kaizen events and value stream maps', 'Apply DMAIC to quality problems', 'Manage OEE and production schedules', 'Lead frontline teams through change', 'Build a culture of continuous improvement'],
    mentors: [MENTORS.hasit, MENTORS.prantik, MENTORS.jason, MENTORS.gaurav, MENTORS.john],
  },
  'Certificate in Lean Operations': {
    school: 'School of Manufacturing', schoolColor: '#14B8A6', tier: 'CERT', price: '$1,500–$2,000', duration: '2 months', credential: 'Competency Certificate',
    tagline: 'The lean fundamentals every ops person needs.',
    competencies: ['Lean Manufacturing & Waste Elimination', 'Six Sigma & Quality Management', 'EHS'],
    outcomes: ['Identify and eliminate the 8 wastes', 'Apply DMAIC to quality problems', 'Build a safety-first operations culture'],
    mentors: [MENTORS.hasit, MENTORS.yash, MENTORS.prantik, MENTORS.gaurav, MENTORS.john],
  },
}

// ── Guided chip flows per school ─────────────────────────────────────────
const SCHOOL_CHIPS: Record<string, { question: string; chips: string[] }> = {
  'School of Business': {
    question: "Love it. What's your main focus within business?",
    chips: [
      'I want to build a product',
      'I want to grow a startup or brand',
      'I want to lead a team or company',
      'I want to get better at GTM & distribution',
      'I want a full MBA in business',
      'I want to master strategy & operations',
    ],
  },
  'School of Finance': {
    question: "Great choice. What area of finance excites you most?",
    chips: [
      'I want to get into Venture Capital',
      'I want to break into Investment Banking',
      'I want to understand FinTech & digital finance',
      'I want to master financial modelling',
      'I want a full MBA in finance',
      'I want to understand markets & investing',
    ],
  },
  'School of AI & Technology': {
    question: "Exciting space. What do you want to do with AI?",
    chips: [
      'I want to build AI agents & products',
      'I want to work with data & analytics',
      'I want to lead AI strategy in my org',
      'I want to automate workflows with AI',
      'I want a full MBA in AI & tech',
      'I want to understand AI from the ground up',
    ],
  },
  'School of Manufacturing': {
    question: "Good call. What's your focus in manufacturing or operations?",
    chips: [
      'I want to master lean & ops excellence',
      'I want to manage supply chains',
      'I want to bring AI into manufacturing',
      'I want to lead a plant or factory floor',
      'I want a full MBA in manufacturing',
      'I want to get into industrial operations',
    ],
  },
  'Build Your Own Degree': {
    question: "Love it — let's build your personalised path. What areas do you want to focus on?",
    chips: [
      'AI & technology skills',
      'Business & entrepreneurship',
      'Finance & investing',
      'Leadership & strategy',
      'Marketing & growth',
      'Manufacturing & operations',
    ],
  },
}

// Maps focus chips to programs
const DIRECT_RECOMMENDATIONS: Record<string, string> = {
  'I want to build a product':                        'PM MBA',
  'I want to grow a startup or brand':                'PGP in Growth',
  'I want to lead a team or company':                 'PGP in Strategy & Leadership',
  'I want to get better at GTM & distribution':       'Certificate in Distribution & Reach',
  'I want a full MBA in business':                    'PM MBA',
  'I want to master strategy & operations':           'PGP in Strategy & Leadership',
  'I want to get into Venture Capital':               'PGP in Venture Capital',
  'I want to break into Investment Banking':          'PGP in Investment Banking',
  'I want to understand FinTech & digital finance':   'PGP in FinTech',
  'I want to master financial modelling':             'Certificate in Financial Modelling',
  'I want a full MBA in finance':                     'Finance MBA',
  'I want to understand markets & investing':         'Finance MBA',
  'I want to build AI agents & products':             'PGP in AI Agents',
  'I want to work with data & analytics':             'PGP in Data & Analytics',
  'I want to lead AI strategy in my org':             'PGP in AI Strategy for Leaders',
  'I want to automate workflows with AI':             'Certificate in Automation & No-Code',
  'I want a full MBA in AI & tech':                   'AI MBA',
  'I want to understand AI from the ground up':       'PGP in AI Agents',
  'I want to master lean & ops excellence':           'PGP in Lean & Operational Excellence',
  'I want to manage supply chains':                   'PGP in Supply Chain Management',
  'I want to bring AI into manufacturing':            'PGP in Industrial AI & Industry 4.0',
  'I want to lead a plant or factory floor':          'Manufacturing MBA',
  'I want a full MBA in manufacturing':               'Manufacturing MBA',
  'I want to get into industrial operations':         'PGP in Lean & Operational Excellence',
}

const SCHOOL_NAMES = ['School of Business', 'School of Finance', 'School of AI & Technology', 'School of Manufacturing', 'Build Your Own Degree']
const SCHOOL_EMOJIS: Record<string, string> = {
  'School of Business': '🟠',
  'School of Finance': '🔵',
  'School of AI & Technology': '🟣',
  'School of Manufacturing': '🟢',
  'Build Your Own Degree': '⚡',
}

// ── Generic competencies pool ──────────────────────────────────────────────
const GENERIC_COMPS = [
  'Strategy', 'Leadership & Management', 'Communication & Storytelling',
  'Data Analysis & Interpretation', 'AI Tools for Professionals',
  'Marketing in an AI World', 'Entrepreneurial Thinking',
  'Negotiation & Influence', 'Digital Transformation',
  'Sales & Revenue', 'Ethics, Sustainability & ESG', 'Global Business Context',
]

// Specialised competencies per area interest
const BYO_AREA_COMPS: Record<string, string[]> = {
  'AI & technology skills':       ['AI & LLM Fundamentals', 'AI Agents & Agentic Systems', 'Prompt Engineering & LLM APIs', 'AI Product Management', 'Machine Learning for Business', 'Data Strategy & Engineering', 'Automation & No-Code Systems', 'AI for Business Transformation', 'AI Ethics Safety & Governance', 'NLP & Language AI Applications', 'Business Intelligence & Dashboarding', 'Computer Vision & Multimodal AI'],
  'Business & entrepreneurship':  ['Product Management Fundamentals', 'Product Strategy & Vision', 'User Research & Insight', 'Go-to-Market Strategy', 'Metrics & Product Analytics', 'Operations & Scaling', 'Distribution & Reach', 'Consumer Psychology & Behaviour', 'Monetisation & Pricing', 'Retention & Engagement', 'Stakeholder Management', 'Growth Marketing & Acquisition'],
  'Finance & investing':          ['Financial Modelling & Valuation', 'Corporate Finance & Capital Structure', 'Investment Analysis & Portfolio Mgmt', 'Venture Capital & Startup Finance', 'Investment Banking & Deal Execution', 'Financial Markets & Macro Economics', 'Risk Management & Compliance', 'FinTech & Digital Finance', 'Accounting & Financial Reporting', 'Startup Fundraising & Investor Relations', 'Private Equity & Alt Investments', 'ESG Investing & Sustainable Finance'],
  'Leadership & strategy':        ['Product Strategy & Vision', 'Stakeholder Management', 'Operations & Scaling', 'Plant Leadership & Workforce Management', 'New Product Introduction', 'Cost Engineering & Manufacturing Finance'],
  'Marketing & growth':           ['Growth Marketing & Acquisition', 'Retention & Engagement', 'Distribution & Reach', 'Monetisation & Pricing', 'Metrics & Product Analytics', 'Go-to-Market Strategy', 'Consumer Psychology & Behaviour'],
  'Manufacturing & operations':   ['Lean Manufacturing & Waste Elimination', 'Six Sigma & Quality Management', 'Supply Chain & Procurement', 'Logistics & Distribution Operations', 'Demand Planning & Inventory Optimisation', 'Industrial AI & Predictive Maintenance', 'Industry 4.0 & Digital Twins', 'Production Planning & Scheduling', 'Cost Engineering & Manufacturing Finance', 'Environmental Health & Safety', 'New Product Introduction', 'Plant Leadership & Workforce Management'],
}

function buildByoPath(areas: string[]) {
  // Collect specialised comps from selected areas (deduplicated)
  const specPool: string[] = []
  areas.forEach(area => {
    (BYO_AREA_COMPS[area] || []).forEach(c => { if (!specPool.includes(c)) specPool.push(c) })
  })

  // Pick generics relevant to areas
  const genericPool = [...GENERIC_COMPS]

  // MBA: 6 generic + 6 specialised = 12
  const mbaSpec = specPool.slice(0, 6)
  const mbaGen = genericPool.slice(0, 6)

  // PGP: 3 generic + 3 specialised = 6
  const pgpSpec = specPool.slice(0, 3)
  const pgpGen = genericPool.slice(0, 3)

  // CERT: 1 generic + 2 specialised = 3
  const certSpec = specPool.slice(0, 2)
  const certGen = genericPool.slice(0, 1)

  return { mbaSpec, mbaGen, pgpSpec, pgpGen, certSpec, certGen }
}

function ByoRecommendationPage({ areas, onBack }: { areas: string[]; onBack: () => void }) {
  const { mbaSpec, mbaGen, pgpSpec, pgpGen, certSpec, certGen } = buildByoPath(areas)
  const areaLabel = areas.join(' · ')

  const tiers = [
    {
      name: 'Your MBA Path', tier: 'MBA', price: '$5,000–$10,000', duration: '12–18 months',
      credential: 'MBA Degree (EU Accredited via Woolf University)',
      desc: 'The full degree. Deep expertise across your chosen areas with an internationally recognised MBA.',
      color: '#FF6A00',
      spec: mbaSpec, gen: mbaGen,
    },
    {
      name: 'Your PGP Path', tier: 'PGP', price: '$3,000–$5,000', duration: '6–9 months',
      credential: 'Post Graduate Programme Certificate',
      desc: 'Focused upskilling. Get job-ready in your chosen areas without the full MBA commitment.',
      color: '#A855F7',
      spec: pgpSpec, gen: pgpGen,
    },
    {
      name: 'Your Certificate Path', tier: 'CERT', price: '$1,500–$2,000', duration: '2–3 months',
      credential: 'Competency Certificate',
      desc: 'Fast and targeted. Learn exactly what you need in the shortest time.',
      color: '#14B8A6',
      spec: certSpec, gen: certGen,
    },
  ]

  return (
    <div style={{ background: '#05050A', minHeight: '100vh', color: '#E8E6E0', fontFamily: 'DM Sans,sans-serif' }}>
      {/* Back bar */}
      <div style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#AAA', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Mono,monospace', letterSpacing: '0.08em' }}>← Back to Maya</button>
        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', color: '#333', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Your personalised degree path</span>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#FF6A00', border: '1px solid rgba(255,106,0,0.3)', padding: '5px 12px', borderRadius: '100px' }}>⚡ Build Your Own Degree</span>
        </div>
        <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 'clamp(28px,4vw,52px)', fontWeight: '800', letterSpacing: '-0.03em', color: '#F0EDE6', lineHeight: '1.1', marginBottom: '12px' }}>
          Your personalised<br /><span style={{ background: 'linear-gradient(90deg,#FF6A00,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mentogram path.</span>
        </h1>
        <p style={{ fontSize: '16px', color: '#777', marginBottom: '48px' }}>Based on your interests in <span style={{ color: '#AAA' }}>{areaLabel}</span> — here are your 3 options, from fastest to fullest.</p>

        {/* 3 tier cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
          {tiers.map((t, ti) => (
            <div key={t.tier} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${t.color}25`, borderRadius: '20px', overflow: 'hidden' }}>
              {/* Tier header */}
              <div style={{ padding: '28px 32px', borderBottom: `1px solid ${t.color}15`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' as const }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: t.color, border: `1px solid ${t.color}40`, padding: '4px 12px', borderRadius: '100px' }}>{t.tier}</span>
                    {ti === 0 && <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '4px 10px', borderRadius: '100px' }}>Full Degree</span>}
                  </div>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '22px', fontWeight: '800', color: '#F0EDE6', marginBottom: '6px' }}>{t.name}</div>
                  <div style={{ fontSize: '14px', color: '#777', maxWidth: '500px' }}>{t.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: t.color, marginBottom: '4px' }}>{t.price}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>{t.duration}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '8px', color: '#444', letterSpacing: '0.08em' }}>{t.credential}</div>
                </div>
              </div>

              {/* Competencies */}
              <div style={{ padding: '24px 32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Specialised */}
                  <div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: t.color, marginBottom: '12px' }}>Specialised · {t.spec.length} competencies</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {t.spec.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: `${t.color}06`, border: `1px solid ${t.color}15`, borderRadius: '8px' }}>
                          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '8px', color: t.color, opacity: 0.5, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                          <span style={{ fontSize: '12px', color: '#C0BDB7' }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Generic */}
                  <div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#555', marginBottom: '12px' }}>Generic · {t.gen.length} competencies</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {t.gen.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '8px', color: '#444', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                          <span style={{ fontSize: '12px', color: '#777' }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply CTA per tier */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <a href="/apply" style={{ display: 'inline-block', background: t.color, color: '#fff', fontWeight: '700', fontSize: '13px', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', letterSpacing: '-0.01em' }}>
                    Apply for {t.tier} →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>All paths include</div>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>Maya AI mentor 24/7 · EU-accredited credential via Woolf University · Global immersions in Singapore, Dubai, San Francisco, Mumbai, Shanghai & Bali</div>
        </div>
      </div>
    </div>
  )
}

type Message = { role: 'user' | 'assistant'; content: string }

function AdmissionsChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm Maya 👋 Welcome to Mentogram — the world's first AI-native university. I'll help you find the perfect program in under 2 minutes. Just pick your area below and I'll guide you from there!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [showPage, setShowPage] = useState(false)
  // stage: 'school' | 'focus' | 'byo' | 'probing' | 'done'
  const [stage, setStage] = useState<'school' | 'focus' | 'byo' | 'probing' | 'done'>('school')
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [byoSelections, setByoSelections] = useState<string[]>([])
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, loading])

  function processReply(raw: string): { display: string; program: string | null } {
    const match = raw.match(/RECOMMEND:\[?([^\]\n]+)\]?/)
    if (match) {
      const display = raw.replace(/RECOMMEND:\[?[^\]\n]+\]?/, '').trim()
      return { display, program: match[1].trim() }
    }
    return { display: raw, program: null }
  }

  function chipColor(stage: string) {
    if (stage === 'school') return { bg: 'rgba(255,106,0,0.08)', border: 'rgba(255,106,0,0.25)', text: '#FF9A00' }
    if (!selectedSchool) return { bg: 'rgba(255,106,0,0.08)', border: 'rgba(255,106,0,0.25)', text: '#FF9A00' }
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      'School of Business':       { bg: 'rgba(255,106,0,0.08)',  border: 'rgba(255,106,0,0.3)',  text: '#FF9A00' },
      'School of Finance':        { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', text: '#60A5FA' },
      'School of AI & Technology':{ bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: '#C084FC' },
      'School of Manufacturing':  { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.3)', text: '#2DD4BF' },
    }
    return colors[selectedSchool] ?? { bg: 'rgba(255,106,0,0.08)', border: 'rgba(255,106,0,0.25)', text: '#FF9A00' }
  }

  async function handleSchoolChip(school: string) {
    const userMsg: Message = { role: 'user', content: `${SCHOOL_EMOJIS[school]} ${school}` }
    const schoolQ = SCHOOL_CHIPS[school]
    const mayaMsg: Message = { role: 'assistant', content: schoolQ.question }
    setMessages(m => [...m, userMsg, mayaMsg])
    setSelectedSchool(school)
    setStage(school === 'Build Your Own Degree' ? 'byo' : 'focus')
  }

  function handleByoToggle(area: string) {
    setByoSelections(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  async function handleByoSubmit() {
    if (byoSelections.length === 0) return
    const selectionText = byoSelections.join(', ')
    const userMsg: Message = { role: 'user', content: `I want to focus on: ${selectionText}` }
    const next: Message[] = [...messages, userMsg]
    setMessages(next)
    setStage('probing')
    setLoading(true)
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const raw = data.reply ?? "Got it — one more thing:"
      const { display, program } = processReply(raw)
      setMessages(m => [...m, { role: 'assistant', content: display }])
      if (program) { setRecommendation(program); setStage('done') }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Having trouble connecting — please try again!" }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  async function handleFocusChip(focus: string) {
    const userMsg: Message = { role: 'user', content: focus }
    const next: Message[] = [...messages, userMsg]
    setMessages(next)
    setStage('probing') // new stage — waiting for probing answer
    setLoading(true)
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const raw = data.reply ?? "Got it — one more thing:"
      const { display, program } = processReply(raw)
      setMessages(m => [...m, { role: 'assistant', content: display }])
      if (program) setRecommendation(program)
      setStage('done') // always show button for BYO after Maya responds
      // otherwise stay in probing stage so they can type their answer
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Having trouble connecting — please try again!" }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    if (stage !== 'probing') setStage('done')
    const next: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const raw = data.reply ?? "Something went wrong, please try again!"
      const { display, program } = processReply(raw)
      setMessages(m => [...m, { role: 'assistant', content: display }])
      if (program) {
        setRecommendation(program)
        setStage('done')
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Having trouble connecting — please try again!" }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  if (showPage && selectedSchool === 'Build Your Own Degree') {
    return <ByoRecommendationPage areas={byoSelections} onBack={() => setShowPage(false)} />
  }

  if (showPage && recommendation) {
    return <RecommendationPage programName={recommendation} onBack={() => setShowPage(false)} />
  }

  const c = chipColor(stage)

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 60px rgba(255,106,0,0.06)', textAlign: 'left' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,106,0,0.04)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🎓</div>
        <div>
          <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: '700', fontSize: '14px', color: '#F0EDE6' }}>Maya · Admissions Guide</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#4ADE80', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Online · Mentogram AI</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>No login needed</div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} style={{ height: '300px', overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-end' }}>
            {m.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>🎓</div>
            )}
            <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? '#FF6A00' : 'rgba(255,255,255,0.05)', border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', fontSize: '14px', color: m.role === 'user' ? '#fff' : '#E8E6E0', lineHeight: '1.65', fontFamily: 'DM Sans,sans-serif' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>🎓</div>
            <div style={{ padding: '12px 18px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0,1,2].map(d => <span key={d} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6A00', opacity: 0.7, animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        {/* See program / path button */}
        {(recommendation || (selectedSchool === 'Build Your Own Degree' && stage === 'done')) && !loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '38px' }}>
            <button onClick={() => setShowPage(true)} style={{ background: selectedSchool === 'Build Your Own Degree' ? 'linear-gradient(135deg,#FF6A00,#A855F7)' : '#FF6A00', color: '#fff', fontWeight: '700', fontSize: '14px', padding: '14px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}>
              {selectedSchool === 'Build Your Own Degree' ? 'See your personalised path →' : 'See your program plan →'}
            </button>
          </div>
        )}
        <div ref={null} />
      </div>

      {/* Chips */}
      {stage === 'school' && (
        <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {SCHOOL_NAMES.filter(s => s !== 'Build Your Own Degree').map(school => {
            const schoolMeta: Record<string, { desc: string; color: string }> = {
              'School of Business':        { desc: 'Product · Growth · Strategy · GTM',         color: '#FF6A00' },
              'School of Finance':         { desc: 'VC · Investment Banking · FinTech · Markets', color: '#3B82F6' },
              'School of AI & Technology': { desc: 'AI Agents · Data · Automation · Strategy',   color: '#A855F7' },
              'School of Manufacturing':   { desc: 'Lean · Supply Chain · Industrial AI · Ops',  color: '#14B8A6' },
            }
            const meta = schoolMeta[school]
            return (
              <button key={school} onClick={() => handleSchoolChip(school)}
                style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}30`, borderRadius: '14px', padding: '16px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '6px' }}
                onMouseOver={e => { e.currentTarget.style.background = `${meta.color}15`; e.currentTarget.style.borderColor = `${meta.color}60` }}
                onMouseOut={e => { e.currentTarget.style.background = `${meta.color}08`; e.currentTarget.style.borderColor = `${meta.color}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{SCHOOL_EMOJIS[school]}</span>
                  <span style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: '700', fontSize: '13px', color: '#F0EDE6' }}>{school}</span>
                </div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: meta.color, letterSpacing: '0.06em', opacity: 0.8 }}>{meta.desc}</div>
              </button>
            )
          })}
          {/* BYO — full width */}
          <button onClick={() => handleSchoolChip('Build Your Own Degree')}
            style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '14px', padding: '16px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: '700', fontSize: '13px', color: '#F0EDE6', marginBottom: '3px' }}>Build Your Own Degree</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>Mix competencies from any school — Maya designs your path</div>
            </div>
          </button>
        </div>
      )}

      {stage === 'focus' && selectedSchool && (
        <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {SCHOOL_CHIPS[selectedSchool].chips.map(chip => (
            <button key={chip} onClick={() => handleFocusChip(chip)}
              style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', color: c.text, fontSize: '12px', padding: '11px 14px', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: '500', textAlign: 'left', lineHeight: '1.4', transition: 'opacity 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {stage === 'byo' && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Pick as many as you like</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {SCHOOL_CHIPS['Build Your Own Degree'].chips.map(area => {
              const selected = byoSelections.includes(area)
              return (
                <button key={area} onClick={() => handleByoToggle(area)}
                  style={{ background: selected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: selected ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: selected ? '#F0EDE6' : 'rgba(255,255,255,0.5)', fontSize: '12px', padding: '11px 14px', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: selected ? '700' : '500', textAlign: 'left', lineHeight: '1.4', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '4px', border: selected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.25)', background: selected ? '#fff' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#000' }}>{selected ? '✓' : ''}</span>
                  {area}
                </button>
              )
            })}
          </div>
          <button onClick={handleByoSubmit} disabled={byoSelections.length === 0}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: byoSelections.length > 0 ? '#FF6A00' : 'rgba(255,106,0,0.2)', border: 'none', color: byoSelections.length > 0 ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans,sans-serif', fontWeight: '700', fontSize: '14px', cursor: byoSelections.length > 0 ? 'pointer' : 'default', transition: 'all 0.2s' }}>
            {byoSelections.length === 0 ? 'Select at least one area' : `Build my path with ${byoSelections.length} area${byoSelections.length > 1 ? 's' : ''} →`}
          </button>
        </div>
      )}

      {/* Input — show after chips or if user wants to type freely */}
      <div style={{ padding: '12px 24px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={stage === 'school' ? 'Or type your goal...' : stage === 'focus' ? 'Or describe what you want...' : stage === 'probing' ? 'Tell Maya more...' : 'Ask Maya anything...'}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#F0EDE6', fontSize: '14px', fontFamily: 'DM Sans,sans-serif', outline: 'none' }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{ width: '44px', height: '44px', borderRadius: '12px', background: loading || !input.trim() ? 'rgba(255,106,0,0.3)' : '#FF6A00', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, transition: 'background 0.2s' }}>→</button>
      </div>

      <div style={{ padding: '8px 24px 14px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#333', letterSpacing: '0.08em' }}>
          Powered by Mentogram AI · <a href="/apply" style={{ color: '#FF6A00', textDecoration: 'none' }}>Apply directly →</a>
        </span>
      </div>

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
      `}</style>
    </div>
  )
}

function RecommendationPage({ programName, onBack }: { programName: string; onBack: () => void }) {
  const prog = PROGRAM_DATA[programName]
  if (!prog) return null

  return (
    <div style={{ background: '#05050A', minHeight: '100vh', color: '#E8E6E0', fontFamily: 'DM Sans,sans-serif', padding: '0' }}>
      {/* Back bar */}
      <div style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#AAA', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Mono,monospace', letterSpacing: '0.08em' }}>← Back to Maya</button>
        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', color: '#333', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Your personalised program plan</span>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 40px' }}>

        {/* School + tier badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: prog.schoolColor, border: `1px solid ${prog.schoolColor}40`, padding: '5px 12px', borderRadius: '100px' }}>{prog.school}</span>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#AAA', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '100px' }}>{prog.tier}</span>
        </div>

        {/* Hero */}
        <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 'clamp(36px,5vw,64px)', fontWeight: '800', letterSpacing: '-0.03em', color: '#F0EDE6', lineHeight: '1.05', marginBottom: '16px' }}>{programName}</h1>
        <p style={{ fontSize: '20px', color: '#AAA', lineHeight: '1.6', marginBottom: '48px', maxWidth: '600px' }}>{prog.tagline}</p>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '56px' }}>
          {[
            { label: 'Price', value: prog.price },
            { label: 'Duration', value: prog.duration },
            { label: 'Credential', value: prog.credential },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#444', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#F0EDE6' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Outcomes */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: prog.schoolColor, marginBottom: '20px' }}>What you'll walk away with</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {prog.outcomes.map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${prog.schoolColor}18`, border: `1px solid ${prog.schoolColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: prog.schoolColor, flexShrink: 0, marginTop: '1px' }}>✓</div>
                <span style={{ fontSize: '16px', color: '#D0CEC8', lineHeight: '1.5' }}>{o}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competencies */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: prog.schoolColor, marginBottom: '20px' }}>What you'll learn · {prog.competencies.length} competencies</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
            {prog.competencies.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: prog.schoolColor, opacity: 0.6, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: '13px', color: '#C0BDB7' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentors */}
          {prog.mentors.length > 0 && (
          <div style={{ marginBottom: '56px' }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: prog.schoolColor, marginBottom: '20px' }}>Some of your mentors</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
              {prog.mentors.map((m, i) => (
                <div key={i} style={{ padding: '20px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${prog.schoolColor}30`, flexShrink: 0, background: `${prog.schoolColor}15`, position: 'relative' }}>
                    <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '4px', lineHeight: '1.2' }}>{m.name}</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '8px', color: '#555', letterSpacing: '0.06em', lineHeight: '1.5' }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

        {/* CTA */}
        <div style={{ background: `${prog.schoolColor}08`, border: `1px solid ${prog.schoolColor}25`, borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#F0EDE6', marginBottom: '8px' }}>Ready to start?</div>
          <div style={{ fontSize: '15px', color: '#777', marginBottom: '28px' }}>Rolling admissions — seats are limited per cohort.</div>
          <a href="/apply" style={{ display: 'inline-block', background: prog.schoolColor, color: '#fff', fontWeight: '700', fontSize: '16px', padding: '16px 48px', borderRadius: '12px', textDecoration: 'none', letterSpacing: '-0.01em' }}>Apply Now →</a>
        </div>
      </div>
    </div>
  )
}


// ── Page ───────────────────────────────────────────────────────────────────

type GalleryItem = { src: string | null; city: string; label: string; bg: string }
type MentorData  = { img: string | null; initials: string; name: string; role: string; company: string; expertise: string; programs: string[]; col: string }
type StudentData = { img: string | null; initials: string; name: string; before: string; after: string; program: string; city: string; col: string; outcome: string }

// ── MentorCard component ───────────────────────────────────────────────────
function MentorCard({ m }: { m: MentorData }) {
  return (
    <div style={{ width:'240px', background:'rgba(255,255,255,0.02)', border:`1px solid ${m.col}22`, borderRadius:'14px', overflow:'hidden', flexShrink:0 }}>
      <div style={{ position:'relative', height:'200px', aspectRatio:'1/1', background:`linear-gradient(145deg,${m.col}10,#05050A)` }}>
        {m.img
          ? <img src={m.img} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 15%', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:`${m.col}18`, border:`2px solid ${m.col}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'800', color:m.col, fontFamily:'Playfair Display,serif' }}>{m.initials}</div>
            </div>
        }
        <div style={{ position:'absolute', top:'10px', right:'10px', display:'flex', flexDirection:'column', gap:'3px' }}>
          {m.programs.map(p => (
            <span key={p} style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', textTransform:'uppercase' as const, letterSpacing:'0.07em', padding:'3px 8px', borderRadius:'100px', background:`${m.col}20`, color:m.col, border:`1px solid ${m.col}30`, display:'block', whiteSpace:'nowrap' as const }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ padding:'16px' }}>
        <div className="pf" style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{m.name}</div>
        <div style={{ fontSize:'11px', color:m.col, fontWeight:'500', marginBottom:'1px' }}>{m.role}</div>
        <div style={{ fontSize:'11px', color:'#888', marginBottom:'10px' }}>{m.company}</div>
        <div className="mono" style={{ fontSize:'9px', color:'#444', textTransform:'uppercase' as const, letterSpacing:'0.05em', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'10px', lineHeight:'1.5' }}>{m.expertise}</div>
      </div>
    </div>
  )
}

function StudentCard({ s }: { s: StudentData }) {
  return (
    <div style={{ width:'220px', flexShrink:0, background:'rgba(255,255,255,0.02)', border:`1px solid ${s.col}18`, borderRadius:'14px', overflow:'hidden' }}>
      <div style={{ height:'220px', background:`linear-gradient(145deg,${s.col}10,#05050A)`, position:'relative' }}>
        {s.img
          ? <img src={s.img} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:`${s.col}18`, border:`2px solid ${s.col}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'800', color:s.col, fontFamily:'Playfair Display,serif' }}>{s.initials}</div>
            </div>
        }
        <div style={{ position:'absolute', top:'8px', right:'8px', background:`${s.col}20`, border:`1px solid ${s.col}30`, borderRadius:'6px', padding:'2px 7px' }}>
          <span className="mono" style={{ fontSize:'7px', color:s.col, textTransform:'uppercase' as const, letterSpacing:'0.06em' }}>{s.program}</span>
        </div>
      </div>
      <div style={{ padding:'14px' }}>
        <div className="pf" style={{ fontSize:'13px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{s.name}</div>
        <div className="mono" style={{ fontSize:'9px', color:'#555', letterSpacing:'0.05em', marginBottom:'10px' }}>{s.city}</div>
        <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'10px', marginBottom:'10px' }}>
          <div style={{ fontSize:'10px', color:'#444', marginBottom:'5px', lineHeight:'1.4', textDecoration:'line-through' }}>{s.before}</div>
          <div style={{ fontSize:'11px', color:s.col, fontWeight:'600', lineHeight:'1.4' }}>→ {s.after}</div>
        </div>
        <div style={{ background:`${s.col}10`, border:`1px solid ${s.col}20`, borderRadius:'100px', padding:'3px 10px', textAlign:'center' }}>
          <span className="mono" style={{ fontSize:'8px', color:s.col, textTransform:'uppercase' as const, letterSpacing:'0.07em' }}>{s.outcome}</span>
        </div>
      </div>
    </div>
  )
}

// ── Data arrays defined OUTSIDE JSX — no type assertions needed ────────────

const galleryRow1: GalleryItem[] = [
  { src:'/images/immersions/singapore-1.jpg', city:'Singapore',    label:'Jan 2025', bg:'linear-gradient(145deg,#1a0900,#2d1800)' },
  { src:'/images/immersions/dubai-1.jpg',     city:'Dubai',        label:'Feb 2025', bg:'linear-gradient(145deg,#001020,#002540)' },
  { src:'/images/immersions/sf-1.jpg',        city:'San Francisco',label:'Mar 2025', bg:'linear-gradient(145deg,#100a1a,#201530)' },
  { src:'/images/immersions/bali-1.jpg',      city:'New York',         label:'Apr 2025', bg:'linear-gradient(145deg,#001500,#002800)' },
  { src:'/images/immersions/nyc-1.jpg',       city:'China',     label:'May 2025', bg:'linear-gradient(145deg,#0a0a1a,#15153a)' },
  { src:'/images/immersions/london-1.jpg',    city:'India',       label:'Reyo - Indian Airfoce', bg:'linear-gradient(145deg,#1a1000,#302000)' },
]
const galleryRow1Full: GalleryItem[] = [...galleryRow1, ...galleryRow1]

const galleryRow2: GalleryItem[] = [
  { src:'/images/immersions/mumbai-1.jpg',    city:'Mumbai',      label:'Jul 2025 · 63 students',   bg:'linear-gradient(145deg,#0a0010,#180025)' },
  { src:'/images/immersions/singapore-2.jpg', city:'Singapore',   label:'Capstone Day · Aug 2025',  bg:'linear-gradient(145deg,#001a10,#003020)' },
  { src:'/images/immersions/dubai-2.jpg',     city:'Dubai',       label:'Mentor Summit · Sep 2025', bg:'linear-gradient(145deg,#1a0a00,#301800)' },
  { src:'/images/immersions/bali-2.jpg',      city:'IIT Bombay',        label:'AI Immersion · Oct 2025',       bg:'linear-gradient(145deg,#001018,#002030)' },
  { src:'/images/immersions/london-2.jpg',    city:'London',      label:'AI Bootcamp · Nov 2025',   bg:'linear-gradient(145deg,#100010,#200020)' },
  { src:'/images/immersions/shanghai-1.jpg',  city:'Shanghai',    label:'Asia Summit · Dec 2025',   bg:'linear-gradient(145deg,#0a1000,#182000)' },
]
const galleryRow2Full: GalleryItem[] = [...galleryRow2, ...galleryRow2]

const mentorRow1: MentorData[] = [
  { img:'/images/mentors/andrew-chow.jpg',      initials:'AC', name:'Andrew Chow',      role:'Managing Partner, Co-founder',        company:'Asia Pro Ventures',               expertise:'Consumer product · Discovery · Growth',  programs:['Singapore'],               col:'#FF6A00' },
  { img:'/images/mentors/andrew-momat.jpg',     initials:'AM', name:'Andrew Momat',     role:'Chief Product Officer',    company:'Razorpay · Ex-Flipkart',expertise:'Payments · B2B · Scaling',               programs:['Austrailia'],  col:'#60A5FA' },
  { img:'/images/mentors/bhavin-mehta.jpg',     initials:'BM', name:'Bhavin Mehta',     role:'Managing Director, APAC',               company:'Helpling',                expertise:'AI implementation · Leadership',          programs:['Singapore'],         col:'#A78BFA' },
  { img:'/images/mentors/daniel-ling.jpg',      initials:'DL', name:'Daniel Ling',      role:'ex-VP, Founder',              company:'DBS, Lazada',        expertise:'Growth loops · Retention · PLG',         programs:['Singapore'],   col:'#34D399' },
  { img:'/images/mentors/edmund-tan.jpg',       initials:'ET', name:'Edmund Tan',       role:'Investor and VC', company:'Family Office',         expertise:'Education · Scale',            programs:['South East Asia'],               col:'#2DD4BF' },
  { img:'/images/mentors/gaurav-thakkar.jpg',   initials:'GT', name:'Gaurav Thakkar',   role:'Managing Partner',      company:'Silicon Road Ventures, ex-Rockstud Capital',                 expertise:'Consumer · Ops · Growth',           programs:['India'],               col:'#FB923C' },
]
const mentorRow1Full: MentorData[] = [...mentorRow1, ...mentorRow1]

const mentorRow2: MentorData[] = [
  { img:'/images/mentors/jason-kraus.jpg',      initials:'JK', name:'Jason Kraus',      role:'Founder and VC',      company:'EQX Fund',         expertise:'Algo trading · Risk · Markets',           programs:['Boston'],         col:'#F59E0B' },
  { img:'/images/mentors/john-lim.jpg',         initials:'JL', name:'John Lim',         role:'Managing Partner',  company:'Meet Ventures',   expertise:'Brand · Performance · D2C',              programs:['Singapore'],         col:'#FB7185' },
  { img:'/images/mentors/justin-strackany.jpg', initials:'JS', name:'Justin Strackany', role:'General Partner',            company:'GTM Fund',            expertise:'EdTech · Consumer · B2C',                programs:['San Francisco'],               col:'#F97066' },
  { img:'/images/mentors/mayank-jain.jpg',      initials:'MJ', name:'Mayank Jain',      role:'Founder and Partner',         company:'Thinkuvate Ventures',                expertise:'Cybersecurity · Fintech · Risk',          programs:['Singapore'],         col:'#818CF8' },
  { img:'/images/mentors/prantik-mazumdar.jpg', initials:'PM', name:'Prantik Mazumdar', role:'Chief Financial Officer',  company:'Exited Founder, President',          expertise:'TIE Singapore',          programs:['Singapore'],           col:'#4ADE80' },
  { img:'/images/mentors/rajesh-shetty.jpg',    initials:'RS', name:'Rajesh Shetty',    role:'Founder and Investor',       company:'Silicon Valley Investments',               expertise:'Fintech growth · Product-led',            programs:['San Francisco'],   col:'#60A5FA' },
]
const mentorRow2Full: MentorData[] = [...mentorRow2, ...mentorRow2]

const mentorRow3: MentorData[] = [
  { img:'/images/mentors/rajesh-tever.jpg',     initials:'PK', name:'Prathamesh Kant',     role:'Vice President',     company:'Goldmand Sachs',          expertise:'Search · Ads · Consumer AI',             programs:['India'],               col:'#2DD4BF' },
  { img:'/images/mentors/renuka-belwalkar.jpg', initials:'RB', name:'Renuka Belwalkar', role:'Advisor',             company:'Forbes Recognized',             expertise:'D2C brand · Content · Performance',      programs:['New York'],         col:'#FB7185' },
  { img:'/images/mentors/ronak-chiripal.jpg',   initials:'RC', name:'Ronak Chiripal',   role:'Promoter, Director and CEO',        company:'Chiripal Group of Companies',      expertise:'Portfolio management · Equity',           programs:['India'], col:'#F59E0B' },
  { img:'/images/mentors/sarvash-malani.jpg',   initials:'SM', name:'Sarvash Malani',   role:'VC',      company:'Temasek',              expertise:'ML systems · AI product · Scale',        programs:['Singapore'],         col:'#A78BFA' },
  { img:'/images/mentors/shavin-goswami.jpg',   initials:'SG', name:'Shavin Goswami',   role:'Operations and Strategy',   company:'Meta',          expertise:'Marketplace · Consumer · Growth',         programs:['New York'],               col:'#FF6A00' },
  { img:'/images/mentors/shlok-jain.jpg',       initials:'SJ', name:'Shlok Jain',       role:'Product',               company:'Grab',      expertise:'0-to-1 · Fundraising · Strategy',        programs:['Singapore'], col:'#34D399' },
]
const mentorRow3Full: MentorData[] = [...mentorRow3, ...mentorRow3]

const mentorRow4: MentorData[] = [
  { img:'/images/mentors/sudeep-bhatter.jpg',   initials:'SB', name:'Sudeep Bhatter',   role:'Engineering Manager',      company:'Microsoft',             expertise:'AI engineering · Platform · Scale',       programs:['Seattle'],         col:'#60A5FA' },
  { img:'/images/mentors/sunil-kamath.jpg',     initials:'SK', name:'Sunil Kamath',     role:'Founder and Partner',   company:'Hustle Ventures',       expertise:'Consumer · Distribution · Partnerships',     programs:['India'], col:'#F97066' },
  { img:'/images/mentors/temple-fennel.jpg',    initials:'TF', name:'Temple Fennel',    role:'Venture Partner',             company:'Clean Energy Ventures',                  expertise:'Social products · Ads · Consumer AI',     programs:['New York'],col:'#818CF8' },
  { img:'/images/mentors/toyoyuki-ushioda.jpg', initials:'TU', name:'Toyoyuki Ushioda', role:'CFO Director,ex-VP',        company:'MapleTree Investments | $80B AUM ',              expertise:'Venture · Strategy · Japan-SEA markets',  programs:['Japan'], col:'#F59E0B' },
  { img:'/images/mentors/vansh-chiripal.jpg',   initials:'VC', name:'Vansh Chiripal',   role:'Promoter',           company:'Chiripal Group of Companies',                 expertise:'D2C growth · Performance · Brand',        programs:['India'],            col:'#FB7185' },
  { img:'/images/mentors/yash-shah.jpg',        initials:'YS', name:'Yash Shah',        role:'Head of AI, Cloud',          company:'Amazon Web Services',              expertise:'Payments · API products · B2B',           programs:['India'],  col:'#4ADE80' },
]
const mentorRow4Full: MentorData[] = [...mentorRow4, ...mentorRow4]

const students: StudentData[] = [
  { img:'/images/students/guliz.jpg',      initials:'AR', name:'Guliz Y',      before:'Student at NUS Singapore',    after:'Growth at Kavak.ai',             program:'PM MBA',       city:'Bangalore', col:'#FF6A00', outcome:'Placed in 3 months' },
  { img:'/images/students/shivam.jpg',    initials:'VS', name:'Shivam Pal',    before:'Data Scientist at Uola',    after:'Product at Mvaak.ai',      program:'AI Agents MBA',city:'Mumbai',    col:'#60A5FA', outcome:'Promoted internally' },
  { img:'/images/students/ananth.jpg',    initials:'PM', name:'Dr Ananth Srinivas',    before:'Managing Director, Hathar Services', after:'Founder at Cartmed',      program:'PM MBA',       city:'Singapore', col:'#A78BFA', outcome:'Revenue Generating' },
  { img:'/images/students/abhijith.jpg',    initials:'RS', name:'Abhijith Jajio',    before:'Lawyer',     after:'Founders Office, Series A Startup',   program:'PM MBA',       city:'Bengaluru',     col:'#34D399', outcome:'Career Switch' },
  { img:'/images/students/swarit.jpg',   initials:'NK', name:'Swarit Bharadwaj',   before:'Undergraduate Student',          after:'CTO at Influenzo',        program:'PM MBA',       city:'Hyderabad', col:'#F59E0B', outcome:'Profitable' },
  { img:'/images/students/alex.jpg',  initials:'AK', name:'Alex Hernandex', before:'Product Manager',         after:'Digital Transformation Lead, Meta',    program:'Growth MBA',   city:'Spain',      col:'#FB7185', outcome:'2x salary in 6 months' },
  { img:'/images/students/suraj.jpg',     initials:'SN', name:'Suraj Reddy',     before:'Student at NYU Stern', after:'Medtech Founder',   program:'AI Agents MBA',city:'Dubai',   col:'#2DD4BF', outcome:'Family Business Expansion' },
  { img:'/images/students/charles.jpg',      initials:'DM', name:'Charles Bohannan',      before:'Marketing Head',      after:'Growth Head, Wordful',    program:'PM MBA',       city:'San Francisco',    col:'#818CF8', outcome:'First job in 60 days' },
  { img:'/images/students/md.jpg',     initials:'TS', name:'Mohammed Elsifiwy',     before:'Finance Analyst',      after:'Series A Founder',               program:'PM MBA',       city:'Abu Dhabi',   col:'#FB923C', outcome:'Switched industry' },
  { img:'/images/students/sumana.jpg',   initials:'KP', name:'Sumana Mandal',   before:'Software Engineer',              after:"Founder",       program:'PM MBA',       city:'Kochi',     col:'#4ADE80', outcome:'Complete career change' },
  { img:'/images/students/reyo.jpg',  initials:'RD', name:'Reyo Augustine',      before:'Indian Airforce Pilot',   after:'Founder at Foliages',    program:'PM MBA',       city:'Bengaluru', col:'#FF6A00', outcome:'Profitable in 2 months' },
  { img:'/images/students/rakesh.jpg',      initials:'MK', name:'Rakesh Palyam',  before:'Associate Director at Zeta',  after:'Director, Ascendion',  program:'Strategy & Leadership', city:'Chennai', col:'#A78BFA', outcome:'3x Salary in 5 months' },
  { img:'/images/students/sandhya.jpg',      initials:'ZA', name:'Sandhya Pradhan',      before:'Team Lead at IBM, Infosys',           after:'Head of Growth, Mindler.ai',   program:'PM MBA',       city:'Delhi',     col:'#34D399', outcome:'Hired in 45 days' },
  { img:'/images/students/samrudh.jpg',       initials:'KM', name:'Samrudh R',  before:'Student at IIT-Madras',         after:'Founder of BlendYeh',   program:'Strategy & Leadership', city:'Mumbai', col:'#F59E0B', outcome:'Profitable | Student Founder' },
]

// ── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ background:'#05050A', minHeight:'100vh', color:'#E8E6E0', fontFamily:'DM Sans,sans-serif' }}>

      {/* NAV */}
<nav className="nav-wrap" style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', background:'rgba(5,5,10,0.94)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
  <div style={{ display:'flex', alignItems:'center', gap:'40px' }}>
    <div className="pf" style={{ fontSize:'20px', fontWeight:'700' }}>
      Mento<span style={{ color:'#FF6A00' }}>gram</span>
      <span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>MBA</span>
    </div>
    <div className="hide-mob" style={{ display:'flex', gap:'28px' }}>
      {[['#maya','Mentogram AI'],['#how','How It Works'],['#programs','Competencies'],['#immersion','Immersion'],['#mentors','Mentors']].map(([h,l]) => (
  <a key={h} href={h} className="nav-link">{l}</a>
))}
<SchoolsDropdown />
    </div>
  </div>
  <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
    <Link href="/enterprise" className="ent-pill" style={{ fontSize:'12px', fontFamily:'DM Mono,monospace', padding:'7px 14px', borderRadius:'100px', background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.2)', color:'#60A5FA', letterSpacing:'0.05em', textDecoration:'none' }}>For Enterprises ↗</Link>
    <Link href="/auth/login" className="nav-link hide-mob" style={{ padding:'8px 16px' }}>Sign In</Link>
    <Link href="/apply" className="btn-o hide-mob" style={{ fontSize:'13px', padding:'10px 22px' }}>Apply Now →</Link>
    <MobileNav />
  </div>
</nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'130px 24px 90px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:'1000px', height:'600px', background:'radial-gradient(ellipse,rgba(255,106,0,0.09) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'1040px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', borderRadius:'100px', background:'rgba(255,106,0,0.07)', border:'1px solid rgba(255,106,0,0.2)', marginBottom:'32px' }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#FF6A00', display:'inline-block', animation:'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize:'10px', color:'#FF8C00', textTransform:'uppercase', letterSpacing:'0.18em' }}>Welcome to the future of education</span>
          </div>
          <h1 className="pf h1-big slide-up" style={{ fontWeight:'900', lineHeight:'1.04', letterSpacing:'-0.035em', marginBottom:'28px', color:'#F0EDE6', animationDelay:'0.1s' }}>
            World's first<br /><span style={{ color:'#FF6A00' }}>AI-Native</span><br />Universiy.
          </h1>
          <p className="slide-up" style={{ fontSize:'19px', color:'#AAA', lineHeight:'1.72', maxWidth:'620px', margin:'0 auto 52px', fontWeight:'400', animationDelay:'0.25s' }}>
          No boring lectures. No disconnected exams. At Mentogram, you work with a personalised AI learning system to build real-world competencies, & graduate with an accrediated MBA degree
          </p>
          <div className="slide-up" style={{ animationDelay:'0.4s', marginBottom:'72px', maxWidth:'780px', margin:'0 auto 72px' }}>
            <AdmissionsChat />
          </div>
          <div className="hero-stats" style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'44px' }}>
            {[
              { n:'24/7', l:'Personal AI Mentor' },
              { n:'60+',   l:'Competencies' },
              { n:'4',  l:'Schools' },
              { n:'6',    l:'Global Immersions' },
              { n:'300+',   l:'Students' },
            ].map((s,i) => (
              <div key={s.l} className="stat-strip-item" style={{ padding:'0 36px', borderRight:i<4?'1px solid rgba(255,255,255,0.05)':'none', textAlign:'center' }}>
                <div className="pf" style={{ fontSize:'36px', fontWeight:'800', color:'#FF6A00', letterSpacing:'-0.03em' }}>{s.n}</div>
                <div className="mono" style={{ fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'5px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section style={{ padding:'0', background:'#05050A', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'relative', minHeight:'60vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'100px 24px 80px', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-10%', left:'-10%', width:'60%', height:'60%', background:'radial-gradient(ellipse,rgba(255,106,0,0.12) 0%,transparent 65%)', animation:'driftA 12s ease-in-out infinite alternate', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'60%', height:'60%', background:'radial-gradient(ellipse,rgba(96,165,250,0.08) 0%,transparent 65%)', animation:'driftB 15s ease-in-out infinite alternate', pointerEvents:'none' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
          <div style={{ position:'relative', maxWidth:'1000px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', borderRadius:'100px', background:'rgba(255,106,0,0.07)', border:'1px solid rgba(255,106,0,0.18)', marginBottom:'48px' }}>
              <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#FF6A00', display:'inline-block', animation:'pulse 2s infinite' }} />
              <span className="mono" style={{ fontSize:'10px', color:'#FF8C00', textTransform:'uppercase', letterSpacing:'0.18em' }}>THE CURRENT EDUCATION SYSTEM IS BROKEN</span>
            </div>
            <h2 className="pf" style={{ fontSize:'clamp(48px,7vw,96px)', fontWeight:'900', lineHeight:'1.02', letterSpacing:'-0.04em', color:'#F0EDE6', marginBottom:'0' }}>
              The best university<br />in the world<br /><span style={{ color:'#FF6A00' }}>admits everyone.</span>
            </h2>
          </div>
        </div>

        <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'0 24px 80px' }}>
          {/* Panel 1 */}
          <div className="grid-2" style={{ marginBottom:'80px' }}>
            <div>
              <div className="label" style={{ marginBottom:'20px' }}>The Problem We Solve</div>
              <div className="pf" style={{ fontSize:'42px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'24px' }}>
                Geography and money have always decided who gets a great education.
              </div>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75' }}>
                The best mentors, the best networks, the best programs — all gatekept. A student in Mumbai has never had the same access as a student at Wharton. Until now.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                { label:'Harvard MBA',     cost:'$230,000', access:'~900/year',   live:false },
                { label:'Wharton MBA',     cost:'$220,000', access:'~840/year',   live:false },
                { label:'ISB Hyderabad',   cost:'₹40,00,000',access:'~900/year', live:false },
                { label:'Mentogram MBA',   cost:'Free to start',access:'Unlimited · Always', live:true },
              ].map(item => (
                <div key={item.label} style={{ background:item.live?'rgba(255,106,0,0.08)':'rgba(255,255,255,0.02)', border:`1px solid ${item.live?'rgba(255,106,0,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:'12px', padding:'20px' }}>
                  <div className="mono" style={{ fontSize:'9px', color:item.live?'#FF8C00':'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{item.label}</div>
                  <div className="pf" style={{ fontSize:'18px', fontWeight:'800', color:item.live?'#FF6A00':'#555', marginBottom:'4px' }}>{item.cost}</div>
                  <div style={{ fontSize:'11px', color:item.live?'#AAA':'#333' }}>{item.access}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2 */}
          <div className="grid-2 mentor-maths-grid" style={{ marginBottom:'80px' }}>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'18px', padding:'36px' }}>
              <div className="mono" style={{ fontSize:'10px', color:'#FF6A00', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'24px' }}>The mentor maths</div>
              {[
                { label:'Human mentor reach',  value:'20',   sub:'students per year, maximum',              col:'#555' },
                { label:'Knowledge lost',       value:'~98%', sub:'of expertise never reaches students',     col:'#F97066' },
                { label:'Maya\'s reach',        value:'∞',    sub:'students simultaneously, same quality',   col:'#FF6A00' },
                { label:'Knowledge captured',   value:'100%', sub:'every interview, permanently preserved',  col:'#4ADE80' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize:'13px', color:'#AAA', marginBottom:'2px' }}>{item.label}</div>
                    <div style={{ fontSize:'11px', color:'#555' }}>{item.sub}</div>
                  </div>
                  <div className="pf" style={{ fontSize:'32px', fontWeight:'900', color:item.col, letterSpacing:'-0.03em' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="label" style={{ marginBottom:'20px' }}>The AI Advantage</div>
              <div className="pf" style={{ fontSize:'42px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'24px' }}>
                One great mentor can change a career. Most people never get one.
              </div>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75' }}>
                A world-class mentor can work with 20 people a year at most. Their knowledge, their frameworks, their hard-won lessons — reach a handful and then disappear. Mentogram changes the economics of mentorship permanently.
              </p>
            </div>
          </div>

          {/* Quote panel */}
          <div style={{ textAlign:'center', padding:'80px 40px', background:'rgba(255,106,0,0.04)', border:'1px solid rgba(255,106,0,0.12)', borderRadius:'24px', position:'relative', overflow:'hidden', marginBottom:'80px' }}>
            <div style={{ position:'absolute', top:'-50%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse,rgba(255,106,0,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div style={{ position:'relative' }}>
              <div className="label" style={{ marginBottom:'24px' }}>The Vision</div>
              <div className="pf" style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:'900', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.15', marginBottom:'28px' }}>
                &ldquo;In 10 years, the most prestigious credential<br />won&apos;t be where you studied.<br /><span style={{ color:'#FF6A00' }}>It will be how are you relevant.&rdquo;</span>
              </div>
              <p style={{ fontSize:'16px', color:'#AAA', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto' }}>
                Mentogram is building toward a world where every person learns the way they want to and build skills relevant to today's workforce, regardless of where they are, what they can afford, or what time zone they are in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Schools */}
      <section style={{ padding:'80px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
<div style={{ textAlign:'center' }}>
  <div className="label" style={{ marginBottom:'20px' }}>Four Schools. One Platform.</div>
  <div className="pf" style={{ fontSize:'62px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', marginBottom:'20px', lineHeight:'1.1' }}>
    The University<br />Built for the Real World.
  </div>
  <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto 64px' }}>
    Choose a school. Pick your program. Or build your own degree from any competency across all four schools.
  </p>
  <div className="grid-4">
    {[
      {
        href: '/finance',
        school: 'School of Finance',
        tag: 'Finance',
        col: '#1D4ED8',
        dot: '#60A5FA',
        badge: 'F01–F12',
        programs: ['Finance MBA', 'PGP in Venture Capital', 'PGP in Investment Banking', 'PGP in FinTech', 'Certificate in Financial Modelling'],
        desc: 'For finance professionals, aspiring investors, VC associates and CFOs.',
        stat: '5 programs · $1.5K–$10K',
      },
      {
        href: '/business',
        school: 'School of Business',
        tag: 'Business',
        col: '#FF6A00',
        dot: '#FF8C00',
        badge: 'B01–B12',
        programs: ['PM MBA', 'Build Your Own MBA', 'PGP in Growth', 'PGP in Strategy & Leadership', 'Certificate in Distribution'],
        desc: 'For PMs, growth leaders, operators and anyone building products or companies.',
        stat: '5 programs · $1.5K–$8K',
      },
      {
        href: '/ai',
        school: 'School of AI & Tech',
        tag: 'AI & Tech',
        col: '#7C3AED',
        dot: '#A78BFA',
        badge: 'A01–A12',
        programs: ['AI MBA', 'PGP in AI Agents', 'PGP in Data & Analytics', 'PGP in AI Strategy', 'Certificate in Automation'],
        desc: 'For those moving into AI product, AI workflows and AI-native founders.',
        stat: '5 programs · $1.5K–$10K',
      },
      {
        href: '/manufacturing',
        school: 'School of Manufacturing',
        tag: 'Manufacturing',
        col: '#0D9488',
        dot: '#2DD4BF',
        badge: 'M01–M12',
        programs: ['Manufacturing MBA', 'PGP in Supply Chain', 'PGP in Industrial AI', 'PGP in Lean & Ops Excellence', 'Certificate in Lean Ops'],
        desc: 'For plant managers, ops heads, supply chain leaders in India, SEA & Middle East.',
        stat: '5 programs · $1.5K–$8K',
      },
    ].map(item => (
      <a key={item.href} href={item.href} style={{ textDecoration:'none', display:'block' }}>
        <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${item.col}25`, borderRadius:'18px', padding:'28px 24px', borderTop:`3px solid ${item.col}`, height:'100%', transition:'border-color 0.2s, background 0.2s', cursor:'pointer', textAlign:'left' }}>
          {/* Top row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 10px', borderRadius:'100px', background:`${item.col}15`, color:item.dot, border:`1px solid ${item.col}30`, textTransform:'uppercase', letterSpacing:'0.1em' }}>{item.badge}</span>
            <span style={{ fontSize:'12px', color:'#333' }}>→</span>
          </div>
          {/* School name */}
          <div className="pf" style={{ fontSize:'22px', fontWeight:'800', color:item.dot, letterSpacing:'-0.02em', marginBottom:'6px', lineHeight:'1.15' }}>{item.school}</div>
          {/* Desc */}
          <p style={{ fontSize:'12px', color:'#666', lineHeight:'1.65', marginBottom:'20px' }}>{item.desc}</p>
          {/* Programs list */}
          <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'20px' }}>
            {item.programs.map(p => (
              <div key={p} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:item.col, flexShrink:0 }} />
                <span style={{ fontSize:'11px', color:'#888' }}>{p}</span>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div style={{ borderTop:`1px solid ${item.col}15`, paddingTop:'14px' }}>
            <span className="mono" style={{ fontSize:'9px', color:item.dot, textTransform:'uppercase', letterSpacing:'0.08em' }}>{item.stat}</span>
          </div>
        </div>
      </a>
    ))}
  </div>
</div>
        </div>
      </section>

      {/* MAYA */}
      <section id="maya" style={{ padding:'80px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px' }}>The AI Core</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              A Personalised AI Mentor.<br /><span style={{ color:'#FF6A00' }}>Build Real-World Competencies.<br /> </span>
              <span style={{ color:'#F0EDE6' }}>Earn A Degree.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'600px', margin:'0 auto' }}>
              Maya is a structured AI mentor built on exclusive practitioner knowledge. She follows a mandatory 8-stage lesson plan, remembers every session, and is available 24/7 for you.
            </p>
          </div>

          <div className="grid-2" style={{ marginBottom:'48px' }}>
            {/* Chat mockup */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ display:'flex', gap:'6px' }}>
                  {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                </div>
                <div style={{ flex:1, textAlign:'center' }}>
                  <span className="mono" style={{ fontSize:'10px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase' }}>Mentogram · Maya · AI Mentor</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ADE80', animation:'pulse 2s infinite' }} />
                  <span className="mono" style={{ fontSize:'9px', color:'#4ADE80' }}>Online</span>
                </div>
              </div>
              <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', gap:'18px' }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,106,0,0.15)', border:'1px solid rgba(255,106,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#FF8C00', flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div>
                    <div className="mono" style={{ fontSize:'9px', color:'#333', marginBottom:'5px', letterSpacing:'0.06em' }}>MAYA · Day 12 · 9:14am</div>
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'85%' }}>
                      <p style={{ fontSize:'13px', color:'#CCC', lineHeight:'1.65', margin:0 }}>Morning, Sarvesh. Last session you scored <span style={{ color:'#F59E0B', fontWeight:'600' }}>64/100</span> on your PRD. Before we move on, we fix that today.</p>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <span className="mono" style={{ fontSize:'9px', color:'#FF6A00', background:'rgba(255,106,0,0.07)', border:'1px solid rgba(255,106,0,0.15)', padding:'4px 14px', borderRadius:'100px', letterSpacing:'0.12em', textTransform:'uppercase' }}>▶ Stage 1 — Hook · Problem Discovery</span>
                </div>
                <div style={{ marginLeft:'40px', background:'rgba(249,112,102,0.05)', border:'1px solid rgba(249,112,102,0.2)', borderRadius:'12px', padding:'16px' }}>
                  <div className="mono" style={{ fontSize:'9px', color:'#F97066', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>⏱ Timer Challenge · 5 Minutes</div>
                  <p style={{ fontSize:'12px', color:'#AAA', lineHeight:'1.65', margin:'0 0 14px' }}>Airbnb bookings in Europe dropped 18% overnight. You are the PM. Write your first 3 diagnostic questions.</p>
                  <div style={{ height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden', marginBottom:'6px' }}>
                    <div style={{ width:'58%', height:'100%', background:'linear-gradient(90deg,#F97066,#F59E0B)', borderRadius:'2px' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span className="mono" style={{ fontSize:'9px', color:'#444' }}>2:54 elapsed</span>
                    <span className="mono" style={{ fontSize:'9px', color:'#F97066' }}>2:06 remaining</span>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px' }}>
                  <div>
                    <div className="mono" style={{ fontSize:'9px', color:'#333', marginBottom:'5px', textAlign:'right', letterSpacing:'0.06em' }}>SARVESH · just now</div>
                    <div style={{ background:'rgba(255,106,0,0.07)', border:'1px solid rgba(255,106,0,0.14)', borderRadius:'14px 4px 14px 14px', padding:'12px 16px' }}>
                      <p style={{ fontSize:'13px', color:'#CCC', lineHeight:'1.65', margin:0 }}>1. City-specific or pan-India? 2. Did it start on a specific date? 3. New users or returning?</p>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,106,0,0.15)', border:'1px solid rgba(255,106,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#FF8C00', flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.18)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'85%' }}>
                    <p style={{ fontSize:'13px', color:'#CCC', lineHeight:'1.65', margin:0 }}>That&apos;s sharp. You segmented before hypothesising. <span style={{ color:'#4ADE80', fontWeight:'600' }}>Moving to Stage 2.</span></p>
                  </div>
                </div>
              </div>
              <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.01)', display:'flex', gap:'8px', alignItems:'center' }}>
                <div style={{ flex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', color:'#333' }}>Reply to Maya|</div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#444' }}>🎤</div>
                  <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:'#000', fontWeight:'700' }}>→</div>
                </div>
              </div>
            </div>

            {/* Facts */}
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div style={{ marginBottom:'8px' }}>
                <div className="pf" style={{ fontSize:'30px', fontWeight:'800', color:'#F0EDE6', lineHeight:'1.2', marginBottom:'14px', letterSpacing:'-0.02em' }}>An AI mentor who actually knows you.</div>
                <p style={{ fontSize:'15px', color:'#AAA', lineHeight:'1.75' }}>Maya reads your background, your goal, your last score, and your 30 most recent messages before saying a single word.</p>
              </div>
              {[
                { icon:'🎯', col:'#FF6A00', title:'Personalised from Day 1',    desc:'Onboarding interview captures background, dream company, biggest fear, and time commitment.' },
                { icon:'🔁', col:'#2DD4BF', title:'Full session memory',        desc:'Last 30 messages loaded every login. Maya continues mid-sentence from your last session.' },
                { icon:'📊', col:'#4ADE80', title:'Instant rigorous evaluation',desc:'Every task scored on 6 dimensions immediately. Specific feedback referencing specific lines.' },
                { icon:'🌙', col:'#A78BFA', title:'Available at 3am',           desc:'No cohort schedule. No instructor availability. Maya is there whenever you are.' },
                { icon:'🧠', col:'#F59E0B', title:'Built on real practitioner knowledge', desc:'Maya teaches using exclusive interview transcripts from practitioners Mentogram has partnered with.' },
              ].map(f => (
                <div key={f.title} style={{ display:'flex', gap:'14px', padding:'16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', borderLeft:`3px solid ${f.col}` }}>
                  <span style={{ fontSize:'18px', flexShrink:0, marginTop:'2px' }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:'700', color:'#E8E6E0', marginBottom:'4px' }}>{f.title}</div>
                    <div style={{ fontSize:'12px', color:'#AAA', lineHeight:'1.6' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 16 interfaces */}
          <div style={{ textAlign:'center', marginBottom:'24px' }}>
            <div className="label" style={{ marginBottom:'10px' }}>16 Learning Interfaces</div>
            <p style={{ fontSize:'14px', color:'#888', maxWidth:'480px', margin:'0 auto' }}>Maya selects the right interface for every stage. No two sessions are the same.</p>
          </div>
          <div className="if-grid" style={{ marginBottom:'64px' }}>
            {[
              ['💬','Text','#666'],['❓','Quiz','#FF6A00'],['🔀','Scenario','#60A5FA'],['📊','Dashboard','#2DD4BF'],
              ['⏱','Timer','#F97066'],['↕','Drag-Drop','#A78BFA'],['🎭','Simulation','#F59E0B'],['🎯','Interview','#4ADE80'],
              ['📋','Tasks','#FF8C00'],['📈','Evaluation','#34D399'],['🎤','Voice','#818CF8'],['🔊','TTS','#FB7185'],
              ['🖊','Whiteboard','#FBBF24'],['▶','Video','#F97066'],['🔗','Articles','#60A5FA'],['⬡','Progress','#10B981'],
            ].map(([icon,label,col]) => (
              <div key={label} style={{ background:`${col}0C`, border:`1px solid ${col}22`, borderRadius:'10px', padding:'14px 6px', textAlign:'center' }}>
                <div style={{ fontSize:'20px', marginBottom:'6px' }}>{icon}</div>
                <div className="mono" style={{ fontSize:'8px', color:col, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* vs ChatGPT */}
          <div style={{ background:'rgba(255,106,0,0.04)', border:'1px solid rgba(255,106,0,0.14)', borderRadius:'18px', padding:'48px' }}>
            <div style={{ textAlign:'center', marginBottom:'36px' }}>
              <div className="label" style={{ marginBottom:'12px' }}>Why Maya is not ChatGPT</div>
              <div className="pf" style={{ fontSize:'28px', fontWeight:'800', color:'#F0EDE6', letterSpacing:'-0.02em' }}>
                Anyone can build a chat interface.<br /><span style={{ color:'#FF6A00' }}>Nobody can replicate our mentor knowledge.</span>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 48px 1fr', gap:'32px', alignItems:'start' }}>
              <div>
                <div className="mono" style={{ fontSize:'10px', color:'#444', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'16px', textDecoration:'line-through' }}>Generic AI tools</div>
                {['Generic internet knowledge — same for everyone','No memory — forgets you every conversation','No curriculum — infinite rabbit holes','No accountability — you can ignore it forever','No mentor knowledge — cannot teach like a specific person'].map(t => (
                  <div key={t} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px', fontSize:'13px', color:'#666' }}>
                    <span style={{ color:'#F97066', flexShrink:0 }}>✗</span>{t}
                  </div>
                ))}
              </div>
              <div style={{ textAlign:'center', paddingTop:'32px', fontSize:'20px', color:'#333' }}>vs</div>
              <div>
                <div className="mono" style={{ fontSize:'10px', color:'#FF6A00', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'16px' }}>Maya · Mentogram</div>
                {['Exclusive practitioner knowledge — interviews only we have','Remembers every message from every session','8-stage structured lesson per concept — always','Cannot progress without proving mastery','Teaches like the specific practitioners who built the curriculum'].map(t => (
                  <div key={t} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px', fontSize:'13px', color:'#CCC' }}>
                    <span style={{ color:'#4ADE80', flexShrink:0 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEARN BY DOING */}
      <section style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>

          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center', marginBottom:'80px' }} className="grid-2">
            <div>
              <div className="label" style={{ marginBottom:'16px' }}>How You Learn</div>
              <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.05', marginBottom:'24px' }}>
                No exams.<br />
                <span style={{ color:'#FF6A00' }}>Real work.<br />Real companies.</span>
              </h2>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75', marginBottom:'28px' }}>
                At Mentogram, you don&apos;t pass exams. You build real deliverables — PRDs, strategy memos, growth experiments, governance frameworks — for real company scenarios. Every task is evaluated by Maya against a senior professional standard.
              </p>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75', marginBottom:'40px' }}>
                This is how you earn your degree. Not by memorising. By doing.
              </p>

              {/* Three pillars */}
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {[
                  { icon:'🏢', col:'#FF6A00', title:'Real company scenarios', desc:'Every task is set in a real company context — Airbnb, Stripe, Notion, Linear. Not hypotheticals. Situations that actually happened.' },
                  { icon:'📊', col:'#2DD4BF', title:'Evaluated on 6 dimensions', desc:'Maya scores every submission on User Insight, Problem Clarity, Business Thinking, Execution, Tradeoffs, and Communication. Specific feedback on specific lines.' },
                  { icon:'🎓', col:'#4ADE80', title:'Your degree is what you built', desc:'Graduate with a portfolio of 24 real professional deliverables — not a certificate of attendance. Evidence you can actually do the work.' },
                ].map(p => (
                  <div key={p.title} style={{ display:'flex', gap:'16px', padding:'18px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', borderLeft:`3px solid ${p.col}` }}>
                    <span style={{ fontSize:'20px', flexShrink:0, marginTop:'2px' }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', marginBottom:'4px' }}>{p.title}</div>
                      <div style={{ fontSize:'12px', color:'#AAA', lineHeight:'1.65' }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task UI mockup */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>

              {/* Window chrome */}
              <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ display:'flex', gap:'5px' }}>
                  {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                </div>
                <div style={{ flex:1, textAlign:'center' }}>
                  <span className="mono" style={{ fontSize:'10px', color:'#333', letterSpacing:'0.1em', textTransform:'uppercase' }}>Maya · Task Assignment</span>
                </div>
              </div>

              <div style={{ padding:'24px' }}>

                {/* Task card */}
                <div style={{ background:'rgba(255,106,0,0.05)', border:'1px solid rgba(255,106,0,0.2)', borderRadius:'14px', padding:'20px', marginBottom:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                    <span className="mono" style={{ fontSize:'9px', color:'#FF6A00', background:'rgba(255,106,0,0.1)', border:'1px solid rgba(255,106,0,0.2)', padding:'3px 10px', borderRadius:'100px', textTransform:'uppercase', letterSpacing:'0.12em' }}>📋 Task · Stage 6 — Apply</span>
                    <span className="mono" style={{ fontSize:'9px', color:'#888' }}>60 min</span>
                  </div>
                  <div className="pf" style={{ fontSize:'16px', fontWeight:'700', color:'#F0EDE6', marginBottom:'10px' }}>Write the Product Requirements Document</div>
                  <div style={{ fontSize:'13px', color:'#AAA', lineHeight:'1.7', marginBottom:'16px' }}>
                    You are the PM at <span style={{ color:'#FF8C00', fontWeight:'600' }}>Airbnb</span>. Host churn in European markets is up 18% YoY. The CEO wants a retention solution in 90 days.
                    <br /><br />
                    Write a full PRD including: problem statement, success metrics, user stories, technical constraints, and a phased rollout plan.
                  </div>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {['Problem Statement','Success Metrics','User Stories','Technical Constraints','Rollout Plan'].map(t => (
                      <span key={t} style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', padding:'3px 10px', borderRadius:'100px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#888' }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Evaluation result */}
                <div style={{ background:'rgba(74,222,128,0.04)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'14px', padding:'18px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                    <span className="mono" style={{ fontSize:'9px', color:'#4ADE80', textTransform:'uppercase', letterSpacing:'0.12em' }}>Maya&apos;s Evaluation</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span className="pf" style={{ fontSize:'22px', fontWeight:'900', color:'#4ADE80' }}>84</span>
                      <span style={{ fontSize:'12px', color:'#888' }}>/100</span>
                      <span style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', padding:'3px 10px', borderRadius:'100px', background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ADE80', textTransform:'uppercase' }}>PASS</span>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'14px' }}>
                    {[
                      { dim:'User Insight',         score:17, max:20, col:'#FF6A00' },
                      { dim:'Problem Clarity',      score:18, max:20, col:'#60A5FA' },
                      { dim:'Business Thinking',    score:16, max:20, col:'#A78BFA' },
                      { dim:'Execution Quality',    score:13, max:15, col:'#2DD4BF' },
                      { dim:'Tradeoff Reasoning',   score:11, max:15, col:'#F59E0B' },
                      { dim:'Communication',        score:9,  max:10, col:'#4ADE80' },
                    ].map(d => (
                      <div key={d.dim} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 10px', background:'rgba(255,255,255,0.03)', borderRadius:'6px' }}>
                        <span style={{ fontSize:'10px', color:'#888' }}>{d.dim}</span>
                        <span style={{ fontSize:'11px', fontWeight:'700', color:d.col }}>{d.score}<span style={{ color:'#444', fontWeight:'400' }}>/{d.max}</span></span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:'12px', color:'#AAA', lineHeight:'1.65', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px' }}>
                    <span style={{ color:'#4ADE80', fontWeight:'600' }}>Strong: </span>Your problem statement is precise — you quantified the gap (40%) and connected it to user impact. The rollout plan is realistic.
                    <br />
                    <span style={{ color:'#F59E0B', fontWeight:'600' }}>Fix: </span>Your success metrics are output-focused. Rewrite KR2 as a user outcome metric, not a delivery metric.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stat strip */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', padding:'40px', background:'rgba(255,106,0,0.03)', border:'1px solid rgba(255,106,0,0.1)', borderRadius:'18px' }} className="grid-4">
            {[
              { n:'24', label:'Real tasks per program', sub:'One per concept. Not optional.', col:'#FF6A00' },
              { n:'6',  label:'Evaluation dimensions', sub:'Every submission, every time.', col:'#2DD4BF' },
              { n:'72', label:'Minimum pass score',    sub:'Below 72 — Maya re-teaches the gap.', col:'#4ADE80' },
              { n:'0',  label:'Exams',                 sub:'Zero. Your work is your proof.', col:'#A78BFA' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div className="pf" style={{ fontSize:'48px', fontWeight:'900', color:s.col, letterSpacing:'-0.03em', marginBottom:'6px' }}>{s.n}</div>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#F0EDE6', marginBottom:'4px' }}>{s.label}</div>
                <div style={{ fontSize:'11px', color:'#888', lineHeight:'1.5' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px' }}>The User Journey</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>How Mentogram works.</h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'580px', margin:'0 auto' }}>From the moment you sign up to the day you complete your program — every step is structured, personalised, and driven by Maya.</p>
          </div>
          <div className="grid-4" style={{ marginBottom:'80px', position:'relative' }}>
            {[
              { n:'01', icon:'🎓', title:'Start a Program',    desc:'Choose from PM, AI Agents, or any program that fits your goal. 5-minute onboarding interview with Maya', col:'#FF6A00' },
              { n:'02', icon:'🎤', title:'Meet your 24/7 Mentor',            desc:'Maya learns your background, dream company and your learning style. She uses this to personalise your journey.', col:'#2DD4BF' },
              { n:'03', icon:'📚', title:'Build Competencies',       desc:'You build each competency through 8 structured stages. Real tasks. Real evaluation. Real learning', col:'#4ADE80' },
              { n:'04', icon:'🏆', title:'Earn your Degree',  desc:'You advance only when you prove you it by doing real world tasks. No skipping. Every competency is earned.', col:'#A78BFA' },
            ].map(s => (
              <div key={s.n} style={{ textAlign:'center', padding:'0 20px' }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:`${s.col}15`, border:`2px solid ${s.col}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', margin:'0 auto 16px' }}>{s.icon}</div>
                <div className="mono" style={{ fontSize:'9px', color:s.col, textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:'8px' }}>Step {s.n}</div>
                <div className="pf" style={{ fontSize:'17px', fontWeight:'700', color:'#F0EDE6', marginBottom:'10px' }}>{s.title}</div>
                <div style={{ fontSize:'13px', color:'#AAA', lineHeight:'1.65' }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:'72px' }}>
            <div style={{ textAlign:'center', marginBottom:'40px' }}>
              <div className="label" style={{ marginBottom:'10px' }}>OUR LEARNING PEDAGOGY</div>
              <div className="pf" style={{ fontSize:'30px', fontWeight:'800', color:'#F0EDE6', letterSpacing:'-0.02em' }}>Master each competency through a 8 stage learning process.</div>
            </div>
            <div className="grid-4">
              {[
                { n:'01', t:'Hook',     time:'10m', col:'#FF6A00', desc:'Timer challenge, scenario, or live dashboard. Never starts with explanation.' },
                { n:'02', t:'Anchor',   time:'10m', col:'#FF8C00', desc:'Connects concept to your background and dream company.' },
                { n:'03', t:'Teach',    time:'25m', col:'#FFB347', desc:'3 core ideas via Socratic dialogue. Mentor knowledge surfaced first.' },
                { n:'04', t:'Deepen',   time:'20m', col:'#F59E0B', desc:'Edge cases and hard pushback. Uncomfortable on purpose.' },
                { n:'05', t:'Validate', time:'15m', col:'#2DD4BF', desc:'Quiz gate. Fail → re-teach the specific gap only.' },
                { n:'06', t:'Apply',    time:'60m', col:'#4ADE80', desc:'Real task — PRD, experiment, simulation, strategy memo.' },
                { n:'07', t:'Reflect',  time:'10m', col:'#60A5FA', desc:'Explain in your own words. Memorised vs. understood — Maya knows.' },
                { n:'08', t:'Bridge',   time:'10m', col:'#A78BFA', desc:'Connects to next concept. Progress card. Real-world observation.' },
              ].map(s => (
                <div key={s.n} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'18px', borderTop:`3px solid ${s.col}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <span className="mono" style={{ fontSize:'9px', color:s.col, letterSpacing:'0.1em' }}>{s.n}</span>
                    <span className="mono" style={{ fontSize:'9px', color:'#444' }}>{s.time}</span>
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:'#E8E6E0', marginBottom:'6px' }}>{s.t}</div>
                  <div style={{ fontSize:'12px', color:'#AAA', lineHeight:'1.6' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid-3">
            {[
              { col:'#FF6A00', title:'You learn by doing, not watching', desc:'Every session requires you to produce something real. Maya will not advance you until you prove understanding through action.' },
              { col:'#2DD4BF', title:'Feedback in seconds, not days',   desc:'Every task scored on 6 dimensions instantly. Specific feedback on specific lines within minutes of submitting.' },
              { col:'#4ADE80', title:'Progress only when you earn it',  desc:'No skipping. No time-based progression. Every concept is gated by demonstrated mastery.' },
            ].map(b => (
              <div key={b.title} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'28px', borderLeft:`3px solid ${b.col}` }}>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'#F0EDE6', marginBottom:'10px', lineHeight:'1.3' }}>{b.title}</div>
                <div style={{ fontSize:'13px', color:'#AAA', lineHeight:'1.7' }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'24px', marginBottom:'64px' }}>
            <div>
              <div className="label" style={{ marginBottom:'16px' }}>Competencies</div>
              <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', marginBottom:'16px', lineHeight:'1.1' }}>One MBA.<br />Multiple Competencies.<br /><span style={{ color:'#FF6A00' }}>Build your own Degree</span></h2>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.65', maxWidth:'520px' }}>Each competency is 24 concepts, taught through an 8-stage learning framework by Maya — your AI mentor. 60+ competencies across 4 schools.</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px 24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', flexShrink:0 }}>
              {[{n:'60+',l:'Competencies'},{n:'1,440',l:'Concepts'},{n:'4',l:'Schools'}].map((s,i) => (
                <React.Fragment key={s.l}>
                  {i > 0 && <div style={{ width:'1px', height:'40px', background:'rgba(255,255,255,0.06)' }} />}
                  <div style={{ textAlign:'center' }}>
                    <div className="pf" style={{ fontSize:'28px', fontWeight:'800', color:'#FF6A00', letterSpacing:'-0.03em' }}>{s.n}</div>
                    <div className="mono" style={{ fontSize:'9px', color:'#555', textTransform:'uppercase' as const, letterSpacing:'0.1em' }}>{s.l}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid-3" style={{ gap:'14px' }}>
            {[
              { emoji:'📦', code:'B01', title:'Product Management',      sub:'School of Business',       desc:'Write real PRDs, run discovery, manage stakeholders and ship products. 24 concepts evaluated against a senior PM standard.',                              col:'#FF6A00' },
              { emoji:'💰', code:'F01', title:'Financial Modelling & Valuation',      sub:'School of Finance',        desc:'Build three-statement models, DCF valuations and comparable company analysis. The toolkit every finance professional must master.',                     col:'#1D4ED8' },
              { emoji:'🤖', code:'A02', title:'AI Agents & Agentic Systems',          sub:'School of AI & Tech',      desc:'Build and deploy AI agents using LangChain, LangGraph and CrewAI. From single-agent tools to multi-agent production systems.',                        col:'#7C3AED' },
              { emoji:'🏭', code:'M01', title:'Lean Manufacturing', sub:'School of Manufacturing', desc:'8 wastes, value stream mapping, 5S, Kaizen and standard work. The foundation of operational excellence on the factory floor.',                      col:'#0D9488' },
              { emoji:'📈', code:'B04', title:'Growth Marketing & Acquisition',       sub:'School of Business',       desc:'Paid acquisition, SEO, referral loops and viral mechanics. Build compounding growth engines across channels.',                                        col:'#FF6A00' },
              { emoji:'🔬', code:'F04', title:'Venture Capital & Startup Finance',    sub:'School of Finance',        desc:'Fund structure, term sheets, cap tables, valuations and deal mechanics. How VC actually works from the inside.',                                      col:'#1D4ED8' },
              { emoji:'🧠', code:'A01', title:'AI & LLM Fundamentals',               sub:'School of AI & Tech',      desc:'How large language models work, what they can and cannot do, and how to build with them. The foundation for every AI role.',                         col:'#7C3AED' },
              { emoji:'⚙️', code:'M06', title:'Industrial AI', sub:'School of Manufacturing', desc:'IIoT sensors, anomaly detection and ML for equipment failure. Build predictive maintenance systems that save millions in downtime.',               col:'#0D9488' },
              { emoji:'📊', code:'G04', title:'Data Analysis & Interpretation',       sub:'Generic — All Schools',    desc:'From descriptive statistics to cohort analysis and A/B testing. The data skills every professional needs regardless of function.',                    col:'#16A34A' },
              { emoji:'🎯', code:'G01', title:'Strategy & Growth',                             sub:'Generic — All Schools',    desc:'Competitive analysis, positioning, strategic trade-offs and execution. How companies decide where to compete and where not to.',                     col:'#16A34A' },
              { emoji:'🤝', code:'B09', title:'Go-to-Market Strategy',               sub:'School of Business',       desc:'ICP definition, positioning, channel selection and launch planning. GTM frameworks tested against real startup and enterprise standards.',           col:'#FF6A00' },
              { emoji:'🏦', code:'F08', title:'FinTech & Digital Finance',            sub:'School of Finance',        desc:'Payments, neobanks, embedded finance, DeFi and regulation. The full landscape of financial technology today.',                                      col:'#1D4ED8' },
            ].map(p => (
              <div key={p.code} className="card card-hover" style={{ borderColor:`${p.col}25`, background:`${p.col}04` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px' }}>
                  <div style={{ fontSize:'32px' }}>{p.emoji}</div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px' }}>
                    <span className="tag-live">Live</span>
                    <span className="mono" style={{ fontSize:'9px', color:p.col, fontWeight:'700' }}>{p.code}</span>
                  </div>
                </div>
                <div className="pf" style={{ fontSize:'17px', fontWeight:'700', color:'#F0EDE6', marginBottom:'5px', lineHeight:'1.3' }}>{p.title}</div>
                <div className="mono" style={{ fontSize:'9px', color:p.col, textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:'12px', opacity:0.8 }}>{p.sub}</div>
                <p style={{ fontSize:'13px', color:'#AAA', lineHeight:'1.65', marginBottom:'16px' }}>{p.desc}</p>
                <div style={{ display:'flex', gap:'6px', marginBottom:'16px', flexWrap:'wrap' }}>
                  {['24 concepts','8 stages','~180 min'].map(t => (
                    <span key={t} style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', padding:'3px 8px', borderRadius:'4px', background:`${p.col}10`, color:p.col, border:`1px solid ${p.col}20` }}>{t}</span>
                  ))}
                </div>
                <Link href="/apply" style={{ display:'block', textAlign:'center', padding:'10px', borderRadius:'8px', background:p.col, color:'#fff', fontWeight:'700', fontSize:'13px', textDecoration:'none' }}>Apply →</Link>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'40px', padding:'20px 28px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div className="pf" style={{ fontSize:'16px', fontWeight:'700', color:'#F0EDE6', marginBottom:'4px' }}> At Mentogram, you can choose from a library of 60+ such competencies.</div>
              <div style={{ fontSize:'13px', color:'#666' }}>Across Business, Finance, AI & Technology and Manufacturing. Pick your program or build your own degree.</div>
            </div>
            <Link href="/apply" style={{ padding:'12px 28px', borderRadius:'8px', background:'#FF6A00', color:'#fff', fontWeight:'700', fontSize:'14px', textDecoration:'none', flexShrink:0 }}>Explore All Programs →</Link>
          </div>
        </div>
      </section>

      {/* IMMERSION */}
      <section id="immersion" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px' }}>Not Just AI</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              Learn with AI.<br /><span style={{ color:'#FF6A00' }}>Grow with people.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'580px', margin:'0 auto' }}>Every month we run live immersion programs across 8 global cities — bringing students, mentors, and leaders together in person.</p>
          </div>
          <div className="grid-2" style={{ marginBottom:'72px', gap:'64px', alignItems:'start' }}>
            <div>
              <div className="pf" style={{ fontSize:'30px', fontWeight:'800', color:'#F0EDE6', lineHeight:'1.2', marginBottom:'20px', letterSpacing:'-0.02em' }}>The social benefits of a real university — without being tied to one campus.</div>
              <p style={{ fontSize:'15px', color:'#AAA', lineHeight:'1.75', marginBottom:'28px' }}>AI gives you personalisation and rigour. The immersion programs give you the human connections, shared experiences, and real-world networks that only happen when people are in the same room.</p>
              {[
                { icon:'🏙', t:'Monthly city immersions',    d:'3-day intensive workshops with global practitioners across 8 cities every month.' },
                { icon:'🤝', t:'Cohort dinners and networking', d:'Peer connections with students who are at the same point in their journey.' },
                { icon:'🏢', t:'Company visits',              d:'Behind-the-scenes access to the companies and teams shaping your industry.' },
                { icon:'🎤', t:'Capstone presentations',      d:'Present your final project to real investors, operators, and industry leaders.' },
              ].map(f => (
                <div key={f.t} style={{ display:'flex', gap:'14px', marginBottom:'18px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'20px', flexShrink:0, marginTop:'1px' }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:'700', color:'#E8E6E0', marginBottom:'3px' }}>{f.t}</div>
                    <div style={{ fontSize:'13px', color:'#AAA', lineHeight:'1.6' }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {[
                { bg:'linear-gradient(145deg,#1a0900,#2d1600)', flag:'🇸🇬', city:'Singapore',    date:'Every Jan & Jul' },
                { bg:'linear-gradient(145deg,#00101a,#002a3d)', flag:'🇦🇪', city:'Dubai',        date:'Every Feb & Aug', mt:'24px' },
                { bg:'linear-gradient(145deg,#0a0a1a,#14143d)', flag:'🇺🇸', city:'San Francisco',date:'Every Mar & Sep' },
                { bg:'linear-gradient(145deg,#001200,#002800)', flag:'🇮🇩', city:'Bali',         date:'Every Apr & Oct', mt:'24px' },
              ].map(c => (
                <div key={c.city} style={{ background:c.bg, borderRadius:'14px', padding:'24px', border:'1px solid rgba(255,255,255,0.06)', marginTop:c.mt||'0' }}>
                  <div style={{ fontSize:'28px', marginBottom:'16px' }}>{c.flag}</div>
                  <div className="pf" style={{ fontSize:'16px', fontWeight:'700', color:'#E8E6E0', marginBottom:'4px' }}>{c.city}</div>
                  <div className="mono" style={{ fontSize:'9px', color:'#555', letterSpacing:'0.1em' }}>{c.date}</div>
                  <div style={{ marginTop:'12px', display:'inline-block', background:'rgba(255,106,0,0.1)', border:'1px solid rgba(255,106,0,0.2)', borderRadius:'100px', padding:'3px 10px', fontSize:'10px', color:'#FF8C00', fontFamily:'DM Mono,monospace', textTransform:'uppercase', letterSpacing:'0.1em' }}>Monthly</div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div style={{ background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'40px 40px 32px', overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'16px' }}>
              <div>
                <div className="label" style={{ marginBottom:'6px' }}>Global Immersion Network</div>
                <div className="pf" style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6' }}>8 cities. 12 immersions a year.</div>
              </div>
              <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                {['🇸🇬 Singapore','🇦🇪 Dubai','🇺🇸 San Francisco','🇺🇸 New York','🇬🇧 London','🇨🇳 Shanghai','🇮🇩 Bali','🇮🇳 Mumbai'].map(c => (
                  <span key={c} className="mono" style={{ fontSize:'10px', color:'#555', letterSpacing:'0.06em' }}>{c}</span>
                ))}
              </div>
            </div>
            <svg viewBox="0 0 1000 480" style={{ width:'100%', height:'auto', display:'block' }}>
              <defs><radialGradient id="g1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FF6A00" stopOpacity="0.35" /><stop offset="100%" stopColor="#FF6A00" stopOpacity="0" /></radialGradient></defs>
              <path d="M80 80 L200 70 L230 100 L220 160 L200 200 L170 220 L150 200 L130 220 L110 200 L90 160Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <path d="M160 240 L220 230 L240 280 L230 340 L200 370 L170 350 L155 300Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <path d="M440 70 L520 60 L540 90 L520 130 L480 140 L450 120 L430 100Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <path d="M450 155 L540 150 L560 200 L550 280 L510 330 L470 320 L445 270 L440 200Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <path d="M545 60 L750 50 L800 80 L820 130 L800 170 L750 180 L700 160 L650 170 L600 150 L560 130 L545 100Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <path d="M640 170 L680 165 L700 210 L675 250 L650 230 L635 200Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <path d="M760 175 L810 170 L830 200 L820 230 L790 220 L765 200Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <path d="M800 280 L880 270 L900 310 L890 360 L850 370 L810 350 L795 320Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              {([[790,185,660,210],[660,210,590,135],[590,135,488,90],[488,90,330,120],[330,120,180,155],[180,155,255,130],[785,105,790,185]] as number[][]).map(([x1,y1,x2,y2],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,106,0,0.18)" strokeWidth="0.8" strokeDasharray="5 7" />
              ))}
              {[{x:790,y:185,l:'Singapore'},{x:590,y:135,l:'Dubai'},{x:180,y:155,l:'San Francisco'},{x:255,y:130,l:'New York'},{x:488,y:90,l:'London'},{x:785,y:105,l:'Shanghai'},{x:820,y:220,l:'Bali'},{x:660,y:210,l:'Mumbai'}].map(c => (
                <g key={c.l}>
                  <circle cx={c.x} cy={c.y} r="16" fill="url(#g1)" opacity="0.7" />
                  <circle cx={c.x} cy={c.y} r="4.5" fill="#FF6A00" />
                  <text x={c.x} y={c.y-11} textAnchor="middle" fill="#FF8C00" fontSize="8" fontFamily="DM Mono,monospace" letterSpacing="0.08em">{c.l}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section style={{ padding:'80px 0', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto', padding:'0 24px', marginBottom:'40px', textAlign:'center' }}>
          <div className="label" style={{ marginBottom:'12px' }}>Global Immersions · Real Moments</div>
          <div className="pf" style={{ fontSize:'32px', fontWeight:'800', color:'#F0EDE6', letterSpacing:'-0.02em' }}>Students learning together, across the world.</div>
        </div>
        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', gap:'12px', animation:'scrollLeft 40s linear infinite', width:'max-content' }}>
            {galleryRow1Full.map((item, i) => (
              <div key={i} style={{ width:'320px', height:'220px', borderRadius:'14px', overflow:'hidden', flexShrink:0, position:'relative', border:'1px solid rgba(255,255,255,0.07)' }}>
                {item.src ? <img src={item.src} alt={item.city} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', height:'100%', background:item.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                      <div style={{ fontSize:'32px', opacity:0.3 }}>📸</div>
                      <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.15)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Add photo here</div>
                    </div>
                }
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 16px', background:'linear-gradient(transparent,rgba(0,0,0,0.85))' }}>
                  <div className="pf" style={{ fontSize:'13px', fontWeight:'700', color:'#E8E6E0' }}>{item.city}</div>
                  <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display:'flex', gap:'12px', animation:'scrollRight 45s linear infinite', width:'max-content' }}>
            {galleryRow2Full.map((item, i) => (
              <div key={i} style={{ width:'280px', height:'200px', borderRadius:'14px', overflow:'hidden', flexShrink:0, position:'relative', border:'1px solid rgba(255,255,255,0.07)' }}>
                {item.src ? <img src={item.src} alt={item.city} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', height:'100%', background:item.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                      <div style={{ fontSize:'28px', opacity:0.3 }}>📸</div>
                      <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.15)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Add photo here</div>
                    </div>
                }
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 14px', background:'linear-gradient(transparent,rgba(0,0,0,0.85))' }}>
                  <div className="pf" style={{ fontSize:'12px', fontWeight:'700', color:'#E8E6E0' }}>{item.city}</div>
                  <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENTS */}
<section style={{ padding:'100px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
  <div style={{ maxWidth:'1160px', margin:'0 auto', marginBottom:'56px' }}>
    <div style={{ textAlign:'center' }}>
      <div className="label" style={{ marginBottom:'14px' }}>Alumni · Where They Are Now</div>
      <h2 className="pf" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1' }}>Real students. Real outcomes.</h2>
    </div>
  </div>

  {/* Row 1 — scrolls left */}
  <ScrollRow direction="left" speed={40}>
    {[...students.slice(0,7), ...students.slice(0,7)].map((s, i) => (
      <StudentCard key={i} s={s} />
    ))}
  </ScrollRow>

  <ScrollRow direction="right" speed={40}>
    {[...students.slice(7,14), ...students.slice(7,14)].map((s, i) => (
      <StudentCard key={i} s={s} />
    ))}
  </ScrollRow>
  </section>

      {/* MENTORS */}
      <section id="mentors" style={{ padding:'80px 24px 64px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto', marginBottom:'64px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'24px' }}>
            <div>
              <div className="label" style={{ marginBottom:'16px' }}>Real Mentors</div>
              <h2 className="pf" style={{ fontSize:'48px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'16px' }}>Backed by real-world domain experts<br />who have done it.</h2>
              <p style={{ fontSize:'16px', color:'#AAA', lineHeight:'1.65', maxWidth:'440px' }}>Every program is built from scratch with practitioners who have shipped real products and made real mistakes. Their exclusive knowledge lives only on this platform.</p>
            </div>
            <div style={{ background:'rgba(255,106,0,0.05)', border:'1px solid rgba(255,106,0,0.14)', borderRadius:'14px', padding:'24px 28px', maxWidth:'260px' }}>
              <div className="mono" style={{ fontSize:'9px', color:'#FF6A00', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'10px' }}>The Mentogram Moat</div>
              <p style={{ fontSize:'12px', color:'#AAA', lineHeight:'1.65' }}>These practitioners give Mentogram exclusive access to their real thinking through structured interviews. Not what they post publicly. Only here.</p>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', gap:'14px', animation:'scrollLeft 32s linear infinite', width:'max-content' }}>
            {mentorRow1Full.map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', gap:'14px', animation:'scrollRight 38s linear infinite', width:'max-content' }}>
            {mentorRow2Full.map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
        <div>
          <div style={{ display:'flex', gap:'14px', animation:'scrollLeft 44s linear infinite', width:'max-content' }}>
            {mentorRow3Full.map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
        <div>
          <div style={{ display:'flex', gap:'14px', animation:'scrollRight 50s linear infinite', width:'max-content' }}>
            {mentorRow4Full.map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
      </section>

      {/* ACCREDITATION */}
      <section style={{ padding:'80px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'400px', background:'radial-gradient(ellipse,rgba(96,165,250,0.05) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:'1160px', margin:'0 auto', position:'relative' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <div className="label" style={{ marginBottom:'16px', color:'#60A5FA' }}>Accreditation</div>
            <h2 className="pf" style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'16px' }}>
              EU Accredited.<br /><span style={{ color:'#60A5FA' }}>Globally recognised.</span>
            </h2>
            <p style={{ fontSize:'16px', color:'#AAA', lineHeight:'1.7', maxWidth:'480px', margin:'0 auto' }}>
              Mentogram degrees are accredited through Woolf University — the first blockchain-enabled university in the EU.
            </p>
          </div>

          {/* Woolf card */}
          <div style={{ maxWidth:'720px', margin:'0 auto' }}>
            <div style={{ background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.18)', borderRadius:'20px', padding:'40px 48px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'260px', height:'260px', background:'radial-gradient(ellipse,rgba(96,165,250,0.07) 0%,transparent 65%)', pointerEvents:'none' }} />
              <div style={{ position:'relative' }}>

                {/* Logo row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'20px', marginBottom:'32px' }}>
                  <div>
                    <div className="pf" style={{ fontSize:'28px', fontWeight:'900', color:'#F0EDE6', letterSpacing:'-0.02em', marginBottom:'4px' }}>Woolf University</div>
                    <div className="mono" style={{ fontSize:'10px', color:'#60A5FA', textTransform:'uppercase', letterSpacing:'0.15em' }}>Founded in Malta · EU Recognised</div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'6px 14px', borderRadius:'100px', background:'rgba(96,165,250,0.1)', color:'#60A5FA', border:'1px solid rgba(96,165,250,0.25)', letterSpacing:'0.08em', textTransform:'uppercase' }}>EU Accredited</span>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'6px 14px', borderRadius:'100px', background:'rgba(74,222,128,0.08)', color:'#4ADE80', border:'1px solid rgba(74,222,128,0.2)', letterSpacing:'0.08em', textTransform:'uppercase' }}>ECTS Recognised</span>
                  </div>
                </div>

                {/* Two facts */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                  {[
                    { icon:'⛓️', label:'First blockchain-enabled university in the EU', detail:'Degrees issued on-chain — verifiable, tamper-proof, permanent.' },
                    { icon:'🇪🇺', label:'European Credit Transfer System', detail:'Credits recognised across EU member states and partner institutions worldwide.' },
                  ].map(f => (
                    <div key={f.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'20px' }}>
                      <div style={{ fontSize:'22px', marginBottom:'10px' }}>{f.icon}</div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'#E8E6E0', marginBottom:'6px', lineHeight:'1.35' }}>{f.label}</div>
                      <div style={{ fontSize:'11px', color:'#555', lineHeight:'1.6' }}>{f.detail}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'140px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'500px', background:'radial-gradient(ellipse,rgba(255,106,0,0.07) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'780px', margin:'0 auto' }}>
          <div className="label" style={{ marginBottom:'24px' }}>Join Mentogram</div>
          <h2 className="pf" style={{ fontSize:'clamp(44px,6vw,76px)', fontWeight:'900', letterSpacing:'-0.035em', color:'#F0EDE6', marginBottom:'24px', lineHeight:'1.05' }}>
            Education designed<br /><span style={{ color:'#FF6A00' }}>for the new era.</span>
          </h2>
          <p style={{ fontSize:'18px', color:'#AAA', lineHeight:'1.72', marginBottom:'52px', maxWidth:'560px', margin:'0 auto 52px' }}>
            Not a course. Not a bootcamp. A university built from the ground up for the world AI is creating — where your mentor never sleeps, your curriculum is built by practitioners, and your learning happens by doing real work.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/apply" className="btn-o" style={{ fontSize:'16px', padding:'16px 48px' }}>Apply Now! →</Link>
            <Link href="/auth/login" className="btn-g" style={{ fontSize:'16px', padding:'16px 48px' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'36px 64px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px', background:'#05050A' }}>
        <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#F0EDE6' }}>
          Mento<span style={{ color:'#FF6A00' }}>gram</span>
          <span className="mono" style={{ fontSize:'8px', color:'#222', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>MBA</span>
        </div>
        <div style={{ display:'flex', gap:'28px' }}>
          {['Mentogram AI','Competencies','Immersion','Mentors'].map(l => (
            <span key={l} className="mono" style={{ fontSize:'10px', color:'#333', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>{l}</span>
          ))}
        </div>
        <div className="mono" style={{ fontSize:'10px', color:'#222', letterSpacing:'0.08em' }}>© 2025 Mentogram · AI-Native University</div>
      </footer>

    </div>
  )
}
