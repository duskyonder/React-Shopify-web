/**
 * DUSKYONDER Blog Mock Data
 *
 * Data structure mirrors Shopify Storefront API `articles` GraphQL nodes.
 * When switching to live Shopify data, replace this file's exports with
 * Storefront API responses — component code stays unchanged.
 *
 * Shopify Storefront API query reference: shared/shopifyQueries.ts
 */

export interface BlogArticleImage {
  url: string;
  altText: string;
}

export interface BlogArticleAuthor {
  name: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  handle: string;           // URL slug: /pages/blog/:handle
  excerpt: string;
  content: string;          // Rich text HTML
  image: BlogArticleImage | null;
  publishedAt: string;      // ISO 8601
  tags: string[];           // Used as categories
  author: BlogArticleAuthor;
  readingTimeMinutes: number; // Computed, not in Shopify — calculated from content length
}

export interface BlogMeta {
  title: string;
  handle: string;
}

// ---------------------------------------------------------------------------
// Mock Articles — 8 articles covering different topics
// ---------------------------------------------------------------------------

export const mockBlogMeta: BlogMeta = {
  title: "DUSKYONDER Journal",
  handle: "journal",
};

export const mockArticles: BlogArticle[] = [
  {
    id: "article-001",
    title: "Beyond the Horizon: Why We Move",
    handle: "beyond-the-horizon-why-we-move",
    excerpt:
      "Movement is not just exercise — it's a language the body speaks when words fall short. Discover the philosophy behind DUSKYONDER and why we believe every woman deserves activewear that moves with her.",
    content: `
      <h2>The Body Knows</h2>
      <p>Before we designed a single stitch, we asked one question: what does it feel like to move freely? Not just physically — but mentally, emotionally, in the quiet moments between sets when you catch your breath and feel, briefly, like yourself.</p>
      <p>That question became the foundation of DUSKYONDER. We are not a sportswear brand chasing performance metrics. We are a movement brand built around the belief that how you feel in your clothes changes how you show up in the world.</p>
      <h2>Dusk as a Metaphor</h2>
      <p>We chose dusk deliberately. It's the hour between — between day and night, effort and rest, who you were this morning and who you'll be tomorrow. It's the moment most people skip, rushing from one thing to the next. We think it deserves more attention.</p>
      <p>DUSKYONDER is an invitation to pause at that threshold. To notice the light. To move with intention before the day closes.</p>
      <h2>What "Yonder" Means to Us</h2>
      <p>Yonder is a direction without a fixed destination. It's the horizon you move toward knowing you'll never quite reach it — and finding that the movement itself is the point. Every collection we design is a step yonder: further into comfort, further into craft, further into the version of yourself you're becoming.</p>
      <blockquote><p>"Wear it like you mean it. Move like you mean it. Live like you mean it."</p></blockquote>
      <p>That's the only brief we give ourselves when we sit down to design.</p>
    `,
    image: {
      url: "",
      altText: "Woman stretching at golden hour on a rooftop",
    },
    publishedAt: "2026-06-01T08:00:00Z",
    tags: ["Behind the Brand"],
    author: { name: "DUSKYONDER Team" },
    readingTimeMinutes: 4,
  },
  {
    id: "article-002",
    title: "The Science of Fabric: What Makes Activewear Actually Work",
    handle: "science-of-fabric-activewear",
    excerpt:
      "Not all stretchy fabric is created equal. We break down the three fabric technologies behind our collections — EcoMove, AirLight, and SculptFlex — and explain what each one does for your body.",
    content: `
      <h2>Why Fabric Matters More Than You Think</h2>
      <p>Most activewear marketing focuses on design. We think that's backwards. The fabric is the product — the design is just how it looks on the rack. Here's what we actually obsess over.</p>
      <h2>EcoMove™ — Recycled Performance</h2>
      <p>EcoMove is our entry point: a 78% recycled polyester, 22% spandex blend that delivers four-way stretch without the environmental cost of virgin synthetics. Each pair of EcoMove leggings uses approximately 8 recycled plastic bottles.</p>
      <p>Performance specs: 4-way stretch, moisture-wicking, UPF 50+, machine washable. Best for: yoga, pilates, low-to-medium intensity training.</p>
      <h2>AirLight™ — Breathe-Through Technology</h2>
      <p>AirLight uses a micro-mesh weave structure that creates thousands of tiny ventilation channels across the fabric surface. The result is a garment that feels almost weightless during high-intensity movement.</p>
      <p>Performance specs: 360° stretch, ultra-lightweight (130gsm), rapid moisture evaporation, anti-odor treatment. Best for: running, HIIT, hot yoga, cycling.</p>
      <h2>SculptFlex™ — Compression with Comfort</h2>
      <p>SculptFlex is our premium compression fabric: a dense, high-recovery knit that provides graduated compression from ankle to waist. It smooths, supports, and holds its shape through hundreds of washes.</p>
      <p>Performance specs: graduated compression, squat-proof, high-waist hold, 500-wash durability tested. Best for: strength training, everyday wear, postpartum recovery.</p>
      <blockquote><p>The best fabric is the one you forget you're wearing.</p></blockquote>
    `,
    image: {
      url: "",
      altText: "Close-up of activewear fabric texture",
    },
    publishedAt: "2026-06-03T08:00:00Z",
    tags: ["Style"],
    author: { name: "DUSKYONDER Design Team" },
    readingTimeMinutes: 5,
  },
  {
    id: "article-003",
    title: "5 Morning Mobility Moves for People Who Hate Morning Workouts",
    handle: "morning-mobility-moves",
    excerpt:
      "You don't have to love mornings to move in them. These five mobility exercises take under 10 minutes, require no equipment, and will change how the rest of your day feels.",
    content: `
      <h2>The Anti-Workout Morning Routine</h2>
      <p>Let's be honest: most morning workout content is written by morning people for morning people. This is not that. This is for the person who hits snooze twice, makes coffee before doing anything else, and needs movement to feel like a choice, not a chore.</p>
      <p>These five moves are not a workout. They are a conversation with your body — a gentle check-in before the day begins.</p>
      <h2>1. Cat-Cow Breathing (90 seconds)</h2>
      <p>Start on all fours. Inhale as you drop your belly and lift your gaze (cow). Exhale as you round your spine toward the ceiling (cat). Move with your breath, not against it. This wakes up the spine and resets your nervous system.</p>
      <h2>2. Hip 90/90 Stretch (60 seconds each side)</h2>
      <p>Sit on the floor with both knees bent at 90 degrees — one in front, one to the side. Sit tall, breathe into the front hip. Switch sides. Most of us carry tension here from sitting; this releases it before it compounds.</p>
      <h2>3. World's Greatest Stretch (45 seconds each side)</h2>
      <p>Step into a deep lunge. Place the same-side hand on the floor. Rotate your top arm toward the ceiling, following with your gaze. Return. This single move addresses hip flexors, thoracic spine, and shoulder mobility simultaneously.</p>
      <h2>4. Standing Figure-4 Balance (30 seconds each side)</h2>
      <p>Stand on one leg. Cross the opposite ankle over the standing knee. Sit back slightly as if into a chair. Hold. This builds single-leg stability and opens the outer hip — two things most people desperately need.</p>
      <h2>5. Neck Rolls with Shoulder Drops (60 seconds)</h2>
      <p>Slowly roll your head in a half-circle from shoulder to shoulder. Pause where it's tight. Drop both shoulders away from your ears. Breathe. This is where most people carry their stress — address it before it becomes a headache.</p>
      <blockquote><p>Ten minutes. No gym. No excuses. Just you and the floor.</p></blockquote>
    `,
    image: {
      url: "",
      altText: "Woman doing morning yoga stretch on a mat",
    },
    publishedAt: "2026-06-05T08:00:00Z",
    tags: ["Movement"],
    author: { name: "DUSKYONDER Wellness Team" },
    readingTimeMinutes: 6,
  },
  {
    id: "article-004",
    title: "How to Build a Capsule Activewear Wardrobe",
    handle: "capsule-activewear-wardrobe",
    excerpt:
      "More isn't better — better is better. Learn how to build a 10-piece activewear capsule that covers every workout, every mood, and every season without filling a second drawer.",
    content: `
      <h2>The Problem with Activewear Drawers</h2>
      <p>Most people own more activewear than they wear. The drawer is full; the rotation is five pieces. Sound familiar? The capsule approach fixes this by starting with intention rather than accumulation.</p>
      <h2>The 10-Piece Formula</h2>
      <p>A functional activewear capsule needs: 3 bottoms, 3 tops, 2 sports bras, 1 jacket, 1 versatile set. Here's how to choose each.</p>
      <h2>Bottoms (3 pieces)</h2>
      <p><strong>Piece 1: High-waist full-length legging.</strong> Your workhorse. Choose a compression fabric for strength training, a lighter fabric for yoga. Neutral color — black, navy, or deep olive — so it pairs with everything.</p>
      <p><strong>Piece 2: 7/8 length legging in a second neutral or a subtle pattern.</strong> The 7/8 length works for both studio and street, making it your most versatile piece.</p>
      <p><strong>Piece 3: Shorts or a skirt.</strong> For high-intensity training, hot yoga, or summer runs. Choose based on your primary warm-weather activity.</p>
      <h2>Tops (3 pieces)</h2>
      <p>One fitted tank, one loose-fit tee, one long-sleeve layer. The long sleeve doubles as a light jacket for outdoor workouts in transitional weather.</p>
      <h2>Sports Bras (2 pieces)</h2>
      <p>One high-impact (for running, HIIT), one medium-impact (for yoga, pilates, strength). Don't compromise here — the right support changes everything.</p>
      <h2>The Jacket</h2>
      <p>A lightweight, packable jacket that works over any of your pieces. Zip-front, thumb holes, and a hood are the three features worth paying for.</p>
      <blockquote><p>Buy less. Choose well. Make it last.</p></blockquote>
    `,
    image: {
      url: "",
      altText: "Flat lay of activewear capsule wardrobe pieces",
    },
    publishedAt: "2026-06-07T08:00:00Z",
    tags: ["Style"],
    author: { name: "DUSKYONDER Style Team" },
    readingTimeMinutes: 5,
  },
  {
    id: "article-005",
    title: "Rest Is Not the Opposite of Progress",
    handle: "rest-is-not-the-opposite-of-progress",
    excerpt:
      "The fitness industry has a rest problem. We glorify exhaustion, celebrate overtraining, and treat recovery days as weakness. Here's why that's wrong — and what the science actually says.",
    content: `
      <h2>The Glorification of Exhaustion</h2>
      <p>Somewhere along the way, "I'm exhausted" became a status symbol. The busier you are, the more you're doing. The more you're doing, the more you're worth. This logic has infected fitness culture in a particularly damaging way.</p>
      <p>We see it in the language: "beast mode," "no days off," "sleep when you're dead." We see it in the metrics: step counts, calorie burns, PR chasing. We see it in the shame spiral that follows a rest day.</p>
      <h2>What Actually Happens During Recovery</h2>
      <p>Here's the biology: muscle growth doesn't happen during training. It happens during recovery. When you lift weights, you create micro-tears in muscle fibers. During rest, your body repairs those tears and builds them back stronger. Skip the rest, skip the adaptation.</p>
      <p>The same applies to cardiovascular fitness, flexibility, and neurological coordination. Every physical adaptation your training is trying to create requires recovery time to manifest.</p>
      <h2>Signs You Need More Rest</h2>
      <p>Persistent soreness that doesn't resolve. Declining performance despite consistent training. Elevated resting heart rate. Poor sleep quality. Increased irritability. Loss of motivation. These are not signs of weakness — they are data.</p>
      <h2>What Good Recovery Looks Like</h2>
      <p>Active recovery (light walking, gentle yoga, swimming) on non-training days. 7-9 hours of sleep. Adequate protein intake (1.6-2.2g per kg of bodyweight for active individuals). Stress management — psychological stress and physical stress use the same recovery resources.</p>
      <blockquote><p>Progress is built in the rest. Honor it.</p></blockquote>
    `,
    image: {
      url: "",
      altText: "Woman resting peacefully after a workout",
    },
    publishedAt: "2026-06-08T08:00:00Z",
    tags: ["Wellness"],
    author: { name: "DUSKYONDER Wellness Team" },
    readingTimeMinutes: 5,
  },
  {
    id: "article-006",
    title: "The DUSKYONDER Community: Stories from Our Customers",
    handle: "community-stories",
    excerpt:
      "We asked our community one question: what does movement mean to you? The answers surprised us, moved us, and reminded us exactly why we do what we do.",
    content: `
      <h2>We Asked. You Answered.</h2>
      <p>Last month, we sent a single question to our community: "What does movement mean to you?" We expected fitness answers. We got life answers.</p>
      <h2>Sarah, 34 — Melbourne</h2>
      <p>"Movement is the one hour a day that belongs entirely to me. I have two kids, a full-time job, and a house that's always slightly messy. But when I'm on my mat, I'm not anyone's mother or employee or partner. I'm just a body moving through space. That's everything."</p>
      <h2>Mei, 28 — Singapore</h2>
      <p>"I started running after my breakup. Not to lose weight — I just needed somewhere to put all the feelings. Three years later, I've run two half-marathons and made my closest friends through a running club. Movement gave me my people."</p>
      <h2>Priya, 41 — London</h2>
      <p>"I was diagnosed with anxiety at 38. My therapist suggested exercise. I rolled my eyes. Then I tried yoga. I've been going three times a week for two years. I still have anxiety, but I have a relationship with my body now that I never had before. That changes everything."</p>
      <h2>Camille, 26 — Paris</h2>
      <p>"Movement is protest, for me. I grew up being told my body was too much — too loud, too big, too present. Pilates taught me that my body is capable, not just decorative. Every class is a small act of reclaiming myself."</p>
      <blockquote><p>Movement is not about what your body looks like. It's about what your body can do — and how it makes you feel to do it.</p></blockquote>
    `,
    image: {
      url: "",
      altText: "Group of women doing outdoor yoga together",
    },
    publishedAt: "2026-06-10T08:00:00Z",
    tags: ["Community"],
    author: { name: "DUSKYONDER Team" },
    readingTimeMinutes: 4,
  },
  {
    id: "article-007",
    title: "Pilates vs. Yoga: Which Practice Is Right for You?",
    handle: "pilates-vs-yoga",
    excerpt:
      "Both are low-impact, mat-based, and beloved by the activewear community. But pilates and yoga are fundamentally different practices. Here's an honest comparison to help you choose.",
    content: `
      <h2>The Short Answer</h2>
      <p>Do both. But if you have to choose one, here's how to decide.</p>
      <h2>What Yoga Actually Is</h2>
      <p>Yoga is a 5,000-year-old practice with roots in Indian philosophy. The physical postures (asanas) are one of eight limbs of the practice — the others include breath work, meditation, and ethical principles. Modern Western yoga has largely separated the physical from the philosophical, but the breath-movement connection remains central.</p>
      <p>Yoga builds flexibility, balance, body awareness, and — in more vigorous styles like Ashtanga or Vinyasa — cardiovascular fitness and strength. It also has a well-documented effect on the nervous system, reducing cortisol and activating the parasympathetic response.</p>
      <h2>What Pilates Actually Is</h2>
      <p>Pilates was developed by Joseph Pilates in the early 20th century as a rehabilitation system. It focuses on core strength, spinal alignment, and controlled movement. Unlike yoga, it has no philosophical or spiritual dimension — it is purely physical.</p>
      <p>Pilates builds deep core strength, improves posture, and creates the kind of functional stability that prevents injury. It's particularly effective for people recovering from back pain, postpartum, or joint issues.</p>
      <h2>Choose Yoga If:</h2>
      <p>You want flexibility, stress reduction, and a mind-body practice. You're drawn to the meditative aspects of movement. You want variety — there are dozens of yoga styles for every mood and fitness level.</p>
      <h2>Choose Pilates If:</h2>
      <p>You want to build core strength and improve posture. You're recovering from injury or managing chronic pain. You prefer a more structured, anatomically precise approach to movement.</p>
      <blockquote><p>The best practice is the one you'll actually do consistently.</p></blockquote>
    `,
    image: {
      url: "",
      altText: "Side-by-side comparison of yoga and pilates poses",
    },
    publishedAt: "2026-06-12T08:00:00Z",
    tags: ["Movement"],
    author: { name: "DUSKYONDER Wellness Team" },
    readingTimeMinutes: 6,
  },
  {
    id: "article-008",
    title: "Designing for Movement: Inside the DUSKYONDER Studio",
    handle: "designing-for-movement-studio",
    excerpt:
      "What does it take to design activewear that actually performs? We take you inside our design process — from first sketch to final fit test — and introduce the team behind the collections.",
    content: `
      <h2>It Starts with a Body, Not a Sketch</h2>
      <p>Most fashion design starts at a drawing board. Ours starts in a studio, with a movement session. Before we design anything, we move in it — or in something close to it. We do the yoga class, the HIIT session, the long run. We notice where things pull, where they bunch, where they fail.</p>
      <p>Only then do we sketch.</p>
      <h2>The Fit Test Process</h2>
      <p>Every DUSKYONDER piece goes through a minimum of six fit iterations before it reaches production. Each iteration is tested across a range of body types — we work with fit models from size XS to XL — and across a range of movements: squats, lunges, inversions, jumps, stretches.</p>
      <p>If a legging is see-through in a forward fold, it fails. If a sports bra shifts during a burpee, it fails. If a waistband rolls during a run, it fails. We'd rather delay a launch than ship something that doesn't work.</p>
      <h2>The Team</h2>
      <p>Our design team is small by industry standards: four people, all of whom are active themselves. Our lead designer runs ultramarathons. Our technical designer is a certified yoga instructor. Our fabric specialist has a background in textile engineering. Our fit coordinator is a former competitive swimmer.</p>
      <p>We think this matters. You can't design for movement if you don't move.</p>
      <h2>What's Next</h2>
      <p>We're currently developing our first outerwear collection — pieces designed for the transition between workout and the rest of life. Expect the same obsessive attention to fabric and fit, applied to a new set of movement contexts.</p>
      <blockquote><p>We design for the body in motion. Everything else is secondary.</p></blockquote>
    `,
    image: {
      url: "",
      altText: "DUSKYONDER design team working in studio",
    },
    publishedAt: "2026-06-14T08:00:00Z",
    tags: ["Behind the Brand"],
    author: { name: "DUSKYONDER Design Team" },
    readingTimeMinutes: 5,
  },
];

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/** Get all unique tags from articles (for category filter) */
export function getAllTags(articles: BlogArticle[]): string[] {
  const tags = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

/** Filter articles by tag */
export function filterByTag(articles: BlogArticle[], tag: string): BlogArticle[] {
  if (tag === "All") return articles;
  return articles.filter((a) => a.tags.includes(tag));
}

/** Get article by handle */
export function getArticleByHandle(
  articles: BlogArticle[],
  handle: string
): BlogArticle | undefined {
  return articles.find((a) => a.handle === handle);
}

/** Estimate reading time from HTML content */
export function estimateReadingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
