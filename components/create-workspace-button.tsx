'use client';

import { useRouter } from 'next/navigation';

export function CreateWorkspaceButton() {
  const router = useRouter();

  const createWorkspace = () => {
    // Generate a random workspace ID
    const workspaceId = Math.random().toString(36).substring(2, 15);
    router.push(`/workspace/${workspaceId}`);
  };

  return (
    <button
      onClick={createWorkspace}
      className="w-full inline-flex items-center justify-center gap-3 rounded-2xl text-lg font-bold bg-gradient-to-r from-cooking-saffron to-cooking-paprika text-white shadow-cooking-lg hover:shadow-cooking-xl hover:from-cooking-saffron/90 hover:to-cooking-paprika/90 transition-all duration-300 hover:scale-105 active:scale-95 h-14 px-8 py-3"
    >
      <span className="text-xl">👨‍🍳</span>
      <span>Create Your Kitchen Space</span>
      <span className="text-xl">👩‍🍳</span>
    </button>
  );
}