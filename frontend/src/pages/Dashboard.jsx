import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import ShiftForm from '../components/ShiftForm';
import ShiftTable from '../components/ShiftTable';
import WeeklyChart from '../components/WeeklyChart';
import WeeklyProgress from '../components/WeeklyProgress';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [shifts, setShifts] = useState([]);
  const [totalHours, setTotalHours] = useState('0.00');
  const [weekly, setWeekly] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [limit, setLimit] = useState(20);

  const loadAll = useCallback(async () => {
    try {
      const [{ data: s }, { data: w }] = await Promise.all([
        api.get('/shifts'),
        api.get('/shifts/weekly'),
      ]);
      setShifts(s.shifts);
      setTotalHours(s.totalHours);
      setWeekly(w.weekly);
      setCurrentWeek(w.currentWeekHours);
      setLimit(w.weeklyLimit);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-blue-900">My Dashboard</h2>
          <p className="text-slate-500">Track your hours and monitor your weekly progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon={Clock} label="Total Hours" value={totalHours} accent="blue" subtitle="All time" />
          <StatCard icon={TrendingUp} label="This Week" value={Number(currentWeek).toFixed(2)} accent="yellow" subtitle={`${limit} hr limit`} />
          <StatCard icon={Calendar} label="Total Shifts" value={shifts.length} accent="white" subtitle="Logged entries" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyProgress current={currentWeek} limit={limit} />
          <WeeklyChart data={weekly} />
        </div>

        <ShiftForm onAdded={loadAll} />
        <ShiftTable shifts={shifts} onDeleted={loadAll} />
      </main>
    </div>
  );
}
