const Groq = require('groq-sdk');
const axios = require('axios');
const { client, handle_file } = require('@gradio/client');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Ordered list of fallback models — we try each one until one works.
const GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
];

/**
 * Tries each model in GROQ_MODELS until one returns a valid response.
 * Handles model deprecations AND rate limits gracefully.
 */
const callGroqWithFallback = async (messages) => {
  let lastError;
  for (const model of GROQ_MODELS) {
    try {
      console.log(`Trying Groq model: ${model}`);
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 500, // Only need a small JSON response — stays within free tier OTPM limits
      });
      console.log(`Success with model: ${model}`);
      return completion;
    } catch (err) {
      const code = err?.error?.error?.code || err?.code || '';
      const isModelIssue = code === 'model_not_found' || code === 'model_decommissioned' || err?.status === 404;
      const isRateLimit = code === 'rate_limit_exceeded' || err?.status === 429;
      if (isModelIssue || isRateLimit) {
        console.warn(`Model ${model} unavailable/rate-limited (${code}), trying next...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error('All Groq models failed. Check your API key or model availability.');
};

// @desc    Generate outfit styling based on occasion and style
// @route   POST /api/ai/generate
// @access  Public
const generateOutfit = async (req, res) => {
  try {
    const { occasion, style, availableItems, excludeIds = [] } = req.body;

    if (!occasion || !style) {
      return res.status(400).json({ message: 'Please provide occasion and style.' });
    }
    if (!availableItems || availableItems.length === 0) {
      return res.status(400).json({ message: 'No items in wardrobe to style.' });
    }

    // ── RULE-BASED SCORING ENGINE ──────────────────────────────────────────────
    // Instead of asking AI to pick items (unreliable), we score every item against
    // the requested style and pick the best top + best bottom deterministically.

    const TOP_CATS    = ['tops', 'shirts', 'tshirts', 't-shirts', 'top', 'shirt'];
    const BOTTOM_CATS = ['bottoms', 'pants', 'jeans', 'trousers', 'shorts', 'skirts', 'bottom'];
    const OUT_CATS    = ['outerwear', 'jacket', 'coat', 'blazer'];

    // Keywords that score positively/negatively per style
    const STYLE_RULES = {
      Streetwear: {
        topPos:    ['graphic', 'tee', 'tshirt', 't-shirt', 'print', 'logo', 'oversized', 'hoodie', 'sweat'],
        topNeg:    ['shirt', 'formal', 'dress', 'button'],
        bottomPos: ['cargo', 'jogger', 'baggy', 'wide', 'denim', 'jeans', 'shorts'],
        bottomNeg: ['trouser', 'formal', 'dress', 'chino', 'slim'],
        colorPos:  ['black', 'grey', 'navy', 'white', 'brown', 'beige', 'khaki', 'olive'],
      },
      Minimalist: {
        topPos:    ['plain', 'solid', 'basic', 'simple', 'shirt', 'tee'],
        topNeg:    ['graphic', 'print', 'logo', 'pattern', 'floral'],
        bottomPos: ['chino', 'trouser', 'slim', 'straight', 'plain', 'pants'],
        bottomNeg: ['cargo', 'jogger', 'baggy', 'ripped', 'printed'],
        colorPos:  ['black', 'white', 'grey', 'navy', 'beige', 'cream', 'off-white', 'charcoal'],
      },
      Classic: {
        topPos:    ['shirt', 'button', 'oxford', 'polo', 'formal', 'dress', 'blazer'],
        topNeg:    ['graphic', 'tee', 'hoodie', 'sweat', 'oversized'],
        bottomPos: ['trouser', 'chino', 'dress', 'straight', 'formal', 'pants'],
        bottomNeg: ['cargo', 'jogger', 'shorts', 'baggy', 'ripped', 'jeans'],
        colorPos:  ['black', 'navy', 'white', 'grey', 'khaki', 'beige', 'brown'],
      },
    };

    const rules = STYLE_RULES[style] || {
      topPos: [], topNeg: [], bottomPos: [], bottomNeg: [], colorPos: [],
    };

    // Occasion formality modifier
    const FORMAL_OCCASIONS = ['Business Meeting', 'Smart Dinner'];
    const isFormal = FORMAL_OCCASIONS.includes(occasion);

    // Keywords that signal a bottom is FORMALLY appropriate
    const FORMAL_BOTTOM_KW = ['trouser', 'chino', 'pant', 'pants', 'slack', 'dress', 'formal', 'straight', 'slim'];
    // Keywords that signal a top is FORMALLY appropriate
    const FORMAL_TOP_KW    = ['shirt', 'button', 'oxford', 'polo', 'formal', 'dress', 'blazer'];

    const scoreItem = (item, posKw, negKw) => {
      const text = `${item.name} ${item.color} ${item.category}`.toLowerCase();
      const color = (item.color || '').toLowerCase();
      let score = 0;
      posKw.forEach(kw => { if (text.includes(kw)) score += 3; });
      negKw.forEach(kw => { if (text.includes(kw)) score -= 5; });
      rules.colorPos.forEach(c => { if (color.includes(c)) score += 2; });

      if (isFormal) {
        // Penalise graphic/casual tops heavily
        if (text.includes('graphic') || text.includes('tshirt') || text.includes('tee') ||
            text.includes('hoodie') || text.includes('sweat')) score -= 10;
        // Penalise bottoms that have NO formal keyword — catches 'ghfj', 'item 1', etc.
        const isBottom = BOTTOM_CATS.includes((item.category || '').toLowerCase());
        const isTop    = TOP_CATS.includes((item.category || '').toLowerCase());
        if (isBottom && !FORMAL_BOTTOM_KW.some(kw => text.includes(kw))) score -= 8;
        if (isTop    && !FORMAL_TOP_KW.some(kw => text.includes(kw)))    score -= 6;
        // Penalise baggy/casual bottom keywords
        ['cargo', 'baggy', 'wide', 'jogger', 'shorts', 'ripped'].forEach(kw => {
          if (text.includes(kw)) score -= 8;
        });
      }
      return score;
    };

    const allTops    = availableItems.filter(i => TOP_CATS.includes((i.category || '').toLowerCase()));
    const allBottoms = availableItems.filter(i => BOTTOM_CATS.includes((i.category || '').toLowerCase()));

    // Smart exclusion: only exclude previously shown items if it doesn't force a bad pick.
    // For formal occasions especially, never sacrifice appropriateness for novelty.
    const excludeSet = new Set(excludeIds.map(String));

    const smartFilter = (allItems, posKw, negKw) => {
      const withoutExcluded = allItems.filter(i => !excludeSet.has(String(i._id)));
      // Only use the filtered pool if at least one remaining item has a non-negative score
      const hasGoodOption = withoutExcluded.some(i => scoreItem(i, posKw, negKw) >= 0);
      return (withoutExcluded.length > 0 && hasGoodOption) ? withoutExcluded : allItems;
    };

    const tops    = smartFilter(allTops,    rules.topPos,    rules.topNeg);
    const bottoms = smartFilter(allBottoms, rules.bottomPos, rules.bottomNeg);

    if (tops.length === 0 && bottoms.length === 0) {
      return res.status(400).json({ message: 'No tops or bottoms found in wardrobe.' });
    }

    // Pick randomly from top candidates within a score threshold.
    const pickFromCandidates = (items, posKw, negKw) => {
      if (items.length === 0) return null;
      if (items.length === 1) return items[0];
      const scored = items
        .map(item => ({ item, score: scoreItem(item, posKw, negKw) }))
        .sort((a, b) => b.score - a.score);
      const best = scored[0].score;
      // Narrow candidate pool to within 3 points of the best score
      const candidates = scored.filter(s => s.score >= best - 3).map(s => s.item);
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const bestTop    = pickFromCandidates(tops,    rules.topPos,    rules.topNeg);
    const bestBottom = pickFromCandidates(bottoms, rules.bottomPos, rules.bottomNeg);

    const selectedItems = [bestTop, bestBottom].filter(Boolean);
    const selectedIds   = selectedItems.map(i => String(i._id));

    console.log(`Selection for [${style}/${occasion}]:`, selectedItems.map(i => `${i.name}(${scoreItem(i, rules.bottomPos, rules.bottomNeg)})`));



    // ── AI: Generate styling reason ONLY ──────────────────────────────────────
    let stylingReason = '';
    try {
      const itemSummary = selectedItems.map(i => `${i.color} ${i.name} (${i.category})`).join(' + ');
      const reasonMessages = [
        { role: 'system', content: 'You are a fashion copywriter. Write vivid, concise outfit descriptions. Return only the description text, no JSON.' },
        { role: 'user', content: `Write a 2-sentence styling note for this outfit: ${itemSummary}. Occasion: ${occasion}. Style: ${style}. Explain why these specific items and colors work together for this occasion. Be specific, not generic.` }
      ];
      const completion = await callGroqWithFallback(reasonMessages);
      stylingReason = completion.choices[0]?.message?.content?.trim() || '';
      // Strip any stray think blocks
      const thinkEnd = stylingReason.lastIndexOf('</think>');
      if (thinkEnd !== -1) stylingReason = stylingReason.substring(thinkEnd + 8).trim();
    } catch (reasonErr) {
      console.warn('Could not generate styling reason:', reasonErr.message);
      stylingReason = `A ${style.toLowerCase()} outfit perfectly curated for ${occasion}.`;
    }

    return res.json({
      success: true,
      selected_ids: selectedIds,
      styling_reason: stylingReason,
    });

  } catch (error) {
    console.error('Outfit generation error:', error?.message || error);
    return res.status(500).json({ message: 'Failed to generate outfit. Please try again.', error: error.message });
  }
};


// @desc    Full-body try-on via IDM-VTON (upper) and OOTDiffusion (lower)
// @route   POST /api/ai/try-on
// @access  Public
const generateTryOn = async (req, res) => {
  try {
    const { garmentUrl, garmentName } = req.body;
    const humanImageUrl = req.file?.path;

    if (!humanImageUrl) {
      return res.status(400).json({ message: 'Please upload a human image.' });
    }
    if (!garmentUrl) {
      return res.status(400).json({ message: 'Garment image URL is required.' });
    }

    console.log(`Starting try-on: garment="${garmentName}"`);

    // Use HF token if configured (provides significantly more GPU quota)
    const hfOptions = process.env.HF_TOKEN ? { hf_token: process.env.HF_TOKEN } : {};

    const LOWER_BODY_KW = ['pant', 'pants', 'trouser', 'jeans', 'shorts', 'skirt', 'bottom', 'lower'];
    const isLowerBody = LOWER_BODY_KW.some(kw => (garmentName || '').toLowerCase().includes(kw));

    let hfImageUrl = null;
    let result;

    if (isLowerBody) {
      console.log('Routing to OOTDiffusion for lower-body garment...');
      const app = await client('levihsu/OOTDiffusion', hfOptions);
      result = await app.predict('/process_dc', [
        handle_file(humanImageUrl),
        handle_file(garmentUrl),
        'Lower-body',
        1, 20, 2, -1
      ]);
      const hfImage = result?.data?.[0];
      hfImageUrl = (Array.isArray(hfImage) && hfImage[0]?.image?.url)
        ? hfImage[0].image.url
        : hfImage?.url || (typeof hfImage === 'string' ? hfImage : null);
    } else {
      console.log('Routing to IDM-VTON for upper-body garment...');
      const garmentDescription = garmentName || 'A fashionable piece of clothing';
      const app = await client('yisol/IDM-VTON', hfOptions);
      result = await app.predict('/tryon', [
        { background: handle_file(humanImageUrl), layers: [], composite: null },
        handle_file(garmentUrl),
        garmentDescription,
        true, false, 30, 42
      ]);
      const hfImage = result?.data?.[0];
      hfImageUrl = hfImage?.url || (typeof hfImage === 'string' ? hfImage : null);
    }

    if (!hfImageUrl) {
      console.error('Unexpected HuggingFace response:', JSON.stringify(result?.data));
      throw new Error('HuggingFace returned an unexpected response format. The model may be overloaded — please try again.');
    }

    // Download image and convert to base64 so CORS / auth tokens are never an issue for the frontend
    const imgResponse = await axios.get(hfImageUrl, {
      responseType: 'arraybuffer',
      timeout: 60000  // 60s download timeout
    });
    const base64Image = `data:image/jpeg;base64,${Buffer.from(imgResponse.data).toString('base64')}`;

    console.log('Try-on inference complete!');
    return res.json({
      success: true,
      image_url: base64Image
    });

  } catch (error) {
    console.error('VTON Error:', error.message);
    return res.status(500).json({
      message: 'Failed to generate try-on. The AI server may be busy — please try again in a moment.',
      error: error.message
    });
  }
};

module.exports = {
  generateOutfit,
  generateTryOn
};
