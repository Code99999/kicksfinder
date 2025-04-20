// pages/api/search-sneakers.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { post_ReadPages } from 'r_1lm_io__jit_plugin';

interface Sneaker {
  name: string;
  brand: string;
  image: string;
  performance: string;
  support: string;
  style: string;
  link: string;
}

const sourceMap: Record<string, string> = {
  Nike: 'https://www.nike.com/w?q=basketball+shoes&vst=basketball',
  Adidas: 'https://www.adidas.com/us/men-basketball-shoes',
  "Way of Wade": 'https://wayofwade.com/collections/shoes',
  WearTesters: 'https://weartesters.com/category/performance-reviews/basketball-shoes-reviews/'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const result = await post_ReadPages({
      urls: Object.values(sourceMap)
    });

    const sneakers: Sneaker[] = [];
    for (const [brand, content] of Object.entries(result.pages)) {
      const text = content.text.toLowerCase();
      if (!text.includes('shoe')) continue;

      const matches = text.match(/(nike|adidas|wade)[^.!?\\n]{20,200}/gi) || [];

      matches.forEach((snippet) => {
        sneakers.push({
          name: snippet.match(/(nike|adidas|wade)[^\\n:]+/)?.[0] || 'Sneaker',
          brand,
          image: `https://via.placeholder.com/400x300.png?text=${brand.replace(/ /g, '+')}`,
          performance: snippet.includes('traction') ? 'Good traction' : 'Standard',
          support: snippet.includes('support') ? 'Great support' : 'Moderate',
          style: snippet.includes('look') ? 'Stylish' : 'Basic',
          link: sourceMap[brand] || '#'
        });
      });
    }

    res.status(200).json({ sneakers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sneaker data' });
  }
}
