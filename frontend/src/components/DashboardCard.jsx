const DashboardCard = ({ title, value }) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-4 text-4xl font-semibold text-slate-900">{value}</p>
    </div>
  );
};

export default DashboardCard;
