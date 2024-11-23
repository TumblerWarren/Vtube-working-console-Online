interface EnvUpdate {
  INPUT_CHOICE?: string;
  WHISPER_MODEL?: string;
  WHISPER_CHOICE?: string;
  CHATBOT_SERVICE?: string;
  TTS_CHOICE?: string;
  PYCHAI?: string;
  CHARECTER_KEY?: string;
  ngrok_url?: string;
  ELEVENLAB_KEY?: string;
  VOICE_MODEL?: string;
  VOICE_ID?: string;
}

class EnvService {
  async readEnvFile(): Promise<EnvUpdate> {
    try {
      const response = await fetch('/api/env');
      if (!response.ok) {
        throw new Error('Failed to read .env file');
      }
      const content = await response.text();
      return this.parseEnvContent(content);
    } catch (error) {
      console.error('Error reading .env file:', error);
      return {
        INPUT_CHOICE: 'Text',
        WHISPER_MODEL: 'base',
        WHISPER_CHOICE: 'TRANSCRIBE',
        CHATBOT_SERVICE: 'none',
        TTS_CHOICE: 'none',
        PYCHAI: '',
        CHARECTER_KEY: '',
        ngrok_url: '',
        ELEVENLAB_KEY: '',
        VOICE_MODEL: '',
        VOICE_ID: ''
      };
    }
  }

  private parseEnvContent(content: string): EnvUpdate {
    const result: EnvUpdate = {};

    content.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=').map(part => part.trim());
        if (key && value) {
          result[key as keyof EnvUpdate] = value;
        }
      }
    });

    return result;
  }

  private generateEnvContent(updates: EnvUpdate): string {
    let content = `#Enter your input choice || Speech or Text
INPUT_CHOICE=${updates.INPUT_CHOICE || 'Text'}`;

    if (updates.INPUT_CHOICE === 'Speech') {
      content += `\n\n#Enter your whisper model, see VRAM requirement for further details at whisper Github | tiny, base, small
WHISPER_MODEL=${updates.WHISPER_MODEL || 'base'}

#Want to speak in english or your native language | TRANSCRIBE, TRANSLATE
WHISPER_CHOICE=${updates.WHISPER_CHOICE || 'TRANSCRIBE'}`;
    }

    content += `\n\n#Enter your desired chatbot || oogabooga or betacharacter or local_llm or collab_llm
CHATBOT_SERVICE=${updates.CHATBOT_SERVICE || 'none'}

#Enter your Text to Speech Choice | ELEVENLABS or VOICEVOX(Japanese Only)
TTS_CHOICE=${updates.TTS_CHOICE || 'none'}`;

    if (updates.CHATBOT_SERVICE === 'betacharacter') {
      content += `\n\n#Enter your PyChai API
PYCHAI=${updates.PYCHAI || ''}
#Enter your charecter key
CHARECTER_KEY=${updates.CHARECTER_KEY || ''}`;
    } else if (updates.CHATBOT_SERVICE === 'collab_llm') {
      content += `\n\n#Enter the Ngrok URL which you have got from Google Collab.
ngrok_url=${updates.ngrok_url || ''}`;
    }

    if (updates.TTS_CHOICE === 'ELEVENLABS') {
      content += `\n\n#Enter your Elevenlabs Api key
ELEVENLAB_KEY=${updates.ELEVENLAB_KEY || ''}
#If you have selected Elevenlabs, enter you model of choice. You can see examples from Elevenlabs website.
VOICE_MODEL=${updates.VOICE_MODEL || ''}`;
    } else if (updates.TTS_CHOICE === 'VOICEVOX') {
      content += `\n\n#If you have selected Voicevox, enter the voice ID, you can find the voice id from docs VOICEVOX_HELP.
VOICE_ID=${updates.VOICE_ID || ''}`;
    }

    return content;
  }

  async updateEnv(updates: Partial<EnvUpdate>): Promise<void> {
    try {
      const currentEnv = await this.readEnvFile();
      const newContent = this.generateEnvContent({
        ...currentEnv,
        ...updates
      });

      const response = await fetch('/api/update-env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update .env file');
      }
    } catch (error) {
      console.error('Error updating .env file:', error);
      throw error;
    }
  }
}

export const envService = new EnvService();