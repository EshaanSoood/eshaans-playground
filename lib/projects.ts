export interface ProjectConfig {
  name: string
  description: string
  color: string
}

export const projects: Record<string, ProjectConfig> = {
  playground: {
    name: 'Eshaan\'s Playground',
    description: 'My journey learning web development and building projects.',
    color: 'project-blue',
  },
  'portfolio-site': {
    name: 'Portfolio Site',
    description: 'Building my personal portfolio website from scratch.',
    color: 'project-emerald',
  },
  'first-project': {
    name: 'First Project',
    description: 'My very first web development project.',
    color: 'project-violet',
  },
  'accessibility-project': {
    name: 'Accessibility Project',
    description: 'Exploring accessibility best practices in web development.',
    color: 'project-amber',
  },
}

export function getProjectConfig(projectId: string): ProjectConfig | null {
  return projects[projectId] || null
}

export function getAllProjectIds(): string[] {
  return Object.keys(projects)
}

