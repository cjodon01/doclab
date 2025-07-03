import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export const RefreshButton = ({ onRefresh, isLoading = false }: RefreshButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRefresh}
      disabled={isLoading}
      className="gap-2"
    >
      <RefreshCw 
        size={16} 
        className={cn(
          "transition-transform",
          isLoading && "animate-spin"
        )} 
      />
      Refresh
    </Button>
  );
};