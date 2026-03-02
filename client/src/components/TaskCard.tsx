import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const isCompleted = task.status === 'completed';

  return (
    <Card className={isCompleted ? 'opacity-70' : ''}>
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left — content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-medium text-sm leading-snug ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              <Badge variant={isCompleted ? 'secondary' : 'default'} className="text-xs capitalize">
                {task.status}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(task.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant={isCompleted ? 'outline' : 'default'}
              onClick={() => onToggle(task)}
            >
              {isCompleted ? 'Undo' : 'Complete'}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(task._id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
