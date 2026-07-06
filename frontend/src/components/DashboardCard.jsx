const DashboardCard = ({ title, value }) => {
  return (
    <div className="group relative rounded-3xl bg-white p-6 border border-emerald-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      
      {/* Visual Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500/20 group-hover:bg-indigo-650 transition-colors duration-300"></div>
      
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      
      <div className="mt-4 flex justify-between items-baseline">
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
          {value}
        </p>
      </div>

    </div>
  );
};

export default DashboardCard;
