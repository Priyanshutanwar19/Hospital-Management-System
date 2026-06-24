const DoctorDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Doctor Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">Today's appointments</div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">Patient history</div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">Availability summary</div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
