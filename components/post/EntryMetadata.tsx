import React from "react";
import { MapPin, Clock, User } from "lucide-react";

interface EntryMetadataProps {
  postCode: string;
  entryTime: string;
  diaryDate: string;
  signature: {
    officerName: string;
    rank: string;
    forceNumber: string;
  };
}

export default function EntryMetadata({ postCode, entryTime, diaryDate, signature }: EntryMetadataProps) {
  return (
    <div className="bg-slate-50 border-b border-gray-200 px-8 py-3 flex flex-wrap gap-6 text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-900">{postCode}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Clock className="w-4 h-4 text-gray-400" />
        <span>{new Date(entryTime).toLocaleTimeString()} • {new Date(diaryDate).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <User className="w-4 h-4 text-gray-400" />
        <span>Original: <span className="font-semibold text-gray-900">{signature.rank} {signature.officerName}</span></span>
      </div>
    </div>
  );
}