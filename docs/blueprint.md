# **App Name**: Neon Bounties

## Core Features:

- Contract Board: Display active tasks as digital 'Bounty Cards' with task title, reward, difficulty, and status badges.
- AI Task Rewriter (The Fixer): Use Genkit to rewrite mundane tasks into cyberpunk-themed flavor text, activated via a 'Rewrite' tool next to the input.
- Local Data Persistence: Store task data in `localStorage` for MVP. Prepare architecture for future Firebase Data Connect integration.
- Bounty Claim: Implement satisfying visual effects when a user completes a task and 'Claims the Bounty'.
- Task Management: Functionality to create, update, and delete tasks.
- Credit Counter: Display total 'earnings' from completed tasks using the CreditCounter component.

## Style Guidelines:

- Background color: Black (#000000) for a dark, immersive cyberpunk feel.
- Primary color: Neon Green (#39FF14) for primary interactive elements.
- Accent color: Hot Pink (#FF00FF) for secondary interactive elements.
- Font: 'Courier Prime' (monospace) for a terminal-style interface. Note: currently only Google Fonts are supported.
- Lucide Icons for UI elements, emphasizing a clean, minimalist design.
- Responsive layout to ensure usability on various devices (desktop, tablet, mobile).
- Implement 'glitch' or 'hologram' style hover effects on interactive elements to enhance the cyberpunk aesthetic.