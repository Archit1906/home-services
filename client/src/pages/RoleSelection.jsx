import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, ChevronRight } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate('/auth', { state: { selectedRole: role } });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-white font-body overflow-hidden">
      {/* Homeowner Choice (Left/Top) */}
      <motion.div
        whileHover={{ flexGrow: 1.15 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        onClick={() => handleSelect('user')}
        className="relative flex-1 flex flex-col justify-center items-center text-center p-8 md:p-12 cursor-pointer bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 group border-b md:border-b-0 md:border-r border-white/10"
      >
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="z-10 flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-5 bg-white/10 rounded-3xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300"
          >
            <Users className="h-12 w-12 text-white" />
          </motion.div>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-3xl font-display font-black tracking-tight flex items-center justify-center gap-2">
              I want to Hire
              <ChevronRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
            </h2>
            <p className="text-sm text-blue-100/90 leading-relaxed font-medium">
              Post service jobs, search verified service workers, chat and hire local experts for home service.
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full border border-white/10 mt-2">
            Homeowner Account
          </span>
        </div>
      </motion.div>

      {/* Worker Choice (Right/Bottom) */}
      <motion.div
        whileHover={{ flexGrow: 1.15 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        onClick={() => handleSelect('worker')}
        className="relative flex-1 flex flex-col justify-center items-center text-center p-8 md:p-12 cursor-pointer bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 group"
      >
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="z-10 flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-5 bg-white/10 rounded-3xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300"
          >
            <Briefcase className="h-12 w-12 text-white" />
          </motion.div>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-3xl font-display font-black tracking-tight flex items-center justify-center gap-2">
              I want to Work
              <ChevronRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
              Create your service profile, receive real-time job matches, apply to work posts, and keep 100% of your earnings.
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full border border-white/10 mt-2">
            Service Pro Account
          </span>
        </div>
      </motion.div>
    </div>
  );
}
export { RoleSelection };
