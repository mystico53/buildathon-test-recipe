'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface UserPreference {
  id: string;
  preference_type: string;
  value: string;
  user_session: string;
}

interface UserPreferencesProps {
  workspaceId: string;
  currentSession: string;
}

const CUISINE_PREFERENCES = [
  'Italian', 'Asian', 'Mexican', 'Indian', 'Mediterranean', 
  'American', 'French', 'Thai', 'Japanese', 'Chinese'
];

const DISH_TYPE_PREFERENCES = [
  'Curry', 'Rice dish', 'Pasta dish', 'Soup', 'Salad', 
  'Stir-fry', 'Sandwich', 'Pizza', 'Dessert', 'Breakfast'
];

const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Gluten-free', 'Low-carb', 
  'High-protein', 'Dairy-free', 'Keto', 'Paleo'
];

export function UserPreferences({ workspaceId, currentSession }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const fetchPreferences = useCallback(async () => {
    const { data, error } = await supabase
      .from('workspace_items')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('item_type', 'user_preference');

    if (error) {
      console.error('Error fetching preferences:', error);
      return;
    }

    const parsedPreferences = data.map(item => ({
      id: item.id,
      preference_type: item.content.preference_type,
      value: item.content.value,
      user_session: item.created_by || ''
    }));

    setPreferences(parsedPreferences);
  }, [supabase, workspaceId]);

  const subscribeToPreferences = useCallback(() => {
    const subscription = supabase
      .channel(`preferences-${workspaceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_items',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        if (payload.new && 'item_type' in payload.new && payload.new.item_type === 'user_preference') {
          fetchPreferences();
        }
        if (payload.eventType === 'DELETE') {
          fetchPreferences();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, workspaceId, fetchPreferences]);

  useEffect(() => {
    fetchPreferences();
    subscribeToPreferences();
  }, [fetchPreferences, subscribeToPreferences]);

  const togglePreference = async (preferenceType: string, value: string) => {
    setIsLoading(true);

    // Check if this preference already exists for this user
    const existingPref = preferences.find(
      p => p.user_session === currentSession && 
           p.preference_type === preferenceType && 
           p.value === value
    );

    if (existingPref) {
      // Remove the preference
      const { error } = await supabase
        .from('workspace_items')
        .delete()
        .eq('id', existingPref.id);

      if (error) {
        console.error('Error removing preference:', error);
      }
    } else {
      // Add the preference
      const { error } = await supabase
        .from('workspace_items')
        .insert({
          workspace_id: workspaceId,
          item_type: 'user_preference',
          content: {
            preference_type: preferenceType,
            value: value
          },
          created_by: currentSession
        });

      if (error) {
        console.error('Error adding preference:', error);
      }
    }

    setIsLoading(false);
  };

  const getUserPreferences = (userSession: string) => {
    return preferences.filter(p => p.user_session === userSession);
  };

  const isPreferenceSelected = (preferenceType: string, value: string) => {
    return preferences.some(
      p => p.user_session === currentSession && 
           p.preference_type === preferenceType && 
           p.value === value
    );
  };

  const currentUserPrefs = getUserPreferences(currentSession);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Your Food Preferences</h3>
      
      <div className="space-y-6">
        {/* Cuisine Preferences */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Cuisine Type</h4>
          <div className="flex flex-wrap gap-2">
            {CUISINE_PREFERENCES.map((cuisine) => (
              <Button
                key={cuisine}
                variant={isPreferenceSelected('cuisine', cuisine) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePreference('cuisine', cuisine)}
                disabled={isLoading}
                className="text-xs"
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>

        {/* Dish Type Preferences */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Dish Type</h4>
          <div className="flex flex-wrap gap-2">
            {DISH_TYPE_PREFERENCES.map((dishType) => (
              <Button
                key={dishType}
                variant={isPreferenceSelected('dish_type', dishType) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePreference('dish_type', dishType)}
                disabled={isLoading}
                className="text-xs"
              >
                {dishType}
              </Button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Dietary Restrictions</h4>
          <div className="flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map((dietary) => (
              <Button
                key={dietary}
                variant={isPreferenceSelected('dietary', dietary) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePreference('dietary', dietary)}
                disabled={isLoading}
                className="text-xs"
              >
                {dietary}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {currentUserPrefs.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Your Selected Preferences:</h4>
            <div className="flex flex-wrap gap-1">
              {currentUserPrefs.map((pref) => (
                <Badge key={pref.id} variant="secondary" className="text-xs">
                  {pref.value}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Component to display all users' preferences in the top section
interface OnlineUser {
  user_session: string;
  user_name?: string;
}

export function AllUserPreferences({ workspaceId, onlineUsers }: { 
  workspaceId: string; 
  onlineUsers: OnlineUser[]; 
}) {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const supabase = createClient();

  const fetchPreferences = useCallback(async () => {
    const { data, error } = await supabase
      .from('workspace_items')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('item_type', 'user_preference');

    if (error) return;

    const parsedPreferences = data.map(item => ({
      id: item.id,
      preference_type: item.content.preference_type,
      value: item.content.value,
      user_session: item.created_by || ''
    }));

    setPreferences(parsedPreferences);
  }, [supabase, workspaceId]);

  const subscribeToPreferences = useCallback(() => {
    const subscription = supabase
      .channel(`all-preferences-${workspaceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_items',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        if (payload.new && 'item_type' in payload.new && payload.new.item_type === 'user_preference') {
          fetchPreferences();
        }
        if (payload.eventType === 'DELETE') {
          fetchPreferences();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, workspaceId, fetchPreferences]);

  useEffect(() => {
    fetchPreferences();
    subscribeToPreferences();
  }, [fetchPreferences, subscribeToPreferences]);

  const getUserPreferences = (userSession: string) => {
    return preferences.filter(p => p.user_session === userSession);
  };

  return (
    <div className="space-y-2">
      {onlineUsers.map((user) => {
        const userPrefs = getUserPreferences(user.user_session);
        const displayName = user.user_name || `User-${user.user_session.slice(0, 4)}`;
        
        return (
          <div key={user.user_session} className="flex items-center gap-3">
            <span className="text-sm font-medium min-w-24">{displayName}:</span>
            <div className="flex flex-wrap gap-1">
              {userPrefs.length === 0 ? (
                <span className="text-xs text-muted-foreground">No preferences set</span>
              ) : (
                userPrefs.map((pref) => (
                  <Badge key={pref.id} variant="outline" className="text-xs">
                    {pref.value}
                  </Badge>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}