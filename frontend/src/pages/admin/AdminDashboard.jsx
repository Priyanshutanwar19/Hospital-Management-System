import DashboardCard from '../../components/DashboardCard';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard title="Doctors" value="28" />
        <DashboardCard title="Patients" value="134" />
        <DashboardCard title="Appointments" value="62" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">Analytics chart placeholder</div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">Recent activity placeholder</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
