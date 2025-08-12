import { CreateWorkspaceButton } from "@/components/create-workspace-button";

export default function Home() {
  return (
    <main className="min-h-screen bg-cooking-gradient-subtle flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary animate-bounce-gentle">
            🍽️ Our Kitchen
          </h1>
          <p className="text-cooking-saffron text-sm font-medium tracking-wide">
            Cook • Share • Connect
          </p>
        </div>
        
        <div className="flex justify-center py-6">
          <div className="relative group">
            <img 
              src="https://qnomtpqlryuqqmgeqzwz.supabase.co/storage/v1/object/sign/assets/dinner%20friends%20cooking.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNjk2ZjE4Ny1mOTNkLTQyNzQtOTYyMy03ZjhjMThmYjE1NGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvZGlubmVyIGZyaWVuZHMgY29va2luZy5qcGciLCJpYXQiOjE3NTUwMTY4MzYsImV4cCI6MTc4NjU1MjgzNn0.foS-_nQY3FXjvdhyawgsLKganV9D5e4Y6A58hdpYidA" 
              alt="Friends cooking together" 
              className="w-96 h-64 object-contain rounded-2xl shadow-cooking-lg group-hover:shadow-cooking-xl transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute -top-2 -right-2 text-2xl animate-pulse-slow">
              👨‍🍳
            </div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce-gentle">
              👩‍🍳
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-cooking-warmBrown">
            🥄 Don&apos;t cook alone, make kitchen friends! 🧄
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            With <span className="font-bold text-cooking-saffron bg-cooking-butter/20 px-2 py-1 rounded-lg">
              🍅 Our Kitchen
            </span>, you can share your ingredients with friends and whip up amazing meals together in no time!
          </p>
          <div className="flex justify-center gap-6 text-2xl pt-2">
            <span className="animate-bounce-gentle" style={{animationDelay: '0s'}}>🥕</span>
            <span className="animate-bounce-gentle" style={{animationDelay: '0.2s'}}>🧅</span>
            <span className="animate-bounce-gentle" style={{animationDelay: '0.4s'}}>🥬</span>
            <span className="animate-bounce-gentle" style={{animationDelay: '0.6s'}}>🍆</span>
            <span className="animate-bounce-gentle" style={{animationDelay: '0.8s'}}>🌶️</span>
          </div>
        </div>
        
        <div className="pt-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-cooking-lg">
            <p className="text-cooking-warmBrown text-sm mb-4 flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Start your culinary adventure</span>  
              <span>✨</span>
            </p>
            <CreateWorkspaceButton />
          </div>
        </div>
      </div>
    </main>
  );
}
