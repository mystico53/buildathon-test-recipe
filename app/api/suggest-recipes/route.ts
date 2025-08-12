import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  console.log('🚀 Recipe suggestion API called');
  
  try {
    const { workspaceId, currentSession } = await request.json();
    console.log('📥 Request data:', { workspaceId, currentSession });

    if (!workspaceId) {
      console.log('❌ Missing workspace ID');
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    console.log('🔗 Creating Supabase client...');
    const supabase = await createClient();

    // Fetch ingredients from the workspace
    console.log('📊 Fetching ingredients from workspace:', workspaceId);
    const { data: workspaceItems, error: fetchError } = await supabase
      .from('workspace_items')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('item_type', 'ingredient');

    if (fetchError) {
      console.error('❌ Error fetching workspace items:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch workspace data' }, { status: 500 });
    }

    console.log('📦 Raw workspace items:', workspaceItems);

    // Parse ingredients
    const ingredients = workspaceItems.map(item => item.content.name);
    console.log('🥬 Parsed ingredients:', ingredients);

    if (ingredients.length === 0) {
      console.log('❌ No ingredients found');
      return NextResponse.json({ error: 'No ingredients found. Please add some ingredients first.' }, { status: 400 });
    }

    // Build the enhanced prompt for Claude
    const ingredientsList = ingredients.join(', ');

    const prompt = `You are a professional chef and meal planning expert. I need you to create 3 creative, delicious recipes using the ingredients I have available. Please be creative and think outside the box while keeping recipes practical.

Available Ingredients: ${ingredientsList}

Requirements:
- Maximize use of available ingredients (aim to use at least 60% of listed ingredients per recipe)
- Suggest creative combinations and cooking techniques
- Provide practical substitutions for missing ingredients
- Include recipes of varying complexity and meal types
- Consider different cuisines and flavor profiles

For each recipe, provide:
1. An appealing recipe title that hints at the flavor profile
2. List of ingredients that ARE available from my provided ingredients
3. List of ingredients that are MISSING and need to be purchased (keep this minimal)
4. Practical substitutions for missing ingredients using common pantry items
5. Clear, numbered step-by-step instructions
6. Realistic prep + cook time
7. Difficulty level (Easy/Medium/Hard)
8. Brief description of the dish and why it's delicious

Please respond ONLY with valid JSON in this exact format:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "ingredients_available": ["ingredient1", "ingredient2"],
      "ingredients_missing": ["ingredient3", "ingredient4"],
      "substitutions": {
        "ingredient3": "alternative ingredient",
        "ingredient4": "another alternative"
      },
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "prep_time": "30 minutes",
      "difficulty": "Easy"
    }
  ]
}`;

    // Call Claude API with the latest model
    console.log('🤖 Calling Claude API...');
    console.log('📝 Prompt length:', prompt.length);
    const llmResponse = await callClaudeAPI(prompt);

    console.log('🔄 Claude API response:', llmResponse);

    if (!llmResponse || !llmResponse.recipes) {
      console.log('❌ Invalid response from Claude API');
      return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 });
    }

    console.log('✅ Generated recipes:', llmResponse.recipes.length);

    // Store the suggestions in the database
    console.log('💾 Storing suggestions in database...');
    const { error: insertError } = await supabase
      .from('workspace_items')
      .insert({
        workspace_id: workspaceId,
        item_type: 'recipe_suggestion',
        content: {
          recipes: llmResponse.recipes,
          generated_for_ingredients: ingredients
        },
        created_by: currentSession
      });

    if (insertError) {
      console.error('❌ Error storing recipe suggestions:', insertError);
      return NextResponse.json({ error: 'Failed to store suggestions' }, { status: 500 });
    }

    console.log('✅ Successfully stored suggestions');

    return NextResponse.json({ 
      success: true, 
      recipes: llmResponse.recipes 
    });

  } catch (error) {
    console.error('❌ Error in suggest-recipes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function callClaudeAPI(prompt: string) {
  console.log('🔧 Starting callClaudeAPI function');
  
  // Check if API key exists
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('🔑 API Key present:', !!apiKey);
  if (apiKey) {
    console.log('🔑 API Key first 10 chars:', apiKey.substring(0, 10));
  }

  // Primary: Use Anthropic Claude API with SDK
  if (apiKey) {
    try {
      console.log('🏗️ Initializing Anthropic client...');
      const anthropic = new Anthropic({
        apiKey: apiKey,
      });

      console.log('📤 Making API request to Claude...');
      console.log('🎯 Model: claude-3-5-sonnet-20241022');
      console.log('⚙️ Max tokens: 3000, Temperature: 0.7');

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Latest Claude 3.5 Sonnet model
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      console.log('📨 Received response from Claude');
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response content array length:', response.content?.length);

      const content = response.content[0];
      console.log('📄 First content type:', content?.type);
      
      if (content.type === 'text') {
        console.log('📝 Raw text length:', content.text.length);
        console.log('📝 Raw text preview:', content.text.substring(0, 200) + '...');
        
        try {
          const parsed = JSON.parse(content.text);
          console.log('✅ Successfully parsed JSON');
          console.log('🍳 Recipes count:', parsed.recipes?.length);
          return parsed;
        } catch (parseError) {
          console.error('❌ Error parsing Claude response:', parseError);
          console.error('❌ Raw response:', content.text);
          return null;
        }
      } else {
        console.error('❌ Unexpected content type:', content.type);
        return null;
      }
    } catch (error) {
      console.error('❌ Claude API error:', error);
      if (error instanceof Error) {
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
      }
      if (error && typeof error === 'object' && 'status' in error) {
        console.error('❌ HTTP Status:', error.status);
      }
    }
  } else {
    console.log('❌ No Anthropic API key found');
  }

  // Fallback: OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          return null;
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  // Development fallback with better mock data
  console.warn('No AI API keys found, returning enhanced mock data');
  return {
    recipes: [
      {
        title: "Mediterranean Pasta Delight",
        ingredients_available: ["pasta", "garlic", "olive oil"],
        ingredients_missing: ["cherry tomatoes", "fresh basil", "parmesan"],
        substitutions: {
          "cherry tomatoes": "canned diced tomatoes or tomato paste",
          "fresh basil": "dried basil or oregano",
          "parmesan": "any hard cheese or nutritional yeast"
        },
        instructions: [
          "Cook pasta according to package instructions until al dente",
          "Heat olive oil in a large pan over medium heat",
          "Add minced garlic and sauté until fragrant (about 1 minute)",
          "Add tomatoes and cook for 3-4 minutes",
          "Toss cooked pasta with the garlic oil mixture",
          "Add cheese and herbs, season with salt and pepper",
          "Serve immediately while hot"
        ],
        prep_time: "20 minutes",
        difficulty: "Easy"
      },
      {
        title: "Asian-Inspired Veggie Bowl",
        ingredients_available: ["vegetables", "oil", "garlic"],
        ingredients_missing: ["soy sauce", "sesame oil", "rice"],
        substitutions: {
          "soy sauce": "salt with a splash of vinegar or worcestershire",
          "sesame oil": "any cooking oil with a pinch of toasted seeds",
          "rice": "pasta, bread, or quinoa as base"
        },
        instructions: [
          "Heat oil in a wok or large skillet over high heat",
          "Add minced garlic and stir-fry for 30 seconds",
          "Add harder vegetables first, then softer ones",
          "Stir-fry for 3-5 minutes until tender-crisp",
          "Season with available seasonings",
          "Serve over your chosen base",
          "Garnish with any available herbs or nuts"
        ],
        prep_time: "15 minutes",
        difficulty: "Easy"
      },
      {
        title: "Hearty Comfort Soup",
        ingredients_available: ["vegetables", "oil"],
        ingredients_missing: ["broth", "herbs", "protein"],
        substitutions: {
          "broth": "water with bouillon cube or salt",
          "herbs": "any available spices or dried herbs",
          "protein": "beans, lentils, eggs, or cheese if available"
        },
        instructions: [
          "Heat oil in a large pot over medium heat",
          "Chop all vegetables into bite-sized pieces",
          "Sauté harder vegetables first for 5 minutes",
          "Add softer vegetables and cook 2 more minutes",
          "Add liquid to cover vegetables by 2 inches",
          "Bring to boil, then simmer 15-20 minutes",
          "Season to taste and add protein if desired",
          "Simmer 5 more minutes and serve hot"
        ],
        prep_time: "35 minutes",
        difficulty: "Easy"
      }
    ]
  };
}