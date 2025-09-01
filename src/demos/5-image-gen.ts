import { FreeModels } from "./Models";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
dotenv.config();

async function imageGen() {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: FreeModels.google["flash-2.5-image-preview"],// Replace with the model you want to use
    messages: [
      {
        role: 'user',
        content: 'Generate a beautiful sunset over mountains',
      },
    ],
    modalities: ['image', 'text'],
  }),
});

const result = await response.json();

// The generated image will be in the assistant message
if (result.choices) {
  const message = result.choices[0].message;
  if (message.images) {
    message.images.forEach((image: any, index: number) => {
      const imageUrl = image.image_url.url; // Base64 data URL
      console.log(`Generated image ${index + 1}: ${imageUrl.substring(0, 50)}...`);
      
      // Extract base64 data and save to file
      if (imageUrl.startsWith('data:image/')) {
        const matches = imageUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          const [, extension, base64Data] = matches;
          const buffer = Buffer.from(base64Data, 'base64');
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `generated-image-${timestamp}-${index + 1}.${extension}`;
          const filepath = path.join(process.cwd(), filename);
          
          fs.writeFileSync(filepath, buffer);
          console.log(`✅ Image saved to: ${filename}`);
        }
      }
    });
  }
}

}

imageGen().catch(console.error);