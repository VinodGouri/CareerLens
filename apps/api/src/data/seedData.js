export const SEED_USERS = [
  {
    id: "user_fresher_01",
    email: "rahul.sharma@example.com",
    name: "Rahul Sharma",
    role: "USER",
    headline: "Aspiring Full Stack Engineer | B.Tech CSE '25",
    summary: "Final year B.Tech student with strong foundation in JavaScript, React, Node.js, and modern web architectures. Built scalable web applications with hands-on internship experience.",
    location: "Hyderabad, India",
    phone: "+91 98765 43210",
    linkedin_url: "https://linkedin.com/in/rahulsharma-dev",
    github_url: "https://github.com/rahulsharma-dev",
    portfolio_url: "https://rahulsharma.dev",
    experience_level: "FRESHER",
    preferred_roles: ["Full Stack Developer", "Software Engineer", "Frontend Developer", "Backend Developer"],
    preferred_locations: ["Hyderabad", "Bangalore", "Remote", "Pune"],
    work_modes: ["REMOTE", "HYBRID"],
    expected_salary: "₹6,00,000 - ₹10,00,000",
    education: [
      {
        id: "edu_01",
        institution: "JNTU College of Engineering, Hyderabad",
        degree: "B.Tech",
        field: "Computer Science and Engineering",
        start_year: 2021,
        end_year: 2025,
        grade: "8.6 CGPA",
        course_type: "Full Time"
      }
    ],
    experience: [
      {
        id: "exp_01",
        company: "TechNova Solutions",
        role: "Software Engineering Intern",
        employment_type: "Internship",
        start_date: "2024-05",
        end_date: "2024-11",
        description: "Contributed to building real-time collaboration dashboards using React and Express. Reduced API latency by 28% through Redis caching.",
        technologies: ["React", "Node.js", "Express.js", "MongoDB", "Redis"]
      }
    ],
    projects: [
      {
        id: "proj_01",
        name: "CampusConnect LMS Platform",
        description: "Modern full-stack learning management platform featuring video courses, quiz engines, and automated assignment grading.",
        technologies: ["React", "Node.js", "Express.js", "PostgreSQL", "REST APIs"],
        github_url: "https://github.com/rahulsharma-dev/campusconnect",
        live_url: "https://campusconnect-demo.vercel.app",
        role: "Full Stack Lead",
        achievements: "Engineered scalable REST APIs serving 1,200+ concurrent students with 99.8% uptime."
      },
      {
        id: "proj_02",
        name: "PrayerWall Community Portal",
        description: "Community-driven prayer and support message board featuring real-time updates and localized tagging.",
        technologies: ["React", "Tailwind CSS", "Node.js", "MongoDB"],
        github_url: "https://github.com/rahulsharma-dev/prayerwall",
        live_url: "https://prayerwall.live",
        role: "Frontend & Full Stack Dev",
        achievements: "Implemented responsive glassmorphism UI and optimistic UI updates for instant interactions."
      }
    ],
    skills: [
      { id: "s_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["CampusConnect LMS Platform", "PrayerWall Community Portal", "TechNova Internship"] },
      { id: "s_javascript", name: "JavaScript", category: "Programming", proficiency: "ADVANCED", years: 3, evidence: ["All Academic & Personal Projects"] },
      { id: "s_nodejs", name: "Node.js", category: "Backend", proficiency: "INTERMEDIATE", years: 2, evidence: ["CampusConnect LMS Platform", "TechNova Internship"] },
      { id: "s_express", name: "Express.js", category: "Backend", proficiency: "INTERMEDIATE", years: 2, evidence: ["TechNova Internship", "CampusConnect API"] },
      { id: "s_postgresql", name: "PostgreSQL", category: "Database", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["CampusConnect LMS Platform"] },
      { id: "s_mongodb", name: "MongoDB", category: "Database", proficiency: "INTERMEDIATE", years: 2, evidence: ["PrayerWall Portal"] },
      { id: "s_rest", name: "REST APIs", category: "Backend", proficiency: "ADVANCED", years: 2, evidence: ["Built 30+ endpoints across projects"] },
      { id: "s_python", name: "Python", category: "Programming", proficiency: "INTERMEDIATE", years: 2, evidence: ["Data Structures & Algorithms coursework"] },
      { id: "s_git", name: "Git & GitHub", category: "DevOps", proficiency: "ADVANCED", years: 3, evidence: ["Daily version control & team pull requests"] },
      { id: "s_tailwind", name: "Tailwind CSS", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["PrayerWall UI & Portfolio"] }
    ]
  },
  {
    id: "user_junior_02",
    email: "priya.nair@example.com",
    name: "Priya Nair",
    role: "USER",
    headline: "Frontend Engineer (1.5 YOE) transitioning to Full Stack",
    summary: "Frontend engineer building performant web applications with React and TypeScript. Eager to expand into backend architecture and microservices.",
    location: "Bangalore, India",
    phone: "+91 91234 56789",
    linkedin_url: "https://linkedin.com/in/priyanair",
    github_url: "https://github.com/priyanair",
    portfolio_url: "https://priyanair.io",
    experience_level: "EARLY_CAREER",
    preferred_roles: ["Full Stack Developer", "Software Engineer", "Frontend Developer"],
    preferred_locations: ["Bangalore", "Remote"],
    work_modes: ["REMOTE", "HYBRID"],
    expected_salary: "₹10,00,000 - ₹15,00,000",
    education: [
      {
        id: "edu_02",
        institution: "PES University, Bangalore",
        degree: "B.E.",
        field: "Information Science",
        start_year: 2019,
        end_year: 2023,
        grade: "9.1 CGPA",
        course_type: "Full Time"
      }
    ],
    experience: [
      {
        id: "exp_02",
        company: "CognitiveCloud Technologies",
        role: "Associate Frontend Developer",
        employment_type: "Full Time",
        start_date: "2023-07",
        end_date: "Present",
        description: "Developed core design system components in React and TypeScript. Improved page load time (LCP) by 35%.",
        technologies: ["React", "TypeScript", "Next.js", "Redux Toolkit", "Tailwind CSS"]
      }
    ],
    projects: [
      {
        id: "proj_03",
        name: "DevPulse Analytics Dashboard",
        description: "Developer telemetry dashboard aggregating GitHub metrics, CI/CD pipeline health, and deploy frequency.",
        technologies: ["React", "Node.js", "GraphQL", "PostgreSQL", "Docker"],
        github_url: "https://github.com/priyanair/devpulse",
        live_url: "https://devpulse.preview.io",
        role: "Creator",
        achievements: "Built custom interactive charts with SVG and optimized payload size by 40%."
      }
    ],
    skills: [
      { id: "s_react", name: "React", category: "Frontend", proficiency: "ADVANCED", years: 2.5, evidence: ["CognitiveCloud Production Apps"] },
      { id: "s_typescript", name: "TypeScript", category: "Programming", proficiency: "ADVANCED", years: 2, evidence: ["Enterprise Codebase at CognitiveCloud"] },
      { id: "s_javascript", name: "JavaScript", category: "Programming", proficiency: "ADVANCED", years: 3, evidence: ["Full Web Stack"] },
      { id: "s_tailwind", name: "Tailwind CSS", category: "Frontend", proficiency: "ADVANCED", years: 2, evidence: ["Design System Component Library"] },
      { id: "s_nextjs", name: "Next.js", category: "Frontend", proficiency: "INTERMEDIATE", years: 1.5, evidence: ["CognitiveCloud Client Portals"] },
      { id: "s_docker", name: "Docker", category: "DevOps", proficiency: "BEGINNER", years: 0.5, evidence: ["DevPulse containerization"] }
    ]
  }
];

export const SEED_JOBS = [
  {
    id: "job_abc_01",
    source_id: "src_linkedin",
    source: "LinkedIn",
    external_job_id: "li_4091823",
    title: "Software Engineer - Early Career / Fresher",
    company: "ABC Technologies",
    location: "Hyderabad, India",
    work_mode: "HYBRID",
    employment_type: "FULL_TIME",
    experience_min: 0,
    experience_max: 2,
    salary_min: "₹6,00,000",
    salary_max: "₹10,00,000",
    source_url: "https://www.linkedin.com/jobs/view/early-career-software-engineer-hyderabad-4091823",
    posted_at: "2026-09-26T10:00:00Z",
    description: "ABC Technologies is looking for a passionate Software Engineer to join our core digital engineering team. In this role, you will design and develop performant web applications, collaborate with cross-functional teams, and participate in code reviews.",
    responsibilities: [
      "Develop responsive and resilient frontend interfaces with React.",
      "Design and maintain scalable RESTful microservices in Node.js / Express.",
      "Write optimized SQL queries and manage relational schemas with PostgreSQL.",
      "Collaborate with senior architects to implement cloud native deployment best practices."
    ],
    requirements: [
      "Bachelor's degree in Computer Science, Information Technology, or related discipline.",
      "Strong command of JavaScript (ES6+), React, and Node.js.",
      "Solid understanding of relational databases (PostgreSQL or MySQL).",
      "Demonstrated projects or internships showcasing full stack capability."
    ],
    preferred_qualifications: [
      "Familiarity with containerization tools like Docker.",
      "Basic exposure to cloud platforms (AWS, GCP, or Azure).",
      "Experience with in-memory caching solutions like Redis."
    ],
    required_skills: ["React", "JavaScript", "Node.js", "PostgreSQL", "REST APIs"],
    preferred_skills: ["Docker", "AWS", "Redis"],
    nice_to_have_skills: ["Kubernetes", "GraphQL", "CI/CD Pipelines"]
  },
  {
    id: "job_razor_02",
    source_id: "src_naukri",
    source: "Naukri",
    external_job_id: "nk_8819234",
    title: "Junior Full Stack Developer",
    company: "FinFlow Labs",
    location: "Bangalore, India",
    work_mode: "REMOTE",
    employment_type: "FULL_TIME",
    experience_min: 0,
    experience_max: 2,
    salary_min: "₹8,00,000",
    salary_max: "₹13,00,000",
    source_url: "https://www.naukri.com/job-listings-junior-full-stack-developer-finflow-bangalore-8819234",
    posted_at: "2026-09-27T14:30:00Z",
    description: "Join India's fastest growing fintech infrastructure startup! We are hiring ambitious junior developers who take pride in crafting immaculate code and learning rapidly.",
    responsibilities: [
      "Build high throughput financial dashboard components and payment tracking pipelines.",
      "Implement idempotent REST and Webhook endpoints.",
      "Ensure robust security, input sanitization, and automated unit testing."
    ],
    requirements: [
      "Hands-on proficiency with React, Node.js, and TypeScript.",
      "Experience with relational data models (PostgreSQL) and database migrations.",
      "Understanding of asynchronous execution and event loops."
    ],
    preferred_qualifications: [
      "Understanding of message queues (Kafka or RabbitMQ).",
      "Experience deploying containerized applications with Docker on AWS."
    ],
    required_skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    preferred_skills: ["Docker", "AWS", "Testing", "Redis"],
    nice_to_have_skills: ["Kafka", "Next.js"]
  },
  {
    id: "job_swiggy_03",
    source_id: "src_indeed",
    source: "Indeed",
    external_job_id: "in_3381921",
    title: "Associate Frontend Engineer",
    company: "HyperLocal Technologies",
    location: "Bangalore, India",
    work_mode: "HYBRID",
    employment_type: "FULL_TIME",
    experience_min: 0,
    experience_max: 2,
    salary_min: "₹7,00,000",
    salary_max: "₹11,00,000",
    source_url: "https://in.indeed.com/viewjob?jk=hyperlocal-frontend-3381921",
    posted_at: "2026-09-28T08:15:00Z",
    description: "We are seeking an Associate Frontend Engineer to build consumer-facing applications delivering delight to millions of daily active users across India.",
    responsibilities: [
      "Implement pixel-perfect mobile-first web designs using React and Tailwind CSS.",
      "Optimize Core Web Vitals (LCP, INP, CLS) for low-bandwidth cellular networks.",
      "Work closely with product designers to prototype fluid micro-animations."
    ],
    requirements: [
      "Demonstrable mastery of JavaScript/HTML5/CSS3.",
      "Experience with modern React patterns (Hooks, Context, State Management).",
      "Knowledge of responsive layout principles and cross-browser quirks."
    ],
    preferred_qualifications: [
      "Experience with Next.js or server-side rendering.",
      "Exposure to testing with Vitest / Jest and React Testing Library."
    ],
    required_skills: ["React", "JavaScript", "Tailwind CSS", "HTML/CSS", "Git & GitHub"],
    preferred_skills: ["TypeScript", "Next.js", "Testing"],
    nice_to_have_skills: ["Framer Motion", "Webpack/Vite"]
  },
  {
    id: "job_wellfound_04",
    source_id: "src_wellfound",
    source: "Wellfound",
    external_job_id: "wf_9921045",
    title: "Full Stack Engineer (Founding Cohort)",
    company: "CogniMesh AI",
    location: "Pune, India",
    work_mode: "REMOTE",
    employment_type: "FULL_TIME",
    experience_min: 1,
    experience_max: 3,
    salary_min: "₹12,00,000",
    salary_max: "₹18,00,000",
    source_url: "https://wellfound.com/jobs/cognimesh-founding-full-stack-9921045",
    posted_at: "2026-09-25T17:00:00Z",
    description: "CogniMesh AI is building generative intelligence workflows for modern enterprise ops. You will work directly with founders to translate product specs into production-grade systems.",
    responsibilities: [
      "Architect end-to-end full stack features from interactive frontend to background AI processing queues.",
      "Integrate LLM API calls, embedding vectors, and RAG pipelines.",
      "Maintain infrastructure via Docker and AWS ECS."
    ],
    requirements: [
      "1-3 years full stack experience or exceptional open source contributions.",
      "Proven proficiency with React, Node.js or Python, and modern databases.",
      "High autonomy, curiosity, and rapid iteration speed."
    ],
    preferred_qualifications: [
      "Experience with Vector databases (pgvector, Pinecone).",
      "Strong skills in Docker and AWS deployment."
    ],
    required_skills: ["React", "Node.js", "Python", "PostgreSQL", "Docker"],
    preferred_skills: ["AWS", "pgvector", "Redis", "TypeScript"],
    nice_to_have_skills: ["FastAPI", "LangChain", "Kubernetes"]
  },
  {
    id: "job_zoho_05",
    source_id: "src_company",
    source: "Company Careers",
    external_job_id: "co_550192",
    title: "Graduate Software Trainee",
    company: "ZetaCloud Systems",
    location: "Chennai / Hyderabad, India",
    work_mode: "ON_SITE",
    employment_type: "FULL_TIME",
    experience_min: 0,
    experience_max: 1,
    salary_min: "₹5,50,000",
    salary_max: "₹8,00,000",
    source_url: "https://careers.zetaclouddot.com/openings/graduate-software-trainee-550192",
    posted_at: "2026-09-28T09:00:00Z",
    description: "Comprehensive training and mentorship program designed for recent graduates to master cloud enterprise engineering.",
    responsibilities: [
      "Undergo rigorous training in data structures, enterprise backend frameworks, and secure coding.",
      "Shadow senior engineers in building customer portal features."
    ],
    requirements: [
      "Recent graduate (B.E./B.Tech/MCA 2024-2025).",
      "Strong problem-solving ability in Java, Python, or JavaScript.",
      "Clear concepts of OOP and Database Management."
    ],
    preferred_qualifications: [
      "Participation in coding competitions or active GitHub projects."
    ],
    required_skills: ["JavaScript", "Python", "Database Fundamentals", "Data Structures & Algorithms"],
    preferred_skills: ["React", "Node.js", "Git & GitHub"],
    nice_to_have_skills: ["Linux", "SQL"]
  }
];

export const SEED_LEARNING_RESOURCES = [
  {
    id: "res_docker_01",
    skill: "Docker",
    title: "Docker Official Get Started Tutorial",
    provider: "Docker Docs",
    url: "https://docs.docker.com/get-started/",
    resource_type: "DOCUMENTATION",
    difficulty: "BEGINNER",
    duration: "3 hours",
    verified: true,
    steps: [
      "1. Understand Containers vs Virtual Machines",
      "2. Write your first Dockerfile for a Node.js Express API",
      "3. Build and tag images: `docker build -t my-app .`",
      "4. Container networking and bind mounts for development",
      "5. Compose multi-service applications using `docker-compose.yml`"
    ]
  },
  {
    id: "res_aws_01",
    skill: "AWS",
    title: "AWS Fundamentals for Full-Stack Developers",
    provider: "AWS Skill Builder & Official Guides",
    url: "https://aws.amazon.com/getting-started/hands-on/",
    resource_type: "COURSE",
    difficulty: "BEGINNER_TO_INTERMEDIATE",
    duration: "6 hours",
    verified: true,
    steps: [
      "1. Cloud Concepts: Regions, Availability Zones, and VPCs",
      "2. Identity & Access Management (IAM): Users, Roles & Policies",
      "3. Compute: Deploying a web service on Amazon EC2",
      "4. Storage: S3 Buckets for assets & Presigned URLs",
      "5. Database: Amazon RDS with PostgreSQL"
    ]
  },
  {
    id: "res_redis_01",
    skill: "Redis",
    title: "Redis University: RU101 Introduction to Redis Data Structures",
    provider: "Redis University",
    url: "https://university.redis.io/",
    resource_type: "COURSE",
    difficulty: "BEGINNER",
    duration: "4 hours",
    verified: true,
    steps: [
      "1. Strings, Hashes, and Lists in Redis",
      "2. Caching patterns: Cache-Aside vs Write-Through",
      "3. Setting TTL and Cache Invalidation strategies",
      "4. Implementing Redis with Node.js and Redis client",
      "5. Pub/Sub and Queueing basics with BullMQ"
    ]
  },
  {
    id: "res_ts_01",
    skill: "TypeScript",
    title: "TypeScript for JavaScript Programmers",
    provider: "TypeScriptlang.org",
    url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
    resource_type: "TUTORIAL",
    difficulty: "INTERMEDIATE",
    duration: "4 hours",
    verified: true,
    steps: [
      "1. Static typing vs Dynamic typing: Why TypeScript?",
      "2. Interfaces, Types, Unions, and Intersections",
      "3. Generics and Utility Types (Partial, Pick, Omit)",
      "4. Typing React Components, Props, and State hooks",
      "5. Strict mode and tsconfig best practices"
    ]
  },
  {
    id: "res_testing_01",
    skill: "Testing",
    title: "Modern JavaScript Testing with Vitest & RTL",
    provider: "Testing JavaScript",
    url: "https://vitest.dev/guide/",
    resource_type: "DOCUMENTATION",
    difficulty: "INTERMEDIATE",
    duration: "5 hours",
    verified: true,
    steps: [
      "1. Unit Testing vs Integration Testing vs E2E",
      "2. Writing tests with Vitest",
      "3. Mocking HTTP requests and API responses",
      "4. Testing React UI components with React Testing Library",
      "5. Integrating test suites into GitHub Actions CI"
    ]
  }
];

export const SEED_APPLICATIONS = [
  {
    id: "app_01",
    user_id: "user_fresher_01",
    job_id: "job_abc_01",
    job_title: "Software Engineer - Early Career / Fresher",
    company: "ABC Technologies",
    location: "Hyderabad, India",
    source: "LinkedIn",
    status: "ASSESSMENT",
    applied_at: "2026-09-24",
    match_score: 87,
    notes: "Completed online coding assessment (HackerRank - 2 DSA questions on Arrays and DP). Awaiting technical interview scheduling."
  },
  {
    id: "app_02",
    user_id: "user_fresher_01",
    job_id: "job_swiggy_03",
    job_title: "Associate Frontend Engineer",
    company: "HyperLocal Technologies",
    location: "Bangalore, India",
    source: "Indeed",
    status: "INTERVIEW",
    applied_at: "2026-09-20",
    match_score: 89,
    notes: "Round 1 Technical Screening scheduled for Thursday 3:00 PM IST. Reviewing React Hooks and DOM event delegation."
  },
  {
    id: "app_03",
    user_id: "user_fresher_01",
    job_id: "job_razor_02",
    job_title: "Junior Full Stack Developer",
    company: "FinFlow Labs",
    location: "Bangalore, India",
    source: "Naukri",
    status: "APPLIED",
    applied_at: "2026-09-27",
    match_score: 82,
    notes: "Applied directly on portal with ATS-tailored resume."
  }
];
