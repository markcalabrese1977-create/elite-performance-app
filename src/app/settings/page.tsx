// src/app/settings/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Settings() {
  const [goal, setGoal] = useState('hypertrophy');
  const [experience, setExperience] = useState('beginner');
  const [isLoading, setIsLoading] = useState(true);

  // Load settings
  useEffect(() => {
    fetch('/api/user/settings')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setGoal(data.settings.goal);
          setExperience(data.settings.experience);
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setIsLoading(false));
  }, []);

  const save = async () => {
    const res = await fetch('/api/user/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, experience }),
    });

    if (res.ok) {
      toast.success("Settings saved!");
    } else {
      toast.error("Failed to save");
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <main className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Training Goal</label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hypertrophy">Muscle Growth</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="fat_loss">Fat Loss</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Experience Level</label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={save} className="w-full">
          Save Settings
        </Button>
      </Card>
    </main>
  );
}