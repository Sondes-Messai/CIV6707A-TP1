import { Bus, Agency } from '../model.js';
import { loadAgencyFromDatabase, writeAgencyToDatabase } from '../database.js';

test('verifies database writing and reading integrity', () => {
  const fakeAgencyShortName = "__fake__agency__"

  const testBus = new Bus({ id: 432, 
    license: 20219, 
    make: 'NovaBus', 
    model: 'LFSe', 
    seatCount: 46, 
    standingCapacity: 30, 
    doorCount: 2, 
    accessCount: 2 
  });

  const testAgency = new Agency({ name: "Société de Transport de Test", 
    shortName: fakeAgencyShortName, 
    busInventory: [testBus]
  });

  // Write the fake agency to the database.
  writeAgencyToDatabase(testAgency);

  // Read the fake agency from the database.
  const testAgencyRead = loadAgencyFromDatabase(fakeAgencyShortName);

  // We expect testAgency and testAgencyRead to contain the same data.
  expect(testAgency).toMatchObject(testAgencyRead);
});
