import fs from 'fs';
import { Bus, Agency } from './model.js';

export const databasePath = 'data/';

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