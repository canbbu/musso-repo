
import React from 'react';
import { Button } from "@/components/ui/button";
import { SaveIcon, RefreshCw, Loader2 } from "lucide-react";

interface PlayerStatsFooterProps {
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
}

const PlayerStatsFooter = ({ saving, onSave, onReset }: PlayerStatsFooterProps) => {
  return (
    <div className="flex justify-between">
      <Button variant="outline" disabled={saving} onClick={onReset}>
        <RefreshCw className="h-4 w-4 mr-2" />
        초기화
      </Button>
      <Button onClick={onSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            저장 중...
          </>
        ) : (
          <>
            <SaveIcon className="h-4 w-4 mr-2" />
            기록 저장
          </>
        )}
      </Button>
    </div>
  );
};

export default PlayerStatsFooter;
