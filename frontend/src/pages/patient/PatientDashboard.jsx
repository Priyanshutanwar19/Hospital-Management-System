const PatientDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Patient Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">Upcoming appointments</div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">Medical records</div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">Prescriptions</div>
      </div>
    </div>
  );
};

export default PatientDashboard;
