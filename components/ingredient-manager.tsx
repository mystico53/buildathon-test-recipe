'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Ingredient {
  id: string;
  name: string;
  position: number;
  available: boolean;
  createdBy?: string;
  createdByName?: string;
}

interface IngredientManagerProps {
  workspaceId: string;
  currentSession: string;
  currentUserName: string;
}

export function IngredientManager({ workspaceId, currentSession, currentUserName }: IngredientManagerProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newInput, setNewInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const fetchIngredients = useCallback(async () => {
    const { data, error } = await supabase
      .from('workspace_items')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('item_type', 'ingredient')
      .order('position_x', { ascending: true });

    if (error) {
      console.error('Error fetching ingredients:', error);
      return;
    }

    const parsedIngredients = data.map(item => ({
      id: item.id,
      name: item.content.name,
      position: item.position_x || 0,
      available: item.content.available || true,
      createdBy: item.created_by,
      createdByName: item.created_by_name
    }));

    setIngredients(parsedIngredients);
  }, [supabase, workspaceId]);

  const subscribeToIngredients = useCallback(() => {
    console.log('Setting up ingredient subscription for workspace:', workspaceId);
    
    const subscription = supabase
      .channel(`ingredients-${workspaceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_items',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        console.log('Real-time event received:', payload.eventType, payload);
        
        // Handle all events that affect ingredients in this workspace
        const isIngredientEvent = 
          (payload.new && 'item_type' in payload.new && payload.new.item_type === 'ingredient') ||
          (payload.old && 'item_type' in payload.old && payload.old.item_type === 'ingredient');
        
        if (isIngredientEvent) {
          console.log('Processing ingredient event - fetching latest ingredients');
          fetchIngredients();
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from ingredient updates');
      subscription.unsubscribe();
    };
  }, [supabase, workspaceId, fetchIngredients]);

  useEffect(() => {
    fetchIngredients();
    const unsubscribe = subscribeToIngredients();
    return unsubscribe;
  }, [fetchIngredients, subscribeToIngredients]);

  const addIngredient = async () => {
    const ingredientName = newInput.trim();
    if (!ingredientName) return;

    setIsLoading(true);

    // Find the next position
    const nextPosition = ingredients.length > 0 ? Math.max(...ingredients.map(i => i.position)) + 1 : 1;

    console.log('Adding ingredient:', ingredientName);

    const { data, error } = await supabase
      .from('workspace_items')
      .insert({
        workspace_id: workspaceId,
        item_type: 'ingredient',
        content: {
          name: ingredientName,
          available: true
        },
        position_x: nextPosition,
        created_by: currentSession,
        created_by_name: currentUserName
      })
      .select();

    if (error) {
      console.error('Error adding ingredient:', error);
    } else {
      console.log('Ingredient added successfully:', data);
      setNewInput('');
      // Real-time subscription should handle the update automatically
    }

    setIsLoading(false);
  };

  const updateIngredient = async (id: string, newName: string) => {
    if (!newName.trim()) return;

    console.log('Updating ingredient:', id, newName);

    const { data, error } = await supabase
      .from('workspace_items')
      .update({
        content: {
          name: newName.trim(),
          available: true
        }
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating ingredient:', error);
    } else {
      console.log('Ingredient updated successfully:', data);
      setEditingId(null);
      setEditingValue('');
      // Real-time subscription should handle the update automatically
    }
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditingValue(ingredient.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, ingredientId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateIngredient(ingredientId, editingValue);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const removeIngredient = async (ingredientId: string) => {
    console.log('Removing ingredient:', ingredientId);
    
    try {
      const { error } = await supabase
        .from('workspace_items')
        .delete()
        .eq('id', ingredientId);

      if (error) {
        console.error('Error removing ingredient:', error);
        alert(`Failed to delete ingredient: ${error.message}`);
      } else {
        console.log('Ingredient removed successfully');
        // Manually refetch ingredients to ensure UI updates immediately
        fetchIngredients();
      }
    } catch (err) {
      console.error('Exception during ingredient deletion:', err);
      alert(`Failed to delete ingredient: ${err}`);
    }
  };

  return (
    <Card className="p-6 shadow-cooking-lg bg-cooking-lightCream/50 border-cooking-saffron/20">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🛒</span>
        <h3 className="text-xl font-bold text-cooking-warmBrown">Your Fresh Ingredients</h3>
      </div>
      
      {/* Input for adding new ingredient */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Input
            placeholder="What ingredients do you have? (e.g. tomatoes, onions...)"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-4 h-12 rounded-2xl border-cooking-saffron/30 focus:border-cooking-saffron focus:ring-cooking-saffron/20 bg-white/90 text-cooking-warmBrown font-medium placeholder:text-cooking-warmBrown/50"
            disabled={isLoading}
          />
        </div>
        <Button 
          onClick={addIngredient}
          disabled={isLoading || !newInput.trim()}
          variant="cooking"
          size="default"
          className="h-12 px-6 rounded-2xl"
        >
          Add
        </Button>
      </div>

      {/* List of ingredients */}
      <div className="space-y-3">
        {ingredients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm">No ingredients yet! Start by adding what you have in your kitchen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div 
                key={ingredient.id}
                className="flex items-center justify-between p-4 bg-white/80 border border-cooking-saffron/20 rounded-2xl hover:bg-white hover:shadow-cooking hover:border-cooking-saffron/40 transition-all duration-200 hover-lift group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-cooking-saffron font-bold text-lg w-8">
                    {index + 1}.
                  </span>
                  {editingId === ingredient.id ? (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyPress={(e) => handleEditKeyPress(e, ingredient.id)}
                      onBlur={() => updateIngredient(ingredient.id, editingValue)}
                      className="flex-1 border-cooking-herb/50 focus:border-cooking-herb"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1">
                        <span 
                          className="cursor-pointer text-cooking-warmBrown font-medium hover:text-cooking-saffron transition-colors duration-200 group-hover:text-cooking-saffron block"
                          onClick={() => startEditing(ingredient)}
                          title="Click to edit"
                        >
                          {ingredient.name}
                        </span>
                        {ingredient.createdByName && (
                          <span className="text-xs text-cooking-warmBrown/60 mt-0.5 block">
                            Added by {ingredient.createdByName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeIngredient(ingredient.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-cooking-cherry h-8 w-8 p-0 rounded-xl opacity-60 hover:opacity-100 transition-all duration-200"
                  aria-label={`Remove ${ingredient.name}`}
                >
                  🗑️
                </Button>
              </div>
            ))}
            
            {ingredients.length > 0 && (
              <div className="mt-4 p-3 bg-cooking-herb/10 rounded-2xl border border-cooking-herb/20">
                <div className="flex items-center gap-2 text-cooking-herb">
                  <span className="text-sm font-medium">
                    Great! You have {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} ready to cook with
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}