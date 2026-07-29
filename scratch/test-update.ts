import { updateGuide, getGuides } from '../lib/sheets-db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testUpdate() {
  const guides = await getGuides();
  if (guides.length === 0) {
    console.log('No guides found');
    return;
  }
  
  const guideToEdit = guides[0];
  console.log('Editing guide:', guideToEdit.id, guideToEdit.title);
  
  try {
    const updated = await updateGuide(guideToEdit.id, {
      title: guideToEdit.title + ' (Edited)'
    });
    console.log('Update successful!', updated);
  } catch (err) {
    console.error('Update failed:', err);
  }
}

testUpdate();
