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
      'Corporate': {
        topPos:    ['shirt', 'button', 'oxford', 'formal', 'dress', 'blazer', 'collar', 'suit'],
        topNeg:    ['graphic', 'tee', 'tshirt', 'hoodie', 'sweat', 'oversized', 'cargo', 'shorts'],
        bottomPos: ['trouser', 'formal', 'dress', 'pant', 'pants', 'slack', 'chino'],
        bottomNeg: ['cargo', 'jogger', 'shorts', 'baggy', 'ripped', 'jeans', 'denim'],
        colorPos:  ['black', 'navy', 'white', 'grey', 'charcoal', 'beige'],
      },
      'Smart Casual': {
        topPos:    ['shirt', 'button', 'polo', 'oxford', 'collar', 'knit', 'blazer', 'tee', 'plain'],
        topNeg:    ['graphic', 'hoodie', 'sweat', 'ripped', 'oversized'],
        bottomPos: ['chino', 'trouser', 'pant', 'pants', 'slim', 'straight', 'khaki'],
        bottomNeg: ['cargo', 'jogger', 'shorts', 'baggy', 'ripped'],
        colorPos:  ['navy', 'beige', 'white', 'black', 'grey', 'brown', 'khaki', 'olive'],
      },
      'Minimalist': {
        topPos:    ['plain', 'solid', 'basic', 'simple', 'shirt', 'tee', 'clean'],
        topNeg:    ['graphic', 'print', 'logo', 'pattern', 'floral', 'loud'],
        bottomPos: ['chino', 'trouser', 'slim', 'straight', 'plain', 'pants'],
        bottomNeg: ['cargo', 'jogger', 'baggy', 'ripped', 'printed'],
        colorPos:  ['black', 'white', 'grey', 'navy', 'beige', 'cream', 'off-white', 'charcoal'],
      },
      'Streetwear': {
        topPos:    ['graphic', 'tee', 'tshirt', 't-shirt', 'print', 'logo', 'oversized', 'hoodie', 'sweat'],
        topNeg:    ['formal', 'dress', 'blazer', 'suit'],
        bottomPos: ['cargo', 'jogger', 'baggy', 'wide', 'denim', 'jeans', 'shorts'],
        bottomNeg: ['trouser', 'formal', 'dress', 'slack'],
        colorPos:  ['black', 'grey', 'navy', 'white', 'brown', 'beige', 'khaki', 'olive'],
      },
      'Casual': {
        topPos:    ['tee', 'tshirt', 'polo', 'shirt', 'casual', 'plain'],
        topNeg:    ['formal', 'dress', 'blazer', 'suit'],
        bottomPos: ['jeans', 'chino', 'pant', 'pants', 'shorts', 'denim'],
        bottomNeg: ['formal', 'dress', 'slack'],
        colorPos:  ['blue', 'navy', 'white', 'grey', 'beige', 'black'],
      },
      'Classic': {
        topPos:    ['shirt', 'button', 'oxford', 'polo', 'formal', 'dress', 'blazer'],
        topNeg:    ['graphic', 'hoodie', 'sweat', 'oversized'],
        bottomPos: ['trouser', 'chino', 'dress', 'straight', 'formal', 'pants'],
        bottomNeg: ['cargo', 'jogger', 'shorts', 'baggy', 'ripped'],
        colorPos:  ['black', 'navy', 'white', 'grey', 'khaki', 'beige', 'brown'],
      },
      'Athleisure': {
        topPos:    ['tee', 'tshirt', 'hoodie', 'sweat', 'tank', 'track', 'sport'],
        topNeg:    ['shirt', 'formal', 'dress', 'button', 'blazer'],
        bottomPos: ['jogger', 'shorts', 'track', 'sweat', 'athletic'],
        bottomNeg: ['trouser', 'formal', 'dress', 'chino', 'slack'],
        colorPos:  ['black', 'grey', 'navy', 'white', 'olive'],
      },
      'Sporty': {
        topPos:    ['active', 'sport', 'tee', 'tshirt', 'dry', 'tank', 'running'],
        topNeg:    ['shirt', 'formal', 'dress', 'button', 'blazer', 'knit'],
        bottomPos: ['shorts', 'jogger', 'track', 'running', 'sport', 'athletic'],
        bottomNeg: ['trouser', 'formal', 'dress', 'chino', 'slack', 'jeans', 'denim'],
        colorPos:  ['black', 'grey', 'navy', 'white', 'blue'],
      },
    };

    const resolveRules = (s) => {
      if (STYLE_RULES[s]) return STYLE_RULES[s];
      const norm = (s || '').toLowerCase();
      if (norm.includes('corporate') || norm.includes('formal') || norm.includes('executive')) return STYLE_RULES['Corporate'];
      if (norm.includes('smart') || norm.includes('refined')) return STYLE_RULES['Smart Casual'];
      if (norm.includes('street') || norm.includes('edgy') || norm.includes('tropical') || norm.includes('party')) return STYLE_RULES['Streetwear'];
      if (norm.includes('sport') || norm.includes('performance') || norm.includes('gym')) return STYLE_RULES['Sporty'];
      if (norm.includes('athleisure') || norm.includes('jogger')) return STYLE_RULES['Athleisure'];
      if (norm.includes('casual') || norm.includes('linen') || norm.includes('outdoor')) return STYLE_RULES['Casual'];
      if (norm.includes('classic') || norm.includes('evening')) return STYLE_RULES['Classic'];
      return STYLE_RULES['Minimalist'];
    };

    const rules = resolveRules(style);

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

    // Rank tops and bottoms by score
    const scoredTops = tops
      .map(item => ({ item, score: scoreItem(item, rules.topPos, rules.topNeg) }))
      .sort((a, b) => b.score - a.score);

    const scoredBottoms = bottoms
      .map(item => ({ item, score: scoreItem(item, rules.bottomPos, rules.bottomNeg) }))
      .sort((a, b) => b.score - a.score);

    // Generate all viable candidate pairs
    const allPairs = [];
    if (scoredTops.length > 0 && scoredBottoms.length > 0) {
      for (const t of scoredTops) {
        for (const b of scoredBottoms) {
          const comboScore = t.score + b.score;
          allPairs.push({
            top: t.item,
            bottom: b.item,
            topScore: t.score,
            bottomScore: b.score,
            totalScore: comboScore
          });
        }
      }
      allPairs.sort((a, b) => b.totalScore - a.totalScore);
    } else if (scoredTops.length > 0) {
      scoredTops.forEach(t => allPairs.push({ top: t.item, bottom: null, totalScore: t.score }));
    } else {
      scoredBottoms.forEach(b => allPairs.push({ top: null, bottom: b.item, totalScore: b.score }));
    }

    if (allPairs.length === 0) {
      return res.status(400).json({ message: 'No valid outfit combinations could be formed.' });
    }

    // Pick up to 3 diverse, distinct combinations
    const selectedPairs = [];
    const seenPairs = new Set();
    const pairKey = (p) => `${p.top?._id || 'none'}_${p.bottom?._id || 'none'}`;

    // 1. Primary combination (highest score)
    const best = allPairs[0];
    selectedPairs.push(best);
    seenPairs.add(pairKey(best));

    // 2. Alternative combination: prefer a different top or bottom
    const alt1 = allPairs.find(p => 
      !seenPairs.has(pairKey(p)) && 
      ((p.top?._id !== best.top?._id && p.bottom?._id === best.bottom?._id) || 
       (p.bottom?._id !== best.bottom?._id && p.top?._id === best.top?._id))
    ) || allPairs.find(p => !seenPairs.has(pairKey(p)));

    if (alt1) {
      selectedPairs.push(alt1);
      seenPairs.add(pairKey(alt1));
    }

    // 3. Third combination: prefer another distinct variation
    const alt2 = allPairs.find(p => 
      !seenPairs.has(pairKey(p)) &&
      p.top?._id !== best.top?._id && 
      p.bottom?._id !== (alt1?.bottom?._id || best.bottom?._id)
    ) || allPairs.find(p => !seenPairs.has(pairKey(p)));

    if (alt2) {
      selectedPairs.push(alt2);
      seenPairs.add(pairKey(alt2));
    }

    // Meta details for looks
    const LOOK_CONFIG = [
      { id: 'look_1', title: 'Look 1: Signature Pairing', badge: 'Top Match', baseScore: 98 },
      { id: 'look_2', title: 'Look 2: Contemporary Alternative', badge: 'Modern Twist', baseScore: 94 },
      { id: 'look_3', title: 'Look 3: Versatile Contrast', badge: 'Casual Shift', baseScore: 89 },
    ];

    // ── AI: Generate styling reasons for the combinations ───────────────────────
    let reasonsMap = {};
    try {
      const summaryText = selectedPairs.map((p, idx) => {
        const items = [p.top, p.bottom].filter(Boolean);
        return `Look ${idx + 1}: ${items.map(i => `${i.color} ${i.name} (${i.category})`).join(' + ')}`;
      }).join('\n');

      const reasonMessages = [
        {
          role: 'system',
          content: 'You are an elite fashion copywriter. Return ONLY valid JSON in format: {"look_1": "1-2 sentence note", "look_2": "1-2 sentence note", "look_3": "1-2 sentence note"}. No thinking blocks, no markdown formatting outside JSON.'
        },
        {
          role: 'user',
          content: `Occasion: ${occasion}. Aesthetic: ${style}.\nOutfit Combinations:\n${summaryText}\nProvide a sharp 1-2 sentence styling note for each look explaining why the colors and silhouettes fit the occasion.`
        }
      ];

      const completion = await callGroqWithFallback(reasonMessages);
      let rawContent = completion.choices[0]?.message?.content?.trim() || '';

      // Strip think tags if present
      const thinkEnd = rawContent.lastIndexOf('</think>');
      if (thinkEnd !== -1) rawContent = rawContent.substring(thinkEnd + 8).trim();

      // Extract JSON if wrapped in markdown code fence
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reasonsMap = JSON.parse(jsonMatch[0]);
      }
    } catch (reasonErr) {
      console.warn('Could not generate multi-look styling reasons via Groq:', reasonErr.message);
    }

    // Build finalized outfits list
    const outfits = selectedPairs.map((p, idx) => {
      const config = LOOK_CONFIG[idx] || {
        id: `look_${idx + 1}`,
        title: `Look ${idx + 1}: Curated Styling`,
        badge: 'Recommended',
        baseScore: Math.max(80, 95 - idx * 5)
      };

      const items = [p.top, p.bottom].filter(Boolean);
      const lookKey = `look_${idx + 1}`;
      
      const fallbackReason = items.length === 2
        ? `${items[0].color} ${items[0].name} paired with ${items[1].color} ${items[1].name} offers a sharp, balanced silhouette aligned with ${occasion}.`
        : `A refined ${style.toLowerCase()} piece chosen to complement your ${occasion} plans.`;

      const stylingNote = (reasonsMap[lookKey] || reasonsMap[config.id] || fallbackReason).trim();

      return {
        id: config.id,
        title: config.title,
        badge: config.badge,
        matchScore: config.baseScore,
        selected_ids: items.map(i => String(i._id)),
        items: items,
        styling_reason: stylingNote,
      };
    });

    console.log(`Generated ${outfits.length} combinations for [${style}/${occasion}]`);

    return res.json({
      success: true,
      outfits,
      selected_ids: outfits[0]?.selected_ids || [],
      styling_reason: outfits[0]?.styling_reason || `A curated ${style} look for ${occasion}.`
    });

  } catch (error) {
    console.error('Outfit generation error:', error?.message || error);
    return res.status(500).json({ message: 'Failed to generate outfit. Please try again.', error: error.message });
  }
};


// @desc    Virtual try-on via CatVTON (supports upper, lower, and full-body)
// @route   POST /api/ai/try-on
// @access  Public
const generateTryOn = async (req, res) => {
  try {
    const { garmentUrl, garmentName, garmentImageUrl, category } = req.body;
    const uploadedFile = req.file || (Array.isArray(req.files) ? req.files[0] : null);
    const humanImageUrl = uploadedFile?.path;
    const finalGarmentUrl = garmentUrl || garmentImageUrl;
    const finalGarmentName = garmentName || 'Garment';

    if (!humanImageUrl) {
      return res.status(400).json({ message: 'Please upload a photo of yourself.' });
    }
    if (!finalGarmentUrl) {
      return res.status(400).json({ message: 'Garment image URL is required.' });
    }

    // Detect garment category from explicit param or name/metadata
    const nameLower = (finalGarmentName || '').toLowerCase();
    const LOWER_KW = ['pant', 'pants', 'trouser', 'jeans', 'shorts', 'skirt', 'bottom', 'lower'];
    const DRESS_KW = ['dress', 'gown', 'overall', 'jumpsuit', 'romper', 'outfit'];
    
    let clothType = category || 'upper';
    if (category === 'lower' || LOWER_KW.some(kw => nameLower.includes(kw))) {
      clothType = 'lower';
    } else if (category === 'overall' || DRESS_KW.some(kw => nameLower.includes(kw))) {
      clothType = 'overall';
    }

    console.log(`Starting VTON try-on: garment="${finalGarmentName}", type=${clothType}, humanUrl=${humanImageUrl.slice(0, 40)}...`);

    let hfImageUrl = null;

    // 1. Primary Engine: Kwai-Kolors Virtual Try-On (Dedicated cluster, zero ZeroGPU quota limit)
    try {
      console.log('Attempting Kwai-Kolors Virtual Try-On...');
      const app = await client('Kwai-Kolors/Kolors-Virtual-Try-On');
      const result = await app.predict(2, [
        handle_file(humanImageUrl),
        handle_file(finalGarmentUrl),
        0,
        true
      ]);
      const resItem = result?.data?.[0];
      if (resItem?.url) {
        hfImageUrl = resItem.url;
      } else if (typeof resItem === 'string') {
        hfImageUrl = resItem;
      }
      if (hfImageUrl) {
        console.log('Kwai-Kolors generated successfully!');
      }
    } catch (kolorsErr) {
      console.warn('Kwai-Kolors failed, using fallback:', kolorsErr.message);
    }

    // 2. Fallback Engine: IDM-VTON / OOTDiffusion
    if (!hfImageUrl) {
      const hfOptions = process.env.HF_TOKEN ? { hf_token: process.env.HF_TOKEN } : {};
      if (clothType === 'lower') {
        console.log('Fallback: Using OOTDiffusion for lower-body garment...');
        const app = await client('levihsu/OOTDiffusion', hfOptions);
        const result = await app.predict('/process_dc', [
          handle_file(humanImageUrl),
          handle_file(finalGarmentUrl),
          'Lower-body',
          1, 20, 2, -1
        ]);
        const hfImage = result?.data?.[0];
        if (Array.isArray(hfImage) && hfImage[0]?.image?.url) {
          hfImageUrl = hfImage[0].image.url;
        } else if (hfImage?.url) {
          hfImageUrl = hfImage.url;
        } else if (typeof hfImage === 'string') {
          hfImageUrl = hfImage;
        }
      } else {
        console.log('Fallback: Using IDM-VTON for upper-body garment...');
        const garmentDescription = finalGarmentName || 'A fashionable piece of clothing';
        const app = await client('yisol/IDM-VTON', hfOptions);
        const result = await app.predict('/tryon', [
          { background: handle_file(humanImageUrl), layers: [], composite: null },
          handle_file(finalGarmentUrl),
          garmentDescription,
          true, false, 30, 42
        ]);
        const hfImage = result?.data?.[0];
        hfImageUrl = hfImage?.url || (typeof hfImage === 'string' ? hfImage : null);
      }
    }

    if (!hfImageUrl) {
      throw new Error('AI Model did not return an image URL. Please retry.');
    }

    // Download and encode as base64 for safe frontend rendering
    const imgResponse = await axios.get(hfImageUrl, {
      responseType: 'arraybuffer',
      timeout: 60000
    });
    const base64Image = `data:image/jpeg;base64,${Buffer.from(imgResponse.data).toString('base64')}`;

    console.log(`VTON inference complete! (${clothType})`);
    return res.json({
      success: true,
      image_url: base64Image,
      resultImageUrl: base64Image
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
