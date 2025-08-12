'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Recipe {
  title: string;
  ingredients_available: string[];
  ingredients_missing: string[];
  substitutions: { [key: string]: string };
  instructions: string[];
  prep_time?: string;
  difficulty?: string;
}

interface RecipeSuggestion {
  id: string;
  recipes: Recipe[];
  generated_at: string;
}

interface RecipeSuggestionsProps {
  workspaceId: string;
  currentSession: string;
}

export function RecipeSuggestions({ workspaceId, currentSession }: RecipeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const supabase = createClient();

  const fetchSuggestions = useCallback(async () => {
    const { data, error } = await supabase
      .from('workspace_items')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('item_type', 'recipe_suggestion')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching suggestions:', error);
      return;
    }

    const parsedSuggestions = data.map(item => ({
      id: item.id,
      recipes: item.content.recipes || [],
      generated_at: item.created_at
    }));

    setSuggestions(parsedSuggestions);
  }, [supabase, workspaceId]);

  const subscribeToSuggestions = useCallback(() => {
    const subscription = supabase
      .channel(`suggestions-${workspaceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_items',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        if (payload.new && 'item_type' in payload.new && payload.new.item_type === 'recipe_suggestion') {
          fetchSuggestions();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, workspaceId, fetchSuggestions]);

  useEffect(() => {
    fetchSuggestions();
    subscribeToSuggestions();
  }, [fetchSuggestions, subscribeToSuggestions]);

  const generateRecipes = async () => {
    console.log('🎬 Starting recipe generation...');
    console.log('📍 Workspace ID:', workspaceId);
    console.log('👤 Current Session:', currentSession);
    
    setIsGenerating(true);

    try {
      console.log('📡 Making API request to /api/suggest-recipes...');
      const response = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workspaceId,
          currentSession 
        })
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API response not ok:', errorText);
        throw new Error(`Failed to generate recipes: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ API response data:', responseData);

      // The API will handle storing the suggestions in the database
      // The real-time subscription will update our state
    } catch (error) {
      console.error('❌ Error generating recipes:', error);
      console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
      
      // Show user-friendly error
      alert(`Failed to generate recipes: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSuggestion = suggestions[0];

  return (
    <Card className="p-6 h-full shadow-cooking-lg bg-cooking-lightCream/50 border-cooking-saffron/20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍🍳</span>
          <h3 className="text-xl font-bold text-cooking-warmBrown">Recipe Suggestions</h3>
        </div>
        <Button 
          onClick={generateRecipes} 
          disabled={isGenerating}
          variant="cooking"
          size="default"
          className="h-12 px-6 rounded-2xl"
        >
          {isGenerating ? 'Generating...' : 'Suggest Recipes'}
        </Button>
      </div>

      {isGenerating && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="text-4xl animate-pulse-slow">🍳</div>
            <div className="animate-spin h-8 w-8 border-2 border-cooking-saffron border-t-transparent rounded-full mx-auto"></div>
            <p className="text-cooking-warmBrown font-medium">Generating personalized recipes...</p>
            <p className="text-sm text-cooking-warmBrown/70">Using your fresh ingredients</p>
          </div>
        </div>
      )}

      {!isGenerating && !currentSuggestion && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-4xl mb-4">🍲</div>
            <p className="text-cooking-warmBrown font-medium">Ready to cook something amazing?</p>
            <p className="text-sm text-cooking-warmBrown/70">Click &quot;Suggest Recipes&quot; to get personalized recipe recommendations based on your available ingredients.</p>
          </div>
        </div>
      )}

      {!isGenerating && currentSuggestion && (
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {currentSuggestion.recipes.map((recipe, index) => (
            <div key={index} className="border border-cooking-saffron/30 rounded-2xl p-6 space-y-4 bg-white/90 shadow-cooking hover:shadow-cooking-lg transition-all duration-200 hover-lift">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg text-cooking-warmBrown">{recipe.title}</h4>
                </div>
                <div className="flex gap-2 text-xs">
                  {recipe.prep_time && (
                    <Badge variant="outline" className="border-cooking-herb/50 text-cooking-herb bg-cooking-herb/10">
                      {recipe.prep_time}
                    </Badge>
                  )}
                  {recipe.difficulty && (
                    <Badge variant="outline" className="border-cooking-saffron/50 text-cooking-saffron bg-cooking-saffron/10">
                      {recipe.difficulty}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Available Ingredients */}
                <div>
                  <h5 className="text-sm font-bold text-cooking-herb mb-2">
                    Available Ingredients:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients_available.map((ingredient, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-cooking-herb/20 text-cooking-herb border border-cooking-herb/30">
                        ✓ {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Ingredients */}
                {recipe.ingredients_missing.length > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-cooking-warmBrown/70 mb-2">
                      Need to get:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients_missing.map((ingredient, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-cooking-saffron/30 text-cooking-warmBrown bg-cooking-saffron/10 flex flex-col items-start p-2">
                          <span>{ingredient}</span>
                          {recipe.substitutions[ingredient] && (
                            <span className="text-cooking-warmBrown/60 text-xs mt-1 font-normal">
                              or {recipe.substitutions[ingredient]}
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div>
                <h5 className="text-sm font-bold text-cooking-warmBrown mb-3">
                  Cooking Instructions:
                </h5>
                <ol className="text-sm text-cooking-warmBrown/80 space-y-2 ml-4">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="list-decimal leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}