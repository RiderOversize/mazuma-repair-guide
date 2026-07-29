import { updateGuide, getGuides, getModels } from '../lib/sheets-db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixModelIds() {
  const guides = await getGuides();
  const models = await getModels();
  if (guides.length === 0 || models.length === 0) return;
  
  const guideToEdit = guides[0];
  const modelToLink = models.find(m => m.categoryId === guideToEdit.categoryId) || models[0];
  
  console.log('Editing guide:', guideToEdit.id, guideToEdit.title);
  console.log('Linking model:', modelToLink.id);
  
  try {
    const updated = await updateGuide(guideToEdit.id, {
      modelIds: [modelToLink.id]
    });
    console.log('Update successful! Models linked:', updated.modelIds);
  } catch (err) {
    console.error('Update failed:', err);
  }
}

fixModelIds();
