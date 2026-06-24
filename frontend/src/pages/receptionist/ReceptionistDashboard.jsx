const ReceptionistDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Receptionist Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">Patient management</div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">Appointment scheduling</div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">Billing overview</div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
