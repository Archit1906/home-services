import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Search, Star, MessageSquare, ShieldCheck, User, Wrench, X, Filter } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';

// Mock location listings for map display
const MAP_ITEMS = [
  { id: '1', type: 'worker', name: 'Ian Carpenter', category: 'Carpentry', rating: 4.8, distance: 1.2, x: 25, y: 35, headline: 'Custom furniture building and door repair' },
  { id: '2', type: 'worker', name: 'Jack Electrician', category: 'Electrical', rating: 4.9, distance: 2.4, x: 65, y: 25, headline: 'Wiring modifications and circuit upgrades' },
  { id: '3', type: 'worker', name: 'Karen Cleaner', category: 'Cleaning', rating: 4.7, distance: 0.8, x: 45, y: 55, headline: 'Apartment cleaning and window washing' },
  { id: '4', type: 'worker', name: 'Leo Plumber', category: 'Plumbing', rating: 4.6, distance: 3.1, x: 75, y: 65, headline: 'Leaky faucet repairs and toilet snaking' },
  { id: '5', type: 'job', name: 'Fix kitchen sink pipe leak', category: 'Plumbing', budget: 1500, distance: 1.5, x: 35, y: 45 },
  { id: '6', type: 'job', name: 'Deep clean 3-bedroom apartment', category: 'Cleaning', budget: 3500, distance: 2.1, x: 55, y: 75 }
];

export default function MapExplorer() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { startConversation } = useChatStore();

  const [mode, setMode] = useState('worker'); // 'worker' or 'job'
  const [radius, setRadius] = useState(15);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on mode, radius, and query
  const filteredItems = MAP_ITEMS.filter(item => {
    const isModeMatch = item.type === mode;
    const isRadiusMatch = item.distance <= radius;
    const isQueryMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return isModeMatch && isRadiusMatch && isQueryMatch;
  });

  const handleStartChat = async (recipientId) => {
    try {
      const conv = await startConversation(recipientId);
      addToast('Conversation started!', 'success');
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      addToast(err.message || 'Failed to start chat session', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-4 md:p-6 flex flex-col h-[90vh]">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-border/10 rounded-full text-text-secondary hover:text-text-primary hover:shadow transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-display font-black">Map Explorer</h1>
        </div>

        {/* Search Query Input */}
        <div className="relative flex items-center max-w-xs w-full">
          <Search className="absolute left-3.5 h-4 w-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all border border-border/15 shadow-sm"
          />
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden h-full">
        
        {/* Sidebar Controls (Left) */}
        <Card className="w-full md:w-80 p-4 border border-border/10 bg-white/70 dark:bg-slate-900/70 flex flex-col overflow-hidden h-full">
          <div className="space-y-5">
            {/* View Selector Toggle */}
            <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl">
              <button
                onClick={() => { setMode('worker'); setSelectedItem(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'worker' ? 'bg-white dark:bg-slate-800 text-text-primary shadow-default' : 'text-text-secondary'
                }`}
              >
                Service Pros
              </button>
              <button
                onClick={() => { setMode('job'); setSelectedItem(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'job' ? 'bg-white dark:bg-slate-800 text-text-primary shadow-default' : 'text-text-secondary'
                }`}
              >
                Open Job Posts
              </button>
            </div>

            {/* Proximity Radius Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <span>Search Radius limit</span>
                <span className="text-primary font-black">{radius} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto space-y-2 mt-6 pr-1 border-t border-border/10 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-2">
              Showing {filteredItems.length} Listings on Map
            </span>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded-2xl cursor-pointer border transition-all ${
                  selectedItem?.id === item.id
                    ? 'bg-primary-light border-primary/20 dark:bg-slate-800/80 dark:border-primary/25'
                    : 'border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-850'
                }`}
              >
                <h4 className="font-bold text-xs leading-none text-text-primary">{item.name}</h4>
                <p className="text-[10px] text-text-secondary font-medium mt-1">{item.category} &bull; {item.distance} km away</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Mock Map Board Container (Right) */}
        <div className="flex-grow bg-slate-100 dark:bg-slate-900 border border-border/10 rounded-card relative overflow-hidden shadow-inner h-full">
          {/* Map Grid Lines mockup */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1.5px,transparent_1.5px),linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[linear-gradient(to_right,#334155_1.5px,transparent_1.5px),linear-gradient(to_bottom,#334155_1.5px,transparent_1.5px)] bg-[size:32px_32px] opacity-25" />
          
          {/* Map Landscape Graphics */}
          <div className="absolute top-12 left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-28 w-64 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* User Location Center node */}
          <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
            <div className="h-6 w-6 bg-primary/25 rounded-full flex items-center justify-center animate-pulse">
              <div className="h-3 w-3 bg-primary rounded-full border border-white" />
            </div>
            <span className="text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow mt-1">You</span>
          </div>

          {/* Plotting Markers */}
          {filteredItems.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            const markerColor = item.type === 'worker' ? 'text-emerald-500' : 'text-primary';

            return (
              <motion.button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                whileHover={{ scale: 1.15 }}
                className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-10"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`
                }}
              >
                <MapPin className={`h-8 w-8 ${markerColor} ${isSelected ? 'scale-125 filter drop-shadow animate-bounce' : 'opacity-85'}`} />
                <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-1 border ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-transparent' 
                    : 'bg-white text-text-primary dark:bg-slate-800 border-border/10'
                }`}>
                  {item.category}
                </div>
              </motion.button>
            );
          })}

          {/* Slideover detail card on selected item */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="absolute bottom-5 left-5 right-5 md:left-auto md:right-5 md:max-w-sm bg-white dark:bg-slate-900 border border-border/25 rounded-card p-5 shadow-elevated z-20"
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 text-text-secondary hover:text-text-primary focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={selectedItem.type === 'worker' ? undefined : undefined}
                      name={selectedItem.name}
                      size="sm"
                    />
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{selectedItem.name}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">{selectedItem.category} &bull; {selectedItem.distance} km away</p>
                    </div>
                  </div>

                  {selectedItem.type === 'worker' ? (
                    <>
                      <p className="text-xs text-text-secondary italic">"{selectedItem.headline}"</p>
                      <div className="flex items-center justify-between border-t border-border/10 pt-3 flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-4 w-4 fill-current" /> {selectedItem.rating} Rating
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 py-1.5 text-xs font-bold"
                            onClick={() => navigate(`/profile/${selectedItem.id}`)}
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="px-3.5 py-1.5 text-xs font-bold"
                            onClick={() => handleStartChat(selectedItem.id)}
                          >
                            Chat
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-t border-border/10 pt-3 flex-wrap gap-2">
                        <span className="text-sm font-black text-primary">₹{selectedItem.budget} Budget</span>
                        <Button
                          variant="primary"
                          size="sm"
                          className="px-4 py-1.5 text-xs font-bold"
                          onClick={() => {
                            addToast('Applying from Map Explorer...', 'success');
                            navigate('/dashboard/worker/jobs');
                          }}
                        >
                          View Details & Apply
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
export { MapExplorer };
