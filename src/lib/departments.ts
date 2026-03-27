/**
 * Department definitions for PHANET KNUST.
 * Single source of truth for all department names, descriptions, and join rules.
 */

export interface Department {
  id: string;
  name: string;
  description: string;
  /** Whether members can select this department during registration */
  canJoin: boolean;
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'cec',
    name: 'Central Executive Committee',
    description: 'The governing body of PHANET KNUST responsible for overall leadership and strategic direction.',
    canJoin: false,
  },
  {
    id: 'media-graphics',
    name: 'Media & Graphics',
    description: 'Handles photography, livestreams, flyer design, video production, and all visual content for the ministry.',
    canJoin: true,
  },
  {
    id: 'finance-welfare',
    name: 'Finance & Welfare',
    description: 'Manages fundraising, accounting, budgeting, and member welfare — ensuring the financial health of the ministry and the well-being of every member.',
    canJoin: true,
  },
  {
    id: 'prayer',
    name: 'Prayer',
    description: 'Organises prayer sessions, retreats, and intercession for members, the body of Christ, and souls at large.',
    canJoin: true,
  },
  {
    id: 'creative-arts',
    name: 'Creative Arts',
    description: 'The creative expression arm — drama, film production, poetry, spoken word, and artistic performances that glorify God.',
    canJoin: true,
  },
  {
    id: 'instruments-sound',
    name: 'Instruments & Sound',
    description: 'Manages musical instruments, sound engineering, and audio-visual equipment for all services and events.',
    canJoin: true,
  },
  {
    id: 'protocol-ushering',
    name: 'Protocol & Ushering',
    description: 'Responsible for venue management, ushering, seating arrangements, and maintaining order during services and events.',
    canJoin: true,
  },
  {
    id: 'birthdays',
    name: 'Birthdays',
    description: 'Plans and executes birthday surprises and celebrations for all members — making everyone feel loved and remembered.',
    canJoin: true,
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Provides student advising, academic support, extra tuition, study groups, and resources to help members excel academically.',
    canJoin: true,
  },
  {
    id: 'transport-mobilization',
    name: 'Transportation & Mobilization',
    description: 'Coordinates transportation for members during meetings, outreaches, and events, and mobilises members to attend gatherings.',
    canJoin: true,
  },
  {
    id: 'forex-crypto-business',
    name: 'Forex, Crypto & Business',
    description: 'Provides training in forex and crypto trading, business planning, capital support, and entrepreneurship skills for members.',
    canJoin: true,
  },
  {
    id: 'evangelism-outreaches',
    name: 'Evangelism & Outreaches',
    description: 'Focused on soul-winning, planning outreach events, healing crusades, and spreading the gospel to the community.',
    canJoin: true,
  },
  {
    id: 'heirs-of-zion',
    name: 'Heirs of Zion (Choir) KNUST',
    description: 'The musical arm of PHANET KNUST — a vibrant choir that leads worship and ministers through music at services and events.',
    canJoin: true,
  },
];

/** Departments that members can select during registration */
export const JOINABLE_DEPARTMENTS = DEPARTMENTS.filter(d => d.canJoin);

/** Get a department by its ID */
export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find(d => d.id === id);
}

/** Get a department's display name by its ID */
export function getDepartmentName(id: string): string {
  return getDepartmentById(id)?.name || id;
}
