import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
  'src/pages/FormsLibrary.tsx',
  'src/pages/Settings.tsx',
  'src/pages/FormView.tsx',
  'src/pages/FormFill.tsx',
  'src/pages/Dashboard.tsx',
  'src/components/FormUploader.tsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(
      /from ['"]\.\.\/context\/FormContext['"]/g,
      'from "../../hooks/useFormContext"'
    );
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
});

console.log('Import updates complete!');
