import React, { useState, useRef } from 'react';
import { usePetStore, type Personality } from '../store/usePetStore';
import { petImageProcessor } from '../services/PetImageProcessor';

export const PetCreator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addProfile, setActivePet } = usePetStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState('My Pet');
  const [personality, setPersonality] = useState<Personality>('playful');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleCreate = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const processed = await petImageProcessor.process(file);
      
      // We will tell Electron to save the processed files later. 
      // For the MVP, we can just use the data URLs directly in the renderer state
      // (as long as it doesn't refresh) or pass them to electron to persist.
      // To fulfill "pets/{petId}/..." we should persist it. 
      const win = window as any;
      if (win.electronAPI && win.electronAPI.savePetAssets) {
        await win.electronAPI.savePetAssets(processed.id, processed.states);
      }

      const profile = {
        id: processed.id,
        name,
        // Assuming we serve them from a local protocol or just keep using data URL
        // If we save it to userData, we need a custom protocol to load it, or just use the data URL for MVP.
        // Let's use the first state's data URL as the profile image for now.
        image: processed.states['IDLE'], 
        personality,
        createdAt: Date.now(),
      };

      addProfile(profile);
      setActivePet(profile.id);
      
      // Store the states in window object or another store so PetRenderer can access them without fetching from disk in this MVP
      // In a real app, PetRenderer would fetch `file://.../pets/${profile.id}/${PetState}.png`
      (window as any)[`pet_assets_${profile.id}`] = processed.states;

      onClose();
    } catch (err) {
      console.error("Failed to process pet image", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Ensure this area receives mouse events
  const handleMouseEnter = () => {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 320,
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        color: 'white',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
        zIndex: 9999
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Create Pet</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Upload Photo</label>
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '100%', padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Choose Image
        </button>
      </div>

      {previewUrl && (
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, objectFit: 'contain' }} />
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Pet Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', background: '#2c3e50', color: 'white', border: '1px solid #7f8c8d', borderRadius: 6 }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Personality</label>
        <select 
          value={personality}
          onChange={(e) => setPersonality(e.target.value as Personality)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', background: '#2c3e50', color: 'white', border: '1px solid #7f8c8d', borderRadius: 6 }}
        >
          <option value="playful">Playful</option>
          <option value="lazy">Lazy</option>
          <option value="friendly">Friendly</option>
          <option value="mischievous">Mischievous</option>
        </select>
      </div>

      <button 
        onClick={handleCreate} 
        disabled={!file || isProcessing}
        style={{ 
          width: '100%', 
          padding: '12px', 
          background: (!file || isProcessing) ? '#7f8c8d' : '#2ecc71', 
          color: 'white', 
          border: 'none', 
          borderRadius: 6, 
          cursor: (!file || isProcessing) ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          marginTop: 10
        }}
      >
        {isProcessing ? 'Processing...' : 'Create Pet'}
      </button>
    </div>
  );
};
