import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, User } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface Character {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  ethnicity: string;
  ageGroup: string;
  description: string;
  tags: string[];
}

interface CharacterData {
  male: Character[];
  female: Character[];
  total?: number;
}

const CharacterSelection: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [characters, setCharacters] = useState<CharacterData>({ male: [], female: [] });
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token); // Debug log
        
        const url = buildApiUrl(`api/ugc-ads/characters?recommended=true&productId=${id}`);
        console.log('Fetching from:', url); // Debug log
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.success) {
          setCharacters(data.characters);
        } else {
          setError(data.message || 'Failed to fetch characters');
        }
      } catch (err) {
        setError('Failed to fetch characters');
        console.error('Error fetching characters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [id]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  // Get all characters in a single array
  const allCharacters = [...(characters.male || []), ...(characters.female || [])];

  // Helper function to get gender from character ID
  const getCharacterGender = (characterId: string): 'male' | 'female' => {
    return characterId.startsWith('male') ? 'male' : 'female';
  };

  const handleContinue = async () => {
    if (!selectedCharacter) {
      setError('Please select a character');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`api/ugc-ads/${id}/select-character`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: selectedCharacter.id
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/ugc-ads/${id}/script-generation`);
      } else {
        setError(data.message || 'Failed to select character');
      }
    } catch (err) {
      setError('An error occurred while selecting the character');
      console.error('Error selecting character:', err);
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/ugc-ads')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to UGC Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Choose Your Character</h1>
              <p className="text-gray-600">
                Select a character who will present your product in the UGC video
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Product Uploaded</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-12"></div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-600">Character Selection</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-12"></div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-400">Script Generation</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Characters Overview */}
        <div className="mb-6">
          <p className="text-gray-600">
            Choose from {allCharacters.length} available characters ({characters.male?.length || 0} male, {characters.female?.length || 0} female)
          </p>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {allCharacters.map((character) => (
            <div
              key={character.id}
              className={`bg-white rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedCharacter?.id === character.id
                  ? 'ring-2 ring-purple-600 ring-offset-2'
                  : ''
              }`}
              onClick={() => handleCharacterSelect(character)}
            >
              {/* Character Image */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={buildApiUrl(character.imageUrl)}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
                {selectedCharacter?.id === character.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-6 w-6 text-purple-600 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Character Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{character.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {character.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Gender Badge */}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    getCharacterGender(character.id) === 'male' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {getCharacterGender(character.id) === 'male' ? 'Male' : 'Female'}
                  </span>
                </div>
                
                {/* Demographics */}
                <div className="mt-1 text-xs text-gray-500">
                  {character.ageGroup} • {character.ethnicity}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Character Summary */}
        {selectedCharacter && (
          <div className="bg-white rounded-lg p-6 shadow-md mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Character</h3>
            <div className="flex items-center space-x-4">
              <img
                src={buildApiUrl(selectedCharacter.imageUrl)}
                alt={selectedCharacter.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{selectedCharacter.name}</h4>
                <p className="text-sm text-gray-600 mb-1">{selectedCharacter.description}</p>
                <p className="text-xs text-gray-500">
                  {getCharacterGender(selectedCharacter.id)} • {selectedCharacter.ageGroup} • {selectedCharacter.ethnicity}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/ugc-ads')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedCharacter || submitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Selecting...</span>
              </>
            ) : (
              <span>Continue to Script Generation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;