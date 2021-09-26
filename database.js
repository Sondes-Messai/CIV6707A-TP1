import fs from 'fs';
import path from 'path';
import { Bus, Agency } from './model.js';

export const databasePath = 'data/';

// Create a list of all currently stored agencies.
export const currentAgencies = [];

function loadCurrentAgencies() {
  if (!fs.existsSync(databasePath)) {
    // Return early (to avoid ENOENT error) if the 'data' directory does not exist.
    return;
  }

  const filesList = fs.readdirSync(databasePath);

  for (const filename of filesList) {
    if (path.extname(filename) !== '.json')
      continue;
    const agency = loadAgencyFromDatabase(filename.split('.')[0]);
    currentAgencies.push(agency);
  }
}

loadCurrentAgencies();

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

export function loadAgencyFromDatabase(agencyShortName) {
  const path = databasePath + agencyShortName + '.json';

  const json = fs.readFileSync(path);
  const agencyData = JSON.parse(json);

  const agency = new Agency(agencyData);

  // Now we must convert all plain JavaScript objects to 
  // objects of the class Bus. Is this the best way to do this?
  const convertedBusObjects = [];
  agency.busInventory.forEach((busObj, i) => {
    const bus = new Bus(busObj);
    convertedBusObjects.push(bus);
  });
  agency.busInventory = convertedBusObjects;

  return agency;
}