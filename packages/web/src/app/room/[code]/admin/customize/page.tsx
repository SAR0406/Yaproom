'use client';

import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { updateSettings } from '@/lib/roomActions';

export default function CustomizationPage() {
  return (
    <RoomLayout>
      {(room) => (
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Customization</h2>
          <p className="text-sm text-muted">Tune round speed and chaos without leaving the room.</p>

          <div className="grid gap-3 text-sm text-muted">
            <Input
              label="Round length (seconds)"
              type="number"
              value={String(room.settings.roundLengthSec)}
              onChange={(event) =>
                updateSettings({
                  ...room.settings,
                  roundLengthSec: Number(event.target.value) || room.settings.roundLengthSec
                })
              }
            />
            <Input
              label="Max players"
              type="number"
              value={String(room.settings.maxPlayers)}
              onChange={(event) =>
                updateSettings({
                  ...room.settings,
                  maxPlayers: Number(event.target.value) || room.settings.maxPlayers
                })
              }
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant={room.settings.anonymousMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() =>
                  updateSettings({ ...room.settings, anonymousMode: !room.settings.anonymousMode })
                }
              >
                Anonymous {room.settings.anonymousMode ? 'On' : 'Off'}
              </Button>
              <Button
                variant={room.settings.voiceEnabled ? 'primary' : 'secondary'}
                size="sm"
                onClick={() =>
                  updateSettings({ ...room.settings, voiceEnabled: !room.settings.voiceEnabled })
                }
              >
                Voice {room.settings.voiceEnabled ? 'On' : 'Off'}
              </Button>
              <Button
                variant={room.settings.autoRotate ? 'primary' : 'secondary'}
                size="sm"
                onClick={() =>
                  updateSettings({ ...room.settings, autoRotate: !room.settings.autoRotate })
                }
              >
                Auto-rotate {room.settings.autoRotate ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={room.settings.chaosLevel === level ? 'primary' : 'secondary'}
                  onClick={() => updateSettings({ ...room.settings, chaosLevel: level })}
                >
                  Chaos: {level}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </RoomLayout>
  );
}
