export interface SampleData {
  id: string;
  name: string;
  role: string;
  category: string;
  jobDescription: string;
  resume: string;
}

export const SAMPLES: SampleData[] = [
  {
    id: 'junior-bi-analyst',
    name: 'Junior BI Analyst (Priya Sharma)',
    role: 'Junior Business Intelligence Analyst',
    category: 'Analytics & BI',
    jobDescription: `Role: Junior Business Intelligence Analyst
Company: Nexus Logistics Global
Location: Remote / Hybrid

About the Team:
Nexus Logistics Global is seeking an enthusiastic Junior Business Intelligence Analyst to transform operational delivery logs into decision-ready business intelligence reports and interactive dashboards.

Core Requirements:
- Bachelor's degree in Business, Analytics, Computer Science, Information Systems, or related quantitative field
- SQL querying proficiency (SELECT, complex JOINs, aggregations, data extraction)
- Hands-on experience building interactive dashboards using Tableau, Power BI, or similar modern BI platforms
- Effective stakeholder communication and ability to present KPI summaries to business partners

Preferred Qualifications:
- Exposure to data warehousing concepts or ETL workflows (plus)
- Python for basic data wrangling with pandas (good to have)`,
    resume: `Priya Sharma
GitHub: github.com/sample-priya (sample data)
Email: priya.sharma@example.com | Phone: (555) 019-2834
Location: Seattle, WA

Education
State University — B.S. in Information Systems, Graduated May 2024

Professional Summary
Detail-oriented analytics graduate with internship experience designing interactive dashboards and querying relational databases. Passionate about empowering operations teams with clear, automated reporting.

Work Experience
Business Intelligence Intern | DataViz Logistics (Jan 2024 – June 2024)
• Built weekly Tableau dashboards tracking delivery fulfillment metrics across 12 regional warehouses
• Queried PostgreSQL databases using complex SQL JOINs and CTEs to extract shipment records
• Collaborated with operations stakeholders to gather weekly reporting requirements and present KPI summaries

Project Experience
Academic Capstone: E-Commerce Sales Performance Dashboard (Fall 2023)
• Analyzed 50,000 transaction records in SQLite and developed an executive Power BI dashboard
• Designed automated ETL scripts in Python to clean and aggregate order data for the Database & Warehousing course

Technical Skills
• BI & Reporting: Tableau Desktop, Microsoft Power BI, Excel (PivotTables, Lookups)
• Databases & Languages: SQL, PostgreSQL, SQLite, Python (pandas, matplotlib)
• Core Concepts: Relational schema design, automated ETL pipelines, metric tracking`,
  },
  {
    id: 'frontend-engineer',
    name: 'Frontend Engineer (Alex Chen)',
    role: 'Frontend Software Engineer',
    category: 'Software Engineering',
    jobDescription: `Role: Frontend Software Engineer
Company: CloudPulse Technologies

About the Role:
We are looking for a Frontend Engineer with strong React and TypeScript experience to craft resilient web interfaces and design system components.

Requirements:
- Proven experience developing modern web applications with React and TypeScript
- Proficiency in CSS layout systems, responsive design, and Tailwind CSS
- Experience consuming RESTful APIs and managing client-side asynchronous data state

Preferred Qualifications:
- Familiarity with Next.js or server-side rendering architectures (plus)
- Experience writing unit tests with Vitest or Jest (good to have)`,
    resume: `Alex Chen
GitHub: github.com/sample-alexchen (sample data)
Email: alex.chen@example.com | San Francisco, CA

Professional Summary
Frontend Engineer with 2+ years of experience building accessible web applications and UI component libraries.

Work Experience
Frontend Software Engineer | WebScale Labs (2022 – Present)
• Developed responsive web dashboard components using React and TypeScript for cloud monitoring tools
• Styled reusable component library with Tailwind CSS following WCAG AA accessibility guidelines
• Implemented TanStack Query for caching RESTful APIs, reducing redundant network requests

Projects
CloudPulse Open Dashboard (2023)
• Built an open-source status page in React and TypeScript with live incident reporting
• Connected client application to backend REST APIs with optimistic mutation updates

Skills
• Frontend: React, TypeScript, JavaScript, Tailwind CSS, HTML5, CSS3
• Tools: Vite, Git, GitHub Actions, Figma`,
  },
  {
    id: 'product-ops',
    name: 'Product Operations (Marcus Rivera)',
    role: 'Product Operations Specialist',
    category: 'Operations & Strategy',
    jobDescription: `Role: Product Operations Specialist
Company: Omnifin Solutions

Requirements:
- Experience analyzing operational workflows and identifying process bottlenecks
- Strong spreadsheet modeling skills (Excel / Google Sheets) with complex formulas
- Cross-functional collaboration skills across product, customer success, and engineering

Preferred Qualifications:
- Familiarity with SQL for basic ad-hoc reporting (plus)
- Experience with Jira or project tracking workflows (good to have)`,
    resume: `Marcus Rivera
LinkedIn: linkedin.com/in/sample-marcus (sample data)
Email: marcus.rivera@example.com | Austin, TX

Summary
Results-driven Product Operations specialist focused on standardizing customer feedback loops and optimizing operational throughput.

Work Experience
Operations Associate | FinTech Bridge (2022 – 2024)
• Analyzed operational workflows across customer onboarding funnels to resolve processing delays
• Created advanced Excel financial models utilizing nested INDEX/MATCH formulas and scenario modeling
• Led bi-weekly sync meetings with engineering and support leads to prioritize bug triages

Projects
Internal Knowledge Hub Initiative (2023)
• Coordinated documentation of standard operating procedures across three cross-functional pods

Skills
• Operations: Process mapping, workflow automation, KPI tracking
• Tools: Advanced Excel, Google Sheets, Jira, Asana, Notion`,
  },
];
