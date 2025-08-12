'use client';

import { useState } from 'react';
import { OnlineUser, getUserColor } from '@/lib/workspace-activity';

interface UserActivityIndicatorProps {
  currentSession: string;
  onlineUsers: OnlineUser[];
  isOnline: boolean;
  onCopyWorkspaceUrl?: () => void;
  onExitWorkspace?: () => Promise<void>;
}

interface UserAvatarProps {
  user: OnlineUser;
  isCurrentUser: boolean;
  size?: 'sm' | 'md';
}

const UserAvatar = ({ user, isCurrentUser, size = 'md' }: UserAvatarProps) => {
  const displayName = user.user_name || `User-${user.user_session.slice(0, 4)}`;
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-xs';
  
  return (
    <div
      className={`${sizeClass} rounded-full border-2 flex items-center justify-center font-semibold text-white ${
        isCurrentUser ? 'border-white shadow-lg' : 'border-background'
      }`}
      style={{ backgroundColor: getUserColor(user.user_session) }}
      title={displayName}
    >
      {displayName.slice(0, 2).toUpperCase()}
    </div>
  );
};

interface EditableUserNameProps {
  userName: string;
  onUpdateUserName: (name: string) => Promise<void>;
}

const EditableUserName = ({ userName, onUpdateUserName }: EditableUserNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSave = async () => {
    setIsEditing(false);
    if (tempName !== userName) {
      await onUpdateUserName(tempName);
    }
  };

  const handleCancel = () => {
    setTempName(userName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="text-xs bg-white border border-cooking-saffron/30 rounded-lg px-2 py-1 min-w-0 text-cooking-warmBrown focus:outline-none focus:ring-2 focus:ring-cooking-saffron/20 focus:border-cooking-saffron"
        autoFocus
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-xs hover:underline cursor-pointer text-left text-cooking-warmBrown hover:text-cooking-saffron transition-colors duration-200"
    >
      {userName}
    </button>
  );
};

export const UserActivityIndicator = ({
  currentSession,
  onlineUsers,
  isOnline,
  onCopyWorkspaceUrl,
  onExitWorkspace,
}: UserActivityIndicatorProps) => {
  return (
    <div className="bg-white/90 rounded-2xl p-6 shadow-cooking-lg border border-cooking-saffron/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👥</span>
            <h1 className="text-2xl font-bold text-cooking-warmBrown">Kitchen Workspace</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-cooking-herb animate-pulse-slow' : 'bg-cooking-paprika'}`}></div>
            <span className="text-sm font-medium text-cooking-warmBrown/70">
              {isOnline ? 'Connected to kitchen' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
        {/* Online Users Display */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 3).map((user) => (
              <UserAvatar
                key={user.user_session}
                user={user}
                isCurrentUser={user.user_session === currentSession}
              />
            ))}
            {onlineUsers.length > 3 && (
              <div className="w-8 h-8 bg-cooking-lightCream border-2 border-cooking-saffron/30 rounded-full flex items-center justify-center text-xs font-semibold text-cooking-warmBrown">
                +{onlineUsers.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-cooking-warmBrown/70">
            <span className="text-cooking-herb font-bold">{onlineUsers.length}</span> chef{onlineUsers.length !== 1 ? 's' : ''} cooking
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCopyWorkspaceUrl && (
            <button
              onClick={onCopyWorkspaceUrl}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cooking-saffron/20 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-cooking-saffron to-cooking-paprika text-white hover:shadow-cooking-lg hover:scale-105 h-10 px-4 shadow-cooking"
            >
              <span className="mr-1">📋</span>
              Copy Link
            </button>
          )}
          
          {onExitWorkspace && (
            <button
              onClick={onExitWorkspace}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cooking-saffron/20 disabled:pointer-events-none disabled:opacity-50 border border-cooking-saffron/30 bg-white/90 hover:bg-cooking-lightCream hover:border-cooking-saffron/50 text-cooking-warmBrown h-10 px-4"
            >
              <span className="mr-1">🚪</span>
              Exit Kitchen
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

interface UserProfileCardProps {
  session: string;
  userName: string;
  isOnline: boolean;
  onUpdateUserName: (name: string) => Promise<void>;
}

export const UserProfileCard = ({ 
  session, 
  userName, 
  isOnline, 
  onUpdateUserName 
}: UserProfileCardProps) => {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="font-semibold mb-2">Your Profile</h3>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm">{isOnline ? 'Connected to workspace' : 'Disconnected'}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Name:</span>
          <EditableUserName 
            userName={userName} 
            onUpdateUserName={onUpdateUserName}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Session: {session.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
};