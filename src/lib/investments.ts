interface Investment {
  name: string;
  description: string;
  url?: string;
  /** Year of investment, shown at the right of the description. */
  year?: number;
}

export const INVESTMENTS: readonly Investment[] = [
  {
    name: "Paper Design",
    description: "A connected design canvas for teams building with code and AI.",
    url: "https://paper.design/",
    year: 2025,
  },
  {
    name: "QuiverAI",
    description: "AI models for generating, editing, and animating vector graphics.",
    url: "https://quiver.ai/",
    year: 2025,
  },
  {
    name: "Spencer",
    description: "An AI agent that runs influencer marketing campaigns end to end.",
    url: "https://spenceragent.com/",
    year: 2025,
  },
  {
    name: "Mecha Corporation",
    description: "Artificially intelligent autonomous robots.",
    url: "https://www.mechacorp.ai/",
    year: 2026,
  },
  {
    name: "Proto",
    description: "Visual prototyping tools that help turn ideas into software.",
    url: "https://prototypes.fun/",
    year: 2026,
  },
  {
    name: "Trama",
    description: "Automating routine work so people can focus on ideas and decisions.",
    url: "https://trama.works/",
    year: 2026,
  },
  {
    name: "Mafer",
    description: "AI that turns technical R&D history into tools for formulation teams.",
    url: "https://www.mafer.ai/",
    year: 2026,
  },
  {
    name: "Mito",
    description: "A collaborative canvas for creating video with AI.",
    url: "https://mito.ai/",
    year: 2026,
  },
];
