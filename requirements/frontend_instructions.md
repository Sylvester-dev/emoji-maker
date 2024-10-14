# Project Overview
Use this guide to build the webapp where users can give a text prompt to generate emoji using model hosted on Replicate.

# FEATURE requirements
- We will use Next.js, Shadcn, Lucid, Supabase, Clerk
- Create a landing page with a form for users to submit text prompts and clicking a button to call the replicate model to generate emojis.
- Have a nice UI & animations when the images are being generated.
- Display all the images generated in a grid.
- When hovering over an image, an icon button for download, and an icon button for like should be shown up.

# relevant docs
## How to use Replicate's emoji generator model

import Replicate from "replicate";
const replicate = new Replicate();

const input = {
  "width": 1024,
  "height": 1024,
  "prompt": "A TOK emoji of a man",
  "refine": "no_refiner",
  "scheduler": "K_EULER",
  "lora_scale": 0.6,
  "num_outputs": 1,
  "guidance_scale": 7.5,
  "apply_watermark": false,
  "high_noise_frac": 0.8,
  "negative_prompt": "",
  "prompt_strength": 0.8,
  "num_inference_steps": 50
};

const output = await replicate.run("fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e", { input });
console.log(output)


# current file structure
EMOJI_MAKER
├── .next
├── app
│   ├── fonts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   └── ui
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib
├── node_modules
├── requirements
├── .eslintrc.json
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json

# rules
- All new components should go in /components and be named like example-component.tsx unless otherwise specified.
- All new pages go in /app.