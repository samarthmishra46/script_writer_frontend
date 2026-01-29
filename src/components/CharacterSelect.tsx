import React from 'react';
import { CHARACTER_IMAGES } from './characterImages';

interface CharacterSelectProps {
  onSelect: (character: { id: string; name: string; url: string }) => void;
  selectedCharacterId?: string;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, selectedCharacterId }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CHARACTER_IMAGES.map((user) => (
        <div
          key={user.id}
          className={`rounded-xl border-2 p-2 cursor-pointer transition-all ${
            selectedCharacterId === user.id ? 'border-blue-500' : 'border-gray-200'
          }`}
          onClick={() => onSelect(user)}
        >
          <img
            src={user.url}
            alt={user.name}
            className="w-full h-32 object-cover rounded-lg mb-2"
          />
          <div className="text-center text-sm font-medium">{user.name}</div>
        </div>
      ))}
    </div>
  );
};

export default CharacterSelect;
