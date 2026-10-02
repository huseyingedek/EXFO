import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

// Every collection is split per language:
//   src/content/<collection>/nl/...   (Dutch — default, served at "/")
//   src/content/<collection>/en/...   (English — served at "/en")
// Entry ids therefore look like "nl/-index", "en/forex-basics", "nl/faq".

const commonFields = {
  title: z.string(),
  description: z.string().optional(),
  meta_title: z.string().optional(),
  date: z.coerce.date().optional(),
  image: z.string().optional(),
  draft: z.boolean().optional(),
};

const button = z.object({
  enable: z.boolean(),
  label: z.string(),
  link: z.string(),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "*/[!-]*.{md,mdx}", base: "src/content/blog" }),
  schema: z.object({
    ...commonFields,
    author: z.string().default("EFXO"),
    author_image: z.string().optional(),
    categories: z.array(z.string()).default(() => ["others"]),
    tags: z.array(z.string()).default(() => ["others"]),
    tag: z.string().optional(),
    read_time: z.string().optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/pages" }),
  schema: z.object({
    ...commonFields,
    /** Key from src/i18n/config.ts → routes (links the NL and EN version). */
    route_key: z.string(),
    updated: z.string().optional(),
  }),
});

const aboutCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/about" }),
  schema: z.object({
    ...commonFields,
    page_header: z.object({
      title: z.string(),
      subtitle: z.string(),
      image: z.string(),
      image_alt: z.string().optional(),
    }),
    stats: z.object({
      enable: z.boolean(),
      items: z.array(z.object({ value: z.string(), label: z.string() })),
    }),
    our_team: z.object({
      enable: z.boolean(),
      badge: z.string().optional(),
      title: z.string(),
      members: z.array(
        z.object({ image: z.string(), name: z.string(), role: z.string() }),
      ),
    }),
    core_values: z.object({
      enable: z.boolean(),
      badge: z.string().optional(),
      title: z.string(),
      subtitle: z.string(),
      items: z.array(
        z.object({
          logo: z.string(),
          title: z.string(),
          content: z.string().optional(),
          is_starred: z.boolean(),
        }),
      ),
    }),
  }),
});

const contactCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/contact" }),
  schema: z.object({
    ...commonFields,
    page_header: z
      .object({ title: z.string(), subtitle: z.string() })
      .optional(),
    form_title: z.string().optional(),
    contact_info: z
      .object({
        enable: z.boolean(),
        items: z.array(
          z.object({
            type: z.string(),
            title: z.string(),
            detail: z.string(),
            link: z.string().optional(),
            icon: z.string().optional(),
          }),
        ),
      })
      .optional(),
  }),
});

const homepageCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/homepage" }),
  schema: z.object({
    meta_title: z.string().optional(),
    description: z.string().optional(),
    banner: z.object({
      title: z.string(),
      content: z.string(),
      image_alt: z.string().optional(),
      button_primary: button,
      button_secondary: button,
    }),
    main_features: z.object({
      enable: z.boolean(),
      title: z.string(),
      content: z.string(),
      items: z.array(z.string()),
    }),
    value_props: z.object({
      enable: z.boolean(),
      title: z.string(),
      content: z.string(),
      items: z.array(
        z.object({
          logo: z.string(),
          title: z.string(),
          list: z.array(z.string()).optional(),
        }),
      ),
    }),
    our_features: z.object({
      enable: z.boolean(),
      title: z.string(),
      content: z.string(),
      items: z.array(
        z.object({
          logo: z.string(),
          title: z.string(),
          content: z.string().optional(),
          is_starred: z.boolean(),
        }),
      ),
    }),
    principle: z.object({
      enable: z.boolean(),
      title: z.string(),
      quote: z.string(),
    }),
    stats_statement: z.object({
      enable: z.boolean(),
      stats: z.array(z.object({ value: z.string(), label: z.string() })),
      statement: z.object({
        quote: z.string(),
        avatar: z.string(),
        author: z.string(),
        role: z.string(),
      }),
    }),
    growth_process: z.object({
      enable: z.boolean(),
      title: z.string(),
      items: z.array(
        z.object({
          logo: z.string(),
          title: z.string(),
          content: z.string(),
        }),
      ),
      button: button,
    }),
    lead_generation: z.object({
      enable: z.boolean(),
      title: z.string(),
      subtitle: z.string(),
      content: z.string(),
      list: z.array(z.string()),
      image: z.string(),
      image_alt: z.string().optional(),
    }),
    pricing: z.object({
      enable: z.boolean(),
      title: z.string(),
      content: z.string(),
    }),
  }),
});

const featuresCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/features" }),
  schema: z.object({
    ...commonFields,
    banner: z.object({
      title: z.string(),
      content: z.string(),
      button_primary: button,
      button_secondary: button,
      image: z.string(),
      image_alt: z.string().optional(),
    }),
    smart_platform: z.object({
      enable: z.boolean(),
      title: z.string(),
      cards: z.array(
        z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          image: z.string().optional(),
          classNames: z.string().optional(),
        }),
      ),
    }),
    curriculum: z.object({
      enable: z.boolean(),
      badge: z.string().optional(),
      title: z.string(),
      content: z.string().optional(),
      modules: z.array(
        z.object({
          number: z.string(),
          title: z.string(),
          level: z.string(),
          lessons: z.array(z.string()),
        }),
      ),
    }),
    service_features: z.object({
      enable: z.boolean(),
      items: z.array(
        z.object({
          title: z.string(),
          image: z.string(),
          items: z.array(
            z.object({
              icon: z.string(),
              title: z.string(),
              content: z.string(),
            }),
          ),
          reverse: z.boolean(),
        }),
      ),
    }),
  }),
});

const pricingCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/pricing" }),
  schema: z.object({
    ...commonFields,
    page_header: z.object({
      badge: z.string().optional(),
      title: z.string(),
      content: z.string(),
    }),
    plans: z.array(
      z.object({
        /** Must match an id in src/config/plans.json (prices live there). */
        id: z.string(),
        title: z.string(),
        is_featured: z.boolean(),
        button_label: z.string(),
        description: z.string(),
        features: z.array(
          z.object({
            label: z.string(),
            included: z.boolean(),
            tooltip: z.string().optional(),
          }),
        ),
      }),
    ),
    comparison: z.object({
      enable: z.boolean(),
      badge: z.string().optional(),
      title: z.string(),
      headers: z.array(z.object({ label: z.string() })),
      /** Use the value "{price}" in a row to show each plan's monthly price. */
      rows: z.array(
        z.object({
          feature: z.string(),
          values: z.array(z.union([z.string(), z.boolean()])),
        }),
      ),
    }),
  }),
});

const blogIndexCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/blog" }),
  schema: z.object({
    ...commonFields,
    page_header: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        featured_post: z.string().optional(),
      })
      .optional(),
    featured_post: z.object({ enable: z.boolean() }).optional(),
    latest_posts: z
      .object({ enable: z.boolean(), title: z.string() })
      .optional(),
  }),
});

const thanksCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/thanks" }),
  schema: z.object({
    ...commonFields,
    page_header: z.object({ title: z.string(), subtitle: z.string() }),
    steps: z.array(z.object({ title: z.string(), content: z.string() })),
    button: button,
  }),
});

const ctaSectionCollection = defineCollection({
  loader: glob({ pattern: "*/call-to-action.{md,mdx}", base: "src/content/sections" }),
  schema: z.object({
    enable: z.boolean(),
    badge: z.string().optional(),
    title: z.string(),
    description: z.string(),
    button: button,
  }),
});

const faqSectionCollection = defineCollection({
  loader: glob({ pattern: "*/faq.{md,mdx}", base: "src/content/sections" }),
  schema: z.object({
    enable: z.boolean(),
    badge: z.string().optional(),
    title: z.string(),
    description: z.string(),
    button: button,
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
});

const ourStorySectionCollection = defineCollection({
  loader: glob({ pattern: "*/our-story.{md,mdx}", base: "src/content/sections" }),
  schema: z.object({
    enable: z.boolean(),
    badge: z.string().optional(),
    title: z.string(),
    ceo: z.object({ image: z.string(), name: z.string(), role: z.string() }),
    letter: z.string(),
    letter_points_title: z.string().optional(),
    letter_points: z.array(z.string()),
    closing_content: z.string().optional(),
    button: button,
  }),
});

const businessNeedsSectionCollection = defineCollection({
  loader: glob({
    pattern: "*/business-needs.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    badge: z.string().optional(),
    title: z.string(),
    items: z.array(
      z.object({
        image: z.string(),
        number: z.string(),
        title: z.string(),
        content: z.string(),
      }),
    ),
  }),
});

export const collections = {
  blog: blogCollection,
  blogIndex: blogIndexCollection,
  pages: pagesCollection,
  about: aboutCollection,
  contact: contactCollection,
  homepage: homepageCollection,
  features: featuresCollection,
  pricing: pricingCollection,
  thanks: thanksCollection,
  ctaSection: ctaSectionCollection,
  faqSection: faqSectionCollection,
  ourStorySection: ourStorySectionCollection,
  businessNeedsSection: businessNeedsSectionCollection,
};
