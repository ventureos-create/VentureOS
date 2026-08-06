import { BusinessPlanInputs } from "@/types";

/**
 * Generates a structured business plan from the founder's answers.
 *
 * This is a deterministic, template-driven generator — it runs entirely
 * client-side with no external API, so the app works out of the box with
 * zero extra setup. It is the intended extension point: swap the body of
 * this function for a call to your LLM of choice (Anthropic, OpenAI, etc.)
 * via a server route, keeping the same return shape, to get genuinely
 * generative output. See README.md → "What to extend first".
 */
export function generateBusinessPlan(inputs: BusinessPlanInputs) {
  const {
    businessName,
    problem,
    solution,
    targetMarket,
    revenueModel,
    competitors,
    pricing,
    goals,
  } = inputs;

  const executiveSummary =
    `${businessName} exists to solve a clear problem: ${problem} ` +
    `Our approach is ${solution} We are building for ${targetMarket}, and we generate revenue through ${revenueModel} ` +
    `In the near term, our focus is: ${goals}`;

  const businessPlan = [
    `## Overview\n${businessName} addresses "${problem}" by offering "${solution}"`,
    `## Target Market\n${targetMarket}`,
    `## Business Model\nRevenue is generated via ${revenueModel}, priced at ${pricing}.`,
    `## Competitive Landscape\nKey competitors or alternatives: ${competitors}. ${businessName} differentiates by focusing tightly on the target market above and iterating quickly based on direct user feedback.`,
    `## Goals\n${goals}`,
  ].join("\n\n");

  const swot = {
    strengths: [
      `Clear, specific problem statement: ${problem}`,
      `Focused target market: ${targetMarket}`,
      `Defined pricing and revenue model: ${revenueModel}`,
    ],
    weaknesses: [
      "Early-stage — limited brand recognition and customer proof points",
      "Team and resource constraints typical of a new venture",
    ],
    opportunities: [
      `Underserved needs within ${targetMarket}`,
      "Potential to expand into adjacent customer segments over time",
    ],
    threats: [
      `Competitive pressure from ${competitors}`,
      "Market or pricing shifts that affect willingness to pay",
    ],
  };

  const canvas: Record<string, string> = {
    "Key Partners": "To be defined — identify suppliers, distributors, and strategic allies.",
    "Key Activities": solution,
    "Key Resources": "Founding team, product, and any proprietary technology or data.",
    "Value Proposition": solution,
    "Customer Relationships": "Direct engagement, community building, and support.",
    "Channels": "To be defined — direct sales, self-serve signup, partnerships, or content.",
    "Customer Segments": targetMarket,
    "Cost Structure": "Product development, hosting/infrastructure, customer acquisition.",
    "Revenue Streams": `${revenueModel} at ${pricing}`,
  };

  const baseRevenue = 10000;
  const financialProjection = [1, 2, 3].map((year) => {
    const revenue = Math.round(baseRevenue * Math.pow(3, year - 1));
    const costs = Math.round(revenue * (year === 1 ? 0.9 : year === 2 ? 0.75 : 0.6));
    const profit = revenue - costs;
    return {
      year: `Year ${year}`,
      revenue: `$${revenue.toLocaleString()}`,
      costs: `$${costs.toLocaleString()}`,
      profit: `$${profit.toLocaleString()}`,
    };
  });

  const marketingSummary =
    `Early traction for ${businessName} will come from directly reaching ${targetMarket} where they already spend time, ` +
    `leading with the core value proposition: ${solution}. Pricing communication should stay anchored to ${pricing} ` +
    `so it is clear from the first touchpoint.`;

  const legalChecklist = [
    "Register a business entity (LLC, C-Corp, etc.) in your jurisdiction",
    "Reserve your business name and domain",
    "Draft Terms of Service and a Privacy Policy",
    "Set up a business bank account, separate from personal finances",
    "Understand tax obligations for your entity type and location",
    "Put founder agreements / equity splits in writing",
    "Review data protection requirements relevant to your target market",
  ];

  const startupChecklist = [
    `Validate the problem with 10+ conversations in ${targetMarket}`,
    "Build a minimum viable version of the solution",
    "Get 5 users/customers to try it and gather direct feedback",
    "Set up basic analytics to track engagement",
    `Finalize pricing around ${pricing} based on early feedback`,
    "Launch publicly and gather the first wave of testimonials",
    "Set a 90-day milestone tied to your stated goals",
  ];

  return {
    executiveSummary,
    businessPlan,
    swot,
    canvas,
    financialProjection,
    marketingSummary,
    legalChecklist,
    startupChecklist,
  };
}
