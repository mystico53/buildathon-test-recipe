'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setupWorkspaceSchema } from '@/lib/supabase/setup';
import { useWorkspaceActivity } from '@/hooks/useWorkspaceActivity';
import { UserActivityIndicator } from '@/components/UserActivityIndicator';
import { IngredientManager } from '@/components/ingredient-manager';
import { RecipeSuggestions } from '@/components/recipe-suggestions';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  
  const [schemaReady, setSchemaReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Use the consolidated activity hook
  const {
    session,
    userName,
    onlineUsers,
    isOnline,
    updateUserName,
    exitWorkspace,
  } = useWorkspaceActivity(workspaceId, schemaReady);


  useEffect(() => {
    // Check if database schema is set up
    setupWorkspaceSchema().then((result) => {
      if (result.success) {
        setSchemaReady(true);
      } else {
        setDbError(result.error);
      }
    });
  }, []);

  const copyWorkspaceUrl = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleExitWorkspace = async () => {
    await exitWorkspace();
    router.push('/');
  };

  if (!schemaReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          {!dbError ? (
            <>
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <div>
                <p className="font-semibold">Setting up workspace...</p>
                <p className="text-sm text-muted-foreground">
                  Checking database schema
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">⚠️</div>
              <div>
                <p className="font-semibold text-red-600 mb-2">Database Setup Required</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {dbError}
                </p>
                <div className="text-left bg-muted p-4 rounded text-xs space-y-2">
                  <p className="font-semibold">Setup Steps:</p>
                  <p>1. Go to your Supabase dashboard → SQL Editor</p>
                  <p>2. Copy and run the contents of <code>supabase-setup.sql</code></p>
                  <p>3. Refresh this page</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
                >
                  Refresh Page
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cooking-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Activity Indicator */}
        <UserActivityIndicator
          currentSession={session}
          onlineUsers={onlineUsers}
          isOnline={isOnline}
          onCopyWorkspaceUrl={copyWorkspaceUrl}
          onExitWorkspace={handleExitWorkspace}
        />

        {/* Name Input Section */}
        <div className="bg-white/90 rounded-2xl p-4 shadow-cooking-lg border border-cooking-saffron/20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-cooking-warmBrown">What&apos;s your name?</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => updateUserName(e.target.value)}
              placeholder="Enter your name..."
              className="px-3 py-2 text-sm border border-cooking-saffron/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cooking-saffron/20 focus:border-cooking-saffron bg-white/90 text-cooking-warmBrown"
              autoFocus={userName.startsWith('User-')}
            />
          </div>
        </div>

        {/* Main Split Screen Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-96">
          {/* Left Column: Ingredients */}
          <div className="space-y-6">
            <IngredientManager 
              workspaceId={workspaceId} 
              currentSession={session} 
            />
          </div>

          {/* Right Column: Recipe Suggestions */}
          <div>
            <RecipeSuggestions 
              workspaceId={workspaceId} 
              currentSession={session} 
            />
          </div>
        </div>

        {/* Bottom: Share & Instructions */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-cooking-lightCream/70 border border-cooking-saffron/20 p-6 shadow-cooking-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🍽️</span>
                  <h3 className="font-semibold text-cooking-warmBrown">Recipe Workspace</h3>
                </div>
                <ul className="text-sm text-cooking-warmBrown/80 space-y-2">
                  <li>• Add ingredients you have available</li>
                  <li>• Click &quot;Suggest Recipes&quot; to get personalized recommendations</li>
                  <li>• Share this URL with others to collaborate on meal planning</li>
                </ul>
              </div>
              <button 
                onClick={copyWorkspaceUrl}
                className="px-6 py-3 bg-gradient-to-r from-cooking-saffron to-cooking-paprika text-white rounded-2xl text-sm font-medium hover:shadow-cooking-lg hover:scale-105 transition-all duration-200 whitespace-nowrap self-start shadow-cooking"
              >
                Share Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}