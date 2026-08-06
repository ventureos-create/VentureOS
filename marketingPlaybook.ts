import { MarketingPlanInputs } from "@/types";

/**
 * Generates a 30-day marketing playbook from the founder's answers.
 * Same pattern as generators/businessPlan.ts — deterministic and offline
 * by default; swap in a real LLM call here for genuinely generative copy.
 */
export function generateMarketingPlaybook(inputs: MarketingPlanInputs) {
  const { businessName, product, audience, budget, goals } = inputs;

  const themes = [
    "Founder story", "Problem education", "Behind the scenes", "Customer proof",
    "Product tip", "Industry insight", "User-generated content",
  ];
  const platforms = ["Instagram", "TikTok", "LinkedIn", "Email"];

  const contentCalendar = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const theme = themes[i % themes.length];
    const platform = platforms[i % platforms.length];
    return {
      day,
      theme,
      platform,
      idea: `${theme} post about ${product} for ${audience} on ${platform}`,
    };
  });

  const instagramStrategy =
    `Post 3-4x per week mixing product demos of ${product}, founder-voice stories, and quick tips relevant to ${audience}. ` +
    `Use Reels for anything visual and Stories for daily behind-the-scenes moments.`;

  const tiktokStrategy =
    `Lead with a hook in the first 2 seconds tied to the core problem ${businessName} solves. ` +
    `Favor native, unpolished video over ads — show ${product} in real use by ${audience}.`;

  const linkedinStrategy =
    `Publish 2x per week: one founder-perspective post on building ${businessName}, and one educational post relevant to ${audience}. ` +
    `Engage directly in comments on posts from people in your target market.`;

  const emailCampaign = [
    `Welcome email — introduce ${businessName} and what ${product} does`,
    `Problem/solution email — the pain point ${audience} faces and how you solve it`,
    `Social proof email — early testimonials or usage stats`,
    `Offer email — pricing and a clear call to action, mindful of a ${budget} budget`,
    `Follow-up email — answer common objections and reinforce value`,
  ];

  const launchPlan = [
    "T-14 days: tease the problem you're solving, build an early access waitlist",
    "T-7 days: share behind-the-scenes build-up content across channels",
    "T-1 day: final reminder to the waitlist with launch time",
    "Launch day: publish across all channels simultaneously, personally message your network",
    "T+3 days: share first metrics/testimonials to keep momentum",
    "T+14 days: retrospective post — what you learned launching to " + audience,
  ];

  const salesFunnel = [
    { stage: "Awareness", action: `Content on Instagram, TikTok, and LinkedIn introducing ${product}` },
    { stage: "Interest", action: `Landing page explaining the value for ${audience}` },
    { stage: "Consideration", action: "Email nurture sequence with proof and objection handling" },
    { stage: "Conversion", action: `Clear pricing and a low-friction signup, sized to a ${budget} budget` },
    { stage: "Retention", action: "Onboarding email + regular product updates to reduce churn" },
  ];

  const seoPlan = [
    `Target keywords around the core problem ${businessName} solves for ${audience}`,
    "Publish 1 in-depth article per week answering a real question your audience searches for",
    "Optimize the homepage title/meta description around your primary keyword",
    "Build backlinks by contributing guest content to communities where " + audience + " spend time",
    "Track rankings monthly and double down on what's driving traffic",
  ];

  return {
    contentCalendar,
    instagramStrategy,
    tiktokStrategy,
    linkedinStrategy,
    emailCampaign,
    launchPlan,
    salesFunnel,
    seoPlan,
  };
}
