import fs from 'fs';
import { Bus, Agency } from './model.js';

const databasePath = 'data/';

export function writeAgencyToDatabase(agency) {
  const json = JSON.stringify(agency, null, 2); // 2 spaces for each indentation level.
  const path = databasePath + agency.shortName + '.json';

  // Create the database folder if it does not exist already.
  if (!fs.existsSync(databasePath)) {
    fs.mkdirSync(databasePath);
  }

  // Write the serialized Agency object to a JSON file.
  try {
    fs.writeFileSync(path, json);
  } catch(err) {
    console.error(err);
  }
}
