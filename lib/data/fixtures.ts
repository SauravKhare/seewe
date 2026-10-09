import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
} from '@/lib/constants'
import type {
  ApplicationStatusHistory,
  Certification,
  Company,
  ContactPerson,
  Education,
  Experience,
  Interview,
  JobApplication,
  JobAttachment,
  JobSkill,
  Language,
  MasterResumeData,
  Project,
  Resume,
  ResumeSkill,
  Skill,
  TailoredResume,
  TailoredResumeData,
} from '@/lib/types'

export const USER_ID = 'user_demo'
export const MASTER_RESUME_ID = 'resume_master'

export const DEMO_USER = {
  id: USER_ID,
  name: 'Jane Doe',
  email: 'demo@seewe.app',
  password: 'demo1234',
  initials: 'JD',
}

const now = '2026-06-18T09:00:00.000Z'

export const skills: Skill[] = [
  { id: 'skill_ts', name: 'TypeScript', normalized: 'typescript' },
  { id: 'skill_react', name: 'React', normalized: 'react' },
  { id: 'skill_next', name: 'Next.js', normalized: 'next.js' },
  { id: 'skill_node', name: 'Node.js', normalized: 'node.js' },
  { id: 'skill_postgres', name: 'PostgreSQL', normalized: 'postgresql' },
  { id: 'skill_graphql', name: 'GraphQL', normalized: 'graphql' },
  { id: 'skill_aws', name: 'AWS', normalized: 'aws' },
  { id: 'skill_docker', name: 'Docker', normalized: 'docker' },
  { id: 'skill_k8s', name: 'Kubernetes', normalized: 'kubernetes' },
  { id: 'skill_terraform', name: 'Terraform', normalized: 'terraform' },
  { id: 'skill_cicd', name: 'CI/CD', normalized: 'ci/cd' },
  { id: 'skill_testing', name: 'Testing', normalized: 'testing' },
  { id: 'skill_system', name: 'System Design', normalized: 'system design' },
  { id: 'skill_go', name: 'Go', normalized: 'go' },
  { id: 'skill_python', name: 'Python', normalized: 'python' },
  { id: 'skill_redis', name: 'Redis', normalized: 'redis' },
  { id: 'skill_kafka', name: 'Kafka', normalized: 'kafka' },
  {
    id: 'skill_microservices',
    name: 'Microservices',
    normalized: 'microservices',
  },
]

export const resume: Resume = {
  id: MASTER_RESUME_ID,
  userId: USER_ID,
  headline: 'Senior Backend Engineer',
  summary:
    'Backend engineer with eight years building payment and infrastructure systems at scale. Comfortable owning a service from schema to production. Focused on reliability, clear APIs, and measurable performance.',
  contact: {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 (415) 555-0148',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/janedoe',
    github: 'github.com/janedoe',
    website: 'janedoe.dev',
  },
  templateId: 'ats-single',
  createdAt: '2026-01-04T10:00:00.000Z',
  updatedAt: now,
}

export const experience: Experience[] = [
  {
    id: 'exp_1',
    resumeId: MASTER_RESUME_ID,
    company: 'Acme',
    title: 'Senior Backend Engineer',
    location: 'San Francisco, CA',
    startDate: '2022-03',
    current: true,
    bullets: [
      'Led the redesign of the payments ledger, cutting reconciliation time from hours to under a minute.',
      'Built an idempotent webhook pipeline handling 4M events per day with zero double-charges.',
      'Mentored four engineers and introduced a service ownership model across the platform team.',
    ],
    sortOrder: 0,
  },
  {
    id: 'exp_2',
    resumeId: MASTER_RESUME_ID,
    company: 'Northwind Labs',
    title: 'Backend Engineer',
    location: 'Remote',
    startDate: '2020-01',
    endDate: '2022-02',
    current: false,
    bullets: [
      'Designed a multi-tenant API with row-level isolation used by 300+ enterprise accounts.',
      'Reduced p95 latency by 42 percent through targeted caching and query tuning.',
    ],
    sortOrder: 1,
  },
  {
    id: 'exp_3',
    resumeId: MASTER_RESUME_ID,
    company: 'Bright Labs',
    title: 'Software Engineer',
    location: 'Berkeley, CA',
    startDate: '2018-06',
    endDate: '2019-12',
    current: false,
    bullets: [
      'Shipped the first version of an internal analytics service in Go.',
      'Automated release pipelines, dropping deploy time from 40 to 6 minutes.',
    ],
    sortOrder: 2,
  },
]

export const education: Education[] = [
  {
    id: 'edu_1',
    resumeId: MASTER_RESUME_ID,
    school: 'Stanford University',
    degree: 'M.S.',
    field: 'Computer Science',
    startDate: '2016-09',
    endDate: '2018-06',
    gpa: '3.9',
    sortOrder: 0,
  },
  {
    id: 'edu_2',
    resumeId: MASTER_RESUME_ID,
    school: 'University of California, Berkeley',
    degree: 'B.S.',
    field: 'Computer Science',
    startDate: '2012-09',
    endDate: '2016-05',
    gpa: '3.7',
    sortOrder: 1,
  },
]

export const projects: Project[] = [
  {
    id: 'proj_1',
    resumeId: MASTER_RESUME_ID,
    name: 'Ledgerlights',
    description:
      'Open-source double-entry ledger library with an event-sourced core.',
    techStack: ['TypeScript', 'PostgreSQL', 'Redis'],
    link: 'github.com/janedoe/ledgerlights',
    sortOrder: 0,
  },
  {
    id: 'proj_2',
    resumeId: MASTER_RESUME_ID,
    name: 'Openstatus',
    description: 'Self-hosted uptime and status page monitor.',
    techStack: ['Go', 'Kubernetes', 'Terraform'],
    link: 'github.com/janedoe/openstatus',
    sortOrder: 1,
  },
]

export const certifications: Certification[] = [
  {
    id: 'cert_1',
    resumeId: MASTER_RESUME_ID,
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issuedDate: '2023-04',
    link: 'credly.com/janedoe/aws',
    sortOrder: 0,
  },
  {
    id: 'cert_2',
    resumeId: MASTER_RESUME_ID,
    name: 'Certified Kubernetes Administrator',
    issuer: 'CNCF',
    issuedDate: '2022-08',
    sortOrder: 1,
  },
]

export const languages: Language[] = [
  {
    id: 'lang_1',
    resumeId: MASTER_RESUME_ID,
    name: 'English',
    proficiency: 'Native',
    sortOrder: 0,
  },
  {
    id: 'lang_2',
    resumeId: MASTER_RESUME_ID,
    name: 'Spanish',
    proficiency: 'Professional',
    sortOrder: 1,
  },
]

export const resumeSkills: ResumeSkill[] = [
  {
    id: 'rs_ts',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_ts',
    category: 'Languages',
    level: 'expert',
    sortOrder: 0,
  },
  {
    id: 'rs_go',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_go',
    category: 'Languages',
    level: 'proficient',
    sortOrder: 1,
  },
  {
    id: 'rs_python',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_python',
    category: 'Languages',
    level: 'working',
    sortOrder: 2,
  },
  {
    id: 'rs_postgres',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_postgres',
    category: 'Data',
    level: 'expert',
    sortOrder: 3,
  },
  {
    id: 'rs_redis',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_redis',
    category: 'Data',
    level: 'proficient',
    sortOrder: 4,
  },
  {
    id: 'rs_kafka',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_kafka',
    category: 'Data',
    level: 'working',
    sortOrder: 5,
  },
  {
    id: 'rs_aws',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_aws',
    category: 'Cloud',
    level: 'proficient',
    sortOrder: 6,
  },
  {
    id: 'rs_docker',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_docker',
    category: 'Cloud',
    level: 'proficient',
    sortOrder: 7,
  },
  {
    id: 'rs_cicd',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_cicd',
    category: 'Cloud',
    level: 'working',
    sortOrder: 8,
  },
  {
    id: 'rs_system',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_system',
    category: 'Practices',
    level: 'proficient',
    sortOrder: 9,
  },
  {
    id: 'rs_testing',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_testing',
    category: 'Practices',
    level: 'proficient',
    sortOrder: 10,
  },
  {
    id: 'rs_microservices',
    resumeId: MASTER_RESUME_ID,
    skillId: 'skill_microservices',
    category: 'Practices',
    level: 'working',
    sortOrder: 11,
  },
]

export const masterResume: MasterResumeData = {
  resume,
  experience,
  education,
  skills: resumeSkills,
  projects,
  certifications,
  languages,
}

export const companies: Company[] = [
  {
    id: 'company_stripe',
    userId: USER_ID,
    name: 'Stripe',
    normalizedName: 'stripe',
    website: 'stripe.com',
    careersUrl: 'stripe.com/jobs',
    industry: 'Fintech',
    size: '5000+',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'company_linear',
    userId: USER_ID,
    name: 'Linear',
    normalizedName: 'linear',
    website: 'linear.app',
    industry: 'Software',
    size: '50-200',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'company_vercel',
    userId: USER_ID,
    name: 'Vercel',
    normalizedName: 'vercel',
    website: 'vercel.com',
    industry: 'Developer tools',
    size: '200-500',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'company_notion',
    userId: USER_ID,
    name: 'Notion',
    normalizedName: 'notion',
    website: 'notion.so',
    industry: 'Productivity',
    size: '500-1000',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'company_figma',
    userId: USER_ID,
    name: 'Figma',
    normalizedName: 'figma',
    website: 'figma.com',
    industry: 'Design tools',
    size: '1000-5000',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'company_ramp',
    userId: USER_ID,
    name: 'Ramp',
    normalizedName: 'ramp',
    website: 'ramp.com',
    industry: 'Fintech',
    size: '500-1000',
    createdAt: now,
    updatedAt: now,
  },
]

const STRIPE_JD = `Backend Engineer, Payments Platform

We are looking for a backend engineer to work on the systems that move money for millions of businesses. You will design reliable, idempotent services, own them in production, and care deeply about correctness.

What you will do
- Build and operate payment services that handle millions of requests per day.
- Design idempotent APIs and event pipelines with strong consistency guarantees.
- Partner with product and risk teams to ship features safely.

Requirements
- Strong experience with a statically typed backend language (Go, Java, TypeScript).
- Deep understanding of relational databases and SQL.
- Experience with distributed systems, queues, and event-driven architecture.
- Familiarity with Kubernetes and cloud infrastructure.

Nice to have
- Payments or fintech experience.
- Experience with Kafka and streaming systems.`

const LINEAR_JD = `Platform Engineer

Linear is looking for a platform engineer to build the infrastructure that our product teams depend on. You will own developer experience, CI/CD, and the reliability of our internal systems.

What you will do
- Improve build and deployment pipelines used by every engineer.
- Build internal tooling that removes friction from shipping.
- Operate Kubernetes clusters and Terraform-managed infrastructure.

Requirements
- Strong TypeScript or Go.
- Experience running Kubernetes in production.
- Terraform and infrastructure-as-code fluency.
- A bias toward automation.

Nice to have
- Experience with observability and incident response.`

export const jobApplications: JobApplication[] = [
  {
    id: 'job_stripe',
    userId: USER_ID,
    companyId: 'company_stripe',
    position: 'Backend Engineer, Payments Platform',
    jobUrl: 'stripe.com/jobs/backend-engineer-payments',
    jobDescription: STRIPE_JD,
    location: 'San Francisco, CA',
    workMode: 'hybrid',
    employmentType: 'full_time',
    salaryMin: 180000,
    salaryMax: 240000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    expectedSalary: 220000,
    equity: '0.05%',
    bonus: '15% target',
    benefits: 'Medical, dental, 401k match',
    source: 'LinkedIn',
    appliedDate: '2026-06-08',
    status: 'interviewing',
    statusChangedAt: '2026-06-16T15:30:00.000Z',
    nextFollowUpDate: '2026-06-19',
    notes:
      'Recruiter reached out after applying. Team is rebuilding the ledger.',
    tailoredResumeId: 'tr_stripe_v2',
    createdAt: '2026-06-08T10:00:00.000Z',
    updatedAt: '2026-06-16T15:30:00.000Z',
  },
  {
    id: 'job_linear',
    userId: USER_ID,
    companyId: 'company_linear',
    position: 'Platform Engineer',
    jobDescription: LINEAR_JD,
    location: 'Remote',
    workMode: 'remote',
    employmentType: 'full_time',
    salaryMin: 160000,
    salaryMax: 200000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    expectedSalary: 190000,
    source: 'Referral (Sam)',
    appliedDate: '2026-06-08',
    status: 'applied',
    statusChangedAt: '2026-06-08T10:00:00.000Z',
    nextFollowUpDate: '2026-06-20',
    notes: 'Referred by Sam on the platform team.',
    tailoredResumeId: 'tr_linear_v1',
    createdAt: '2026-06-08T10:00:00.000Z',
    updatedAt: '2026-06-08T10:00:00.000Z',
  },
  {
    id: 'job_vercel',
    userId: USER_ID,
    companyId: 'company_vercel',
    position: 'Software Engineer, Infrastructure',
    location: 'Remote',
    workMode: 'remote',
    employmentType: 'full_time',
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    source: 'Company site',
    appliedDate: '2026-05-31',
    status: 'heard_back',
    statusChangedAt: '2026-06-10T09:00:00.000Z',
    notes: 'Recruiter screen scheduled.',
    createdAt: '2026-05-31T10:00:00.000Z',
    updatedAt: '2026-06-10T09:00:00.000Z',
  },
  {
    id: 'job_notion',
    userId: USER_ID,
    companyId: 'company_notion',
    position: 'Product Engineer',
    location: 'San Francisco, CA',
    workMode: 'hybrid',
    employmentType: 'full_time',
    source: 'LinkedIn',
    status: 'saved',
    nextFollowUpDate: '2026-06-22',
    notes: 'Interesting role, need a tailored resume before applying.',
    createdAt: '2026-05-26T10:00:00.000Z',
    updatedAt: '2026-05-26T10:00:00.000Z',
  },
  {
    id: 'job_figma',
    userId: USER_ID,
    companyId: 'company_figma',
    position: 'Senior Software Engineer',
    location: 'Remote',
    workMode: 'remote',
    employmentType: 'full_time',
    source: 'Job board',
    appliedDate: '2026-05-12',
    status: 'rejected',
    statusChangedAt: '2026-06-02T12:00:00.000Z',
    notes: 'Rejected after the take-home. Nice team though.',
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-06-02T12:00:00.000Z',
  },
  {
    id: 'job_ramp',
    userId: USER_ID,
    companyId: 'company_ramp',
    position: 'Infrastructure Engineer',
    location: 'New York, NY',
    workMode: 'hybrid',
    employmentType: 'full_time',
    salaryMin: 190000,
    salaryMax: 250000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    source: 'Recruiter',
    appliedDate: '2026-04-28',
    status: 'offer',
    statusChangedAt: '2026-06-14T17:00:00.000Z',
    nextFollowUpDate: '2026-06-21',
    notes: 'Offer received. Decision needed by June 28.',
    createdAt: '2026-04-28T10:00:00.000Z',
    updatedAt: '2026-06-14T17:00:00.000Z',
  },
]

const history = (
  jobApplicationId: string,
  entries: [string, ApplicationStatusHistory['status'], string?][],
): ApplicationStatusHistory[] =>
  entries.map(([changedAt, status, note], index) => ({
    id: `hist_${jobApplicationId}_${index}`,
    jobApplicationId,
    status,
    changedAt,
    note,
  }))

export const statusHistory: ApplicationStatusHistory[] = [
  ...history('job_stripe', [
    ['2026-06-08T10:00:00.000Z', 'applied', 'Applied with tailored resume v1.'],
    ['2026-06-10T09:00:00.000Z', 'heard_back', 'Recruiter email.'],
    ['2026-06-16T15:30:00.000Z', 'interviewing', 'Recruiter screen went well.'],
  ]),
  ...history('job_linear', [
    ['2026-06-08T10:00:00.000Z', 'applied', 'Applied via referral.'],
  ]),
  ...history('job_vercel', [
    ['2026-05-31T10:00:00.000Z', 'applied', ''],
    ['2026-06-10T09:00:00.000Z', 'heard_back', 'Recruiter screen scheduled.'],
  ]),
  ...history('job_notion', [['2026-05-26T10:00:00.000Z', 'saved', '']]),
  ...history('job_figma', [
    ['2026-05-12T10:00:00.000Z', 'applied', ''],
    ['2026-05-20T12:00:00.000Z', 'interviewing', 'Take-home sent.'],
    ['2026-06-02T12:00:00.000Z', 'rejected', 'Not moving forward.'],
  ]),
  ...history('job_ramp', [
    ['2026-04-28T10:00:00.000Z', 'applied', ''],
    ['2026-05-06T12:00:00.000Z', 'interviewing', 'Onsite loop.'],
    ['2026-06-14T17:00:00.000Z', 'offer', 'Offer received.'],
  ]),
]

export const interviews: Interview[] = [
  {
    id: 'int_1',
    jobApplicationId: 'job_stripe',
    round: 1,
    type: 'phone',
    scheduledAt: '2026-06-16T15:00:00.000Z',
    outcome: 'Passed',
    notes: 'Recruiter screen, 30 minutes.',
  },
  {
    id: 'int_2',
    jobApplicationId: 'job_stripe',
    round: 2,
    type: 'technical',
    scheduledAt: '2026-06-23T17:00:00.000Z',
    outcome: 'Scheduled',
    notes: 'System design with the payments team.',
  },
  {
    id: 'int_3',
    jobApplicationId: 'job_ramp',
    round: 1,
    type: 'virtual',
    scheduledAt: '2026-05-06T14:00:00.000Z',
    outcome: 'Passed',
    notes: 'Hiring manager conversation.',
  },
]

export const contacts: ContactPerson[] = [
  {
    id: 'contact_1',
    jobApplicationId: 'job_stripe',
    name: 'Priya Nair',
    role: 'Technical Recruiter',
    email: 'priya@stripe.com',
    notes: 'Responsive. Prefers email.',
  },
  {
    id: 'contact_2',
    jobApplicationId: 'job_ramp',
    name: 'Marcus Lee',
    role: 'Engineering Manager',
    email: 'marcus@ramp.com',
  },
]

export const jobAttachments: JobAttachment[] = [
  {
    id: 'att_1',
    jobApplicationId: 'job_stripe',
    type: 'resume',
    pdfKey: 'users/user_demo/jobs/job_stripe/resume_v2.pdf',
    fileName: 'jane-doe-stripe-backend-v2.pdf',
  },
  {
    id: 'att_2',
    jobApplicationId: 'job_stripe',
    type: 'cover_letter',
    pdfKey: 'users/user_demo/jobs/job_stripe/cover-letter.pdf',
    fileName: 'jane-doe-stripe-cover-letter.pdf',
  },
  {
    id: 'att_3',
    jobApplicationId: 'job_linear',
    type: 'resume',
    pdfKey: 'users/user_demo/jobs/job_linear/resume_v1.pdf',
    fileName: 'jane-doe-linear-platform-v1.pdf',
  },
]

export const jobSkills: JobSkill[] = [
  {
    id: 'js_1',
    jobApplicationId: 'job_stripe',
    skillId: 'skill_go',
    required: true,
    source: 'manual',
  },
  {
    id: 'js_2',
    jobApplicationId: 'job_stripe',
    skillId: 'skill_postgres',
    required: true,
    source: 'manual',
  },
  {
    id: 'js_3',
    jobApplicationId: 'job_stripe',
    skillId: 'skill_kafka',
    required: false,
    source: 'manual',
  },
  {
    id: 'js_4',
    jobApplicationId: 'job_stripe',
    skillId: 'skill_k8s',
    required: true,
    source: 'manual',
  },
  {
    id: 'js_5',
    jobApplicationId: 'job_stripe',
    skillId: 'skill_ts',
    required: false,
    source: 'manual',
  },
  {
    id: 'js_6',
    jobApplicationId: 'job_linear',
    skillId: 'skill_ts',
    required: true,
    source: 'manual',
  },
  {
    id: 'js_7',
    jobApplicationId: 'job_linear',
    skillId: 'skill_go',
    required: false,
    source: 'manual',
  },
  {
    id: 'js_8',
    jobApplicationId: 'job_linear',
    skillId: 'skill_k8s',
    required: true,
    source: 'manual',
  },
  {
    id: 'js_9',
    jobApplicationId: 'job_linear',
    skillId: 'skill_terraform',
    required: true,
    source: 'manual',
  },
  {
    id: 'js_10',
    jobApplicationId: 'job_stripe',
    skillId: 'skill_microservices',
    required: false,
    source: 'manual',
  },
]

export function buildTailoredData(
  overrides: Partial<TailoredResumeData> = {},
): TailoredResumeData {
  const base: TailoredResumeData = {
    headline: resume.headline,
    summary: resume.summary,
    contact: { ...resume.contact },
    experience: experience.map((item) => ({
      company: item.company,
      title: item.title,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      bullets: [...item.bullets],
    })),
    education: education.map((item) => ({
      school: item.school,
      degree: item.degree,
      field: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      gpa: item.gpa,
    })),
    skills: resumeSkills.map((item) => {
      const skill = skills.find((candidate) => candidate.id === item.skillId)
      return {
        name: skill?.name ?? 'Unknown',
        category: item.category,
        level: item.level,
      }
    }),
    projects: projects.map((item) => ({
      name: item.name,
      description: item.description,
      techStack: [...item.techStack],
      link: item.link,
    })),
    certifications: certifications.map((item) => ({
      name: item.name,
      issuer: item.issuer,
      issuedDate: item.issuedDate,
      link: item.link,
    })),
    languages: languages.map((item) => ({
      name: item.name,
      proficiency: item.proficiency,
    })),
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
  }

  return { ...base, ...overrides }
}

export const tailoredResumes: TailoredResume[] = [
  {
    id: 'tr_stripe_v1',
    userId: USER_ID,
    resumeId: MASTER_RESUME_ID,
    jobApplicationId: 'job_stripe',
    version: 1,
    data: buildTailoredData({
      headline: 'Backend Engineer',
      summary:
        'Backend engineer specializing in payment systems, idempotent APIs, and event-driven pipelines at scale.',
    }),
    pdfKey: 'users/user_demo/tailored/tr_stripe_v1.pdf',
    fileName: 'jane-doe-stripe-backend-v1.pdf',
    createdAt: '2026-06-08T09:40:00.000Z',
    updatedAt: '2026-06-08T09:40:00.000Z',
  },
  {
    id: 'tr_stripe_v2',
    userId: USER_ID,
    resumeId: MASTER_RESUME_ID,
    jobApplicationId: 'job_stripe',
    version: 2,
    data: buildTailoredData({
      headline: 'Backend Engineer, Payments',
      summary:
        'Backend engineer with eight years building payment infrastructure and distributed systems. Focused on correctness, idempotency, and measurable latency wins.',
      experience: experience.map((item) => ({
        company: item.company,
        title: item.title,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        current: item.current,
        bullets: item.bullets.filter(
          (bullet) => !bullet.startsWith('Mentored'),
        ),
      })),
    }),
    pdfKey: 'users/user_demo/tailored/tr_stripe_v2.pdf',
    fileName: 'jane-doe-stripe-backend-v2.pdf',
    createdAt: '2026-06-16T14:50:00.000Z',
    updatedAt: '2026-06-16T14:50:00.000Z',
  },
  {
    id: 'tr_linear_v1',
    userId: USER_ID,
    resumeId: MASTER_RESUME_ID,
    jobApplicationId: 'job_linear',
    version: 1,
    data: buildTailoredData({
      headline: 'Platform Engineer',
      summary:
        'Backend and platform engineer with strong TypeScript and Go, focused on developer experience and reliable infrastructure.',
    }),
    pdfKey: 'users/user_demo/tailored/tr_linear_v1.pdf',
    fileName: 'jane-doe-linear-platform-v1.pdf',
    createdAt: '2026-06-08T09:55:00.000Z',
    updatedAt: '2026-06-08T09:55:00.000Z',
  },
]
